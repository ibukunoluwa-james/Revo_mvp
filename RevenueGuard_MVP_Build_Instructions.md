# Revo — MVP Build Instructions

> Build time: 5 days  
> Stack: Next.js 14 · PostgreSQL · Prisma · Termii SMS · Vercel · Supabase

---

## What you are building

Three pages. One API route. One database.

- **Collect page** — agent opens on phone, enters amount + payer phone, taps confirm
- **Dashboard page** — commissioner opens on laptop, sees all collections live
- **Login page** — PIN for agents, email/password for admin

---

## Prerequisites

Install these before you start:

- Node.js 20+ — [nodejs.org](https://nodejs.org)
- Git — [git-scm.com](https://git-scm.com)
- A [Vercel](https://vercel.com) account (free)
- A [Supabase](https://supabase.com) account (free)
- A [Termii](https://termii.com) account — get API key from dashboard

---

## Day 1 — Project setup and database

### 1.1 Create the Next.js app

```bash
npx create-next-app@latest revo \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"

cd revo
```

### 1.2 Install dependencies

```bash
npm install prisma @prisma/client
npm install jsonwebtoken @types/jsonwebtoken
npm install axios
npm install bcryptjs @types/bcryptjs
```

### 1.3 Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for it to provision (about 2 minutes)
3. Go to **Settings → Database**
4. Copy the **Connection string (URI)** — it looks like:
   `postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres`

### 1.4 Set up Prisma

```bash
npx prisma init
```

Open `prisma/schema.prisma` and replace everything with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Agent {
  id          String       @id @default(uuid())
  name        String
  phone       String       @unique
  pin         String
  active      Boolean      @default(true)
  createdAt   DateTime     @default(now())
  collections Collection[]
}

model Collection {
  id         String   @id @default(uuid())
  agentId    String
  agent      Agent    @relation(fields: [agentId], references: [id])
  streamName String
  amountKobo Int
  payerPhone String
  receiptRef String   @default(uuid())
  createdAt  DateTime @default(now())
}

model Admin {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
}
```

### 1.5 Create your `.env.local` file

Create `.env.local` in the root of the project:

```bash
DATABASE_URL="postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres"
JWT_SECRET="pick-any-long-random-string-here"
TERMII_API_KEY="your-termii-api-key"
TERMII_SENDER_ID="REVGUARD"
```

Replace the values with your actual credentials.

### 1.6 Push the schema to Supabase

```bash
npx prisma db push
```

You should see `Your database is now in sync with your Prisma schema.`

### 1.7 Seed the database with test data

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create test agents
  await prisma.agent.createMany({
    data: [
      { name: 'Emeka Obi',    phone: '08012345671', pin: await bcrypt.hash('1234', 10) },
      { name: 'Fatima Yusuf', phone: '08012345672', pin: await bcrypt.hash('1234', 10) },
      { name: 'Chidi Nwosu',  phone: '08012345673', pin: await bcrypt.hash('1234', 10) },
    ],
  });

  // Create admin account
  await prisma.admin.create({
    data: {
      email:    'admin@revo.ng',
      password: await bcrypt.hash('admin123', 10),
    },
  });

  console.log('Seed complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Add to `package.json`:

```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

Run the seed:

```bash
npm install -D ts-node
npx prisma db seed
```

---

## Day 2 — The collect screen and API route

### 2.1 Create the Prisma client singleton

Create `lib/db.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### 2.2 Create the SMS helper

Create `lib/sms.ts`:

```typescript
import axios from 'axios';

export const sendSMS = async (phone: string, message: string) => {
  // Normalise phone: 08012345678 → +2348012345678
  const normalised = phone.startsWith('0')
    ? '+234' + phone.slice(1)
    : phone;

  await axios.post('https://api.ng.termii.com/api/sms/send', {
    to:         normalised,
    from:       process.env.TERMII_SENDER_ID,
    sms:        message,
    type:       'plain',
    channel:    'generic',
    api_key:    process.env.TERMII_API_KEY,
  });
};
```

### 2.3 Create the collect API route

Create `app/api/collect/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendSMS } from '@/lib/sms';

export async function POST(req: NextRequest) {
  try {
    const { agentId, streamName, amountNaira, payerPhone } = await req.json();

    // Basic validation
    if (!agentId || !streamName || !amountNaira || !payerPhone) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    if (isNaN(parseInt(amountNaira)) || parseInt(amountNaira) <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Write to database
    const collection = await prisma.collection.create({
      data: {
        agentId,
        streamName,
        amountKobo: parseInt(amountNaira) * 100,
        payerPhone,
      },
      include: { agent: true },
    });

    // Send SMS to taxpayer — fire and forget
    const smsText =
      `Revo: Payment of N${amountNaira} for ${streamName} received. ` +
      `Receipt ID: ${collection.receiptRef.slice(0, 8).toUpperCase()}. ` +
      `Keep this as proof of payment.`;

    sendSMS(payerPhone, smsText).catch(err =>
      console.error('SMS failed:', err.message)
    );

    return NextResponse.json({
      receiptRef: collection.receiptRef.slice(0, 8).toUpperCase(),
      agentName:  collection.agent.name,
      amount:     amountNaira,
      streamName,
      payerPhone,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

### 2.4 Build the collect page

Create `app/collect/page.tsx`:

```typescript
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const STREAMS = ['Market Levy', 'Business Permit', 'Street Trading', 'Signage Fee'];

interface Receipt {
  receiptRef: string;
  agentName:  string;
  amount:     string;
  streamName: string;
  payerPhone: string;
}

export default function CollectPage() {
  const router  = useRouter();
  const [agentId, setAgentId]   = useState('');
  const [form, setForm]         = useState({ stream: STREAMS[0], amount: '', phone: '' });
  const [loading, setLoading]   = useState(false);
  const [receipt, setReceipt]   = useState<Receipt | null>(null);
  const [error, setError]       = useState('');

  useEffect(() => {
    const id = localStorage.getItem('agentId');
    if (!id) router.push('/login');
    else setAgentId(id);
  }, []);

  const submit = async () => {
    setError('');
    if (!form.amount || !form.phone) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/collect', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          agentId,
          streamName:  form.stream,
          amountNaira: form.amount,
          payerPhone:  form.phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setReceipt(data);
    } catch {
      setError('Connection error. Check your internet and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (receipt) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
          <div className="text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-green-700 mb-1">Collection Recorded</h1>
          <p className="text-gray-500 text-sm mb-6">SMS sent to taxpayer</p>

          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6">
            <Row label="Receipt"  value={receipt.receiptRef} />
            <Row label="Amount"   value={`₦${parseInt(receipt.amount).toLocaleString()}`} />
            <Row label="Type"     value={receipt.streamName} />
            <Row label="Payer"    value={receipt.payerPhone} />
          </div>

          <button
            onClick={() => { setReceipt(null); setForm({ ...form, amount: '', phone: '' }); }}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold"
          >
            New Collection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold text-gray-800 mb-6">Record Collection</h1>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Revenue Type</label>
            <select
              value={form.stream}
              onChange={e => setForm({ ...form, stream: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-800"
            >
              {STREAMS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
            <input
              type="number"
              placeholder="e.g. 500"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payer Phone</label>
            <input
              type="tel"
              placeholder="e.g. 08012345678"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-800"
            />
          </div>

          <button
            onClick={submit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? 'Recording...' : 'Confirm Collection'}
          </button>
        </div>
      </div>
    </div>
  );
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between text-sm">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-800">{value}</span>
  </div>
);
```

---

## Day 3 — Login and authentication

### 3.1 Create the auth API routes

Create `app/api/auth/agent/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  const { phone, pin } = await req.json();

  const agent = await prisma.agent.findUnique({ where: { phone } });
  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 401 });
  }

  const valid = await bcrypt.compare(pin, agent.pin);
  if (!valid) {
    return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 });
  }

  const token = jwt.sign(
    { sub: agent.id, name: agent.name, role: 'agent' },
    process.env.JWT_SECRET!,
    { expiresIn: '30d' }
  );

  return NextResponse.json({ token, agentId: agent.id, name: agent.name });
}
```

Create `app/api/auth/admin/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = jwt.sign(
    { sub: admin.id, role: 'admin' },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );

  const res = NextResponse.json({ success: true });
  res.cookies.set('admin_token', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    maxAge:   60 * 60 * 24 * 7,
    path:     '/',
  });

  return res;
}
```

### 3.2 Build the login page

Create `app/login/page.tsx`:

```typescript
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [tab,      setTab]      = useState<'agent' | 'admin'>('agent');
  const [phone,    setPhone]    = useState('');
  const [pin,      setPin]      = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const loginAgent = async () => {
    setError('');
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/agent', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone, pin }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }

      localStorage.setItem('agentId',   data.agentId);
      localStorage.setItem('agentName', data.name);
      router.push('/collect');
    } finally { setLoading(false); }
  };

  const loginAdmin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/admin', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push('/dashboard');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Revo</h1>
        <p className="text-gray-500 text-sm mb-6">Nigeria's revenue collection platform</p>

        {/* Tab toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          {(['agent', 'admin'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors
                ${tab === t ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
            >
              {t === 'agent' ? 'Field Agent' : 'State Admin'}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>
        )}

        {tab === 'agent' ? (
          <div className="space-y-4">
            <input
              type="tel" placeholder="Phone number (08XXXXXXXXX)"
              value={phone} onChange={e => setPhone(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3"
            />
            <input
              type="password" placeholder="PIN"
              value={pin} onChange={e => setPin(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3"
            />
            <button
              onClick={loginAgent} disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <input
              type="email" placeholder="Email address"
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3"
            />
            <input
              type="password" placeholder="Password"
              value={password} onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3"
            />
            <button
              onClick={loginAdmin} disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Day 4 — The dashboard

### 4.1 Create the dashboard API route

Create `app/api/dashboard/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [collections, allTime] = await Promise.all([
    // Today's collections with agent names
    prisma.collection.findMany({
      where:   { createdAt: { gte: today } },
      include: { agent: true },
      orderBy: { createdAt: 'desc' },
    }),
    // All-time total
    prisma.collection.aggregate({
      _sum: { amountKobo: true },
    }),
  ]);

  const todayTotal    = collections.reduce((sum, c) => sum + c.amountKobo, 0) / 100;
  const allTimeTotal  = (allTime._sum.amountKobo ?? 0) / 100;
  const agentCount    = new Set(collections.map(c => c.agentId)).size;

  return NextResponse.json({
    todayTotal,
    allTimeTotal,
    agentCount,
    collections: collections.map(c => ({
      id:         c.id,
      agentName:  c.agent.name,
      streamName: c.streamName,
      amount:     c.amountKobo / 100,
      payerPhone: c.payerPhone,
      receiptRef: c.receiptRef.slice(0, 8).toUpperCase(),
      time:       c.createdAt.toLocaleTimeString('en-NG', {
        hour: '2-digit', minute: '2-digit',
      }),
    })),
  });
}
```

### 4.2 Build the dashboard page

Create `app/dashboard/page.tsx`:

```typescript
'use client';
import { useEffect, useState } from 'react';

interface Collection {
  id:         string;
  agentName:  string;
  streamName: string;
  amount:     number;
  payerPhone: string;
  receiptRef: string;
  time:       string;
}

interface Stats {
  todayTotal:   number;
  allTimeTotal: number;
  agentCount:   number;
  collections:  Collection[];
}

export default function DashboardPage() {
  const [stats, setStats]     = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const res  = await fetch('/api/dashboard');
    const data = await res.json();
    setStats(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Revo</h1>
          <p className="text-gray-500 text-sm">
            {new Date().toLocaleDateString('en-NG', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Collected Today"
            value={`₦${stats!.todayTotal.toLocaleString()}`}
            color="blue"
          />
          <StatCard
            label="All Time"
            value={`₦${stats!.allTimeTotal.toLocaleString()}`}
            color="green"
          />
          <StatCard
            label="Active Agents"
            value={stats!.agentCount.toString()}
            color="purple"
          />
        </div>

        {/* Transactions table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">
              Today's Collections ({stats!.collections.length})
            </h2>
            <button
              onClick={fetchData}
              className="text-sm text-blue-600 hover:underline"
            >
              Refresh
            </button>
          </div>

          {stats!.collections.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              No collections recorded today yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    {['Time', 'Agent', 'Type', 'Amount', 'Payer', 'Receipt'].map(h => (
                      <th key={h} className="px-6 py-3 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats!.collections.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-500">{c.time}</td>
                      <td className="px-6 py-4 font-medium text-gray-800">{c.agentName}</td>
                      <td className="px-6 py-4 text-gray-600">{c.streamName}</td>
                      <td className="px-6 py-4 font-semibold text-green-700">
                        ₦{c.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{c.payerPhone}</td>
                      <td className="px-6 py-4 font-mono text-gray-400">{c.receiptRef}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

const colors = {
  blue:   'bg-blue-50 text-blue-700',
  green:  'bg-green-50 text-green-700',
  purple: 'bg-purple-50 text-purple-700',
};

const StatCard = ({ label, value, color }: {
  label: string; value: string; color: keyof typeof colors;
}) => (
  <div className={`rounded-2xl p-6 ${colors[color]}`}>
    <p className="text-sm font-medium opacity-70 mb-1">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);
```

---

## Day 5 — Final wiring and deploy

### 5.1 Set the home page redirect

Replace `app/page.tsx` with:

```typescript
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login');
}
```

### 5.2 Test everything locally

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

Run through this checklist:

- [ ] Login page loads at `/login`
- [ ] Agent tab: log in with phone `08012345671` and PIN `1234`
- [ ] Collect page loads, submit a test collection
- [ ] Receipt screen appears with a receipt ID
- [ ] Admin tab: log in with `admin@revo.ng` / `admin123`
- [ ] Dashboard shows the test collection you just created
- [ ] Dashboard auto-refreshes every 30 seconds

### 5.3 Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Follow the prompts. When asked about environment variables, add:

```
DATABASE_URL        → your Supabase connection string
JWT_SECRET          → your random secret string
TERMII_API_KEY      → your Termii API key
TERMII_SENDER_ID    → REVGUARD
```

After deploy, Vercel gives you a URL like `revo.vercel.app`. That is your live app.

### 5.4 Test on a real phone

Open the Vercel URL on an Android phone. Log in as an agent. Record a collection with a real phone number you control. Confirm you receive the SMS.

---

## What you have at the end of the week

| Feature | Status |
|---|---|
| Agent logs in with phone + PIN | ✓ |
| Agent records a collection | ✓ |
| Taxpayer receives SMS instantly | ✓ |
| Receipt ID generated and shown | ✓ |
| Dashboard shows all collections live | ✓ |
| Dashboard auto-refreshes | ✓ |
| Works on any phone browser | ✓ |
| Live on the internet | ✓ |

---

## Credentials for demo

| Role | Login | Password |
|---|---|---|
| Field Agent 1 | 08012345671 | PIN: 1234 |
| Field Agent 2 | 08012345672 | PIN: 1234 |
| Field Agent 3 | 08012345673 | PIN: 1234 |
| State Admin | admin@revo.ng | admin123 |

**Change these before any real usage.**

---

## What to build next after this

Once the demo is working and you have a state government interested:

1. Add GPS coordinates to the collection record
2. Add agent daily summary screen
3. Add simple anomaly flags — zero collections on a market day
4. Add NIBSS settlement via sponsor bank
5. Add SFTAS monthly report export
6. Replace the Metabase-style table with charts

---

*Revo MVP — James Ibukunoluwa | Covenant University | 2026*
