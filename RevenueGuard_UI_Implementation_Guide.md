# Revo — UI Implementation Guide

> How each screen is structured, what each component does, and exactly how to build it in Next.js + Tailwind.

---

## Colour tokens

Every colour in the UI traces back to the pitch deck palette. Define these once in your Tailwind config and reference them everywhere.

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        rg: {
          navy:        '#0A2342',  // sidebar, primary buttons, headers
          'navy-mid':  '#0F2035',  // sidebar hover states
          blue:        '#1D6FA4',  // info accents, stat bar (agents)
          teal:        '#0D7377',  // success, synced, live indicator
          'teal-light':'#1ABFBF',  // teal text on light backgrounds
          gold:        '#C9A84C',  // brand accent, sidebar logo, active nav
          'gold-text': '#7A5C10',  // gold text on white backgrounds
          'gold-bg':   '#FAF6EC',  // gold tinted card backgrounds
          'gold-border':'#E8D8A5', // gold card borders
          orange:      '#C55A11',  // warning, flags, anomalies
          'orange-bg': '#FDF3EB',  // orange tinted alert backgrounds
          page:        '#F7F9FB',  // main content area background
          border:      '#DDE1E7',  // default card and input borders
          'border-light':'#EEF0F3',// table row dividers
          'text-primary':  '#0F1923', // headings and body copy
          'text-secondary':'#4A5568', // secondary labels
          'text-muted':    '#8F99A5', // hints, timestamps, labels
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    }
  }
}
```

---

## Shared layout components

Every screen uses the same two structural components: a sidebar and a topbar. Build these once.

### Sidebar

The sidebar is `210px` wide, `background-rg-navy`, and never scrolls. It has four zones stacked vertically using `flex flex-col h-full`.

**Zone 1 — Brand header**

```tsx
// components/Sidebar.tsx
<div className="px-5 py-5 border-b border-white/[0.07]">
  <p className="text-rg-gold font-medium text-[14px] tracking-wide">
    Revo
  </p>
  <p className="text-white/35 text-[11px] mt-0.5 uppercase tracking-widest">
    {context}  {/* "Field agent portal" or "Anambra State IRS" */}
  </p>
</div>
```

**Zone 2 — Navigation**

Navigation items use a consistent pattern. The active item gets a gold tinted background and a subtle gold border. Everything else is muted white that brightens on hover.

```tsx
const NavItem = ({ icon, label, active, badge, href }) => (
  <Link href={href}
    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-[7px] text-[13px]
      mb-0.5 transition-colors
      ${active
        ? 'bg-rg-gold/[0.14] text-rg-gold border border-rg-gold/[0.22]'
        : 'text-white/50 hover:bg-white/[0.05] hover:text-white/80'
      }`}
  >
    <i className={`ti ${icon} text-[15px]`} aria-hidden="true" />
    <span className="flex-1">{label}</span>
    {badge && (
      <span className="bg-rg-orange/30 text-orange-300 text-[10px]
        px-1.5 py-px rounded-full">
        {badge}
      </span>
    )}
  </Link>
)
```

Section labels above groups of nav items:

```tsx
<p className="text-white/25 text-[10px] uppercase tracking-[.1em]
  px-2.5 pt-2 pb-1.5 mt-1">
  {label}
</p>
```

**Zone 3 — flex-1 spacer**

The `<nav>` wrapper gets `flex-1` so it pushes the user footer to the bottom.

**Zone 4 — User footer**

```tsx
<div className="px-4 py-4 border-t border-white/[0.07] flex items-center gap-2.5">
  <div className="w-8 h-8 rounded-full bg-rg-gold/[0.18] border border-rg-gold/[0.28]
    flex items-center justify-center text-rg-gold text-[11px] font-medium flex-shrink-0">
    {initials}
  </div>
  <div>
    <p className="text-white/80 text-[12px] font-medium">{name}</p>
    <p className="text-white/30 text-[11px]">{role}</p>
  </div>
</div>
```

**Positioning the sidebar in the layout**

```tsx
// app/layout.tsx (or per-section layout)
<div className="flex min-h-screen">
  <Sidebar />                          {/* fixed 210px width */}
  <div className="flex-1 flex flex-col min-w-0">
    <Topbar />
    <main className="flex-1 bg-rg-page p-6">
      {children}
    </main>
  </div>
</div>
```

---

### Topbar

`height: 54px`, `background-white`, `border-b border-rg-border`. Uses `flex items-center justify-between px-6`.

Left side holds the page title. Right side holds action buttons and status pills.

```tsx
// components/Topbar.tsx
<header className="h-[54px] bg-white border-b border-rg-border
  flex items-center justify-between px-6 flex-shrink-0">
  <div>
    <p className="text-[15px] font-medium text-rg-text-primary">{title}</p>
  </div>
  <div className="flex items-center gap-2">
    {/* Live pill */}
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
      bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-rg-teal" />
      Live · auto-refresh 30s
    </span>
    {/* Action buttons */}
    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[7px]
      border border-rg-border bg-white text-[12px] text-rg-text-secondary">
      <i className="ti ti-download text-[13px]" aria-hidden="true" />
      Export
    </button>
    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[7px]
      bg-rg-navy text-white text-[12px] font-medium">
      <i className="ti ti-file-text text-[13px]" aria-hidden="true" />
      SFTAS report
    </button>
  </div>
</header>
```

---

## Screen 1 — Login

### Layout

The login screen does not use the sidebar + topbar layout. It is a standalone full-viewport page.

The outer wrapper is `min-h-screen flex items-center justify-center bg-rg-page`. Inside sits a single card split into two columns: `grid grid-cols-[340px_1fr]`.

```
┌─────────────────────────────────────────────────────┐
│  LEFT PANEL (340px)       │  RIGHT PANEL (flex-1)   │
│  bg-rg-navy               │  bg-white               │
│                           │                         │
│  Brand + tagline          │  Page heading           │
│  Stats block              │  Tab toggle             │
│                           │  Form fields            │
│  Footer note              │  Submit button          │
└─────────────────────────────────────────────────────┘
```

### Left panel

`background-rg-navy padding-10`. Content sits in a flex column with `justify-between h-full`.

```tsx
<div className="bg-rg-navy p-10 flex flex-col justify-between">
  <div>
    <p className="text-rg-gold font-medium text-lg tracking-wide">Revo</p>
    <p className="text-white/35 text-[11px] uppercase tracking-widest mt-1">
      Revenue intelligence platform
    </p>
    <div className="h-px bg-white/[0.08] my-7" />
    <h1 className="text-white text-[26px] font-medium leading-snug mb-3">
      Recovering Nigeria's lost revenue — one state at a time.
    </h1>
    <p className="text-white/50 text-[13px] leading-relaxed">
      Every collection creates an instant, tamper-proof digital record.
      The taxpayer receives SMS confirmation directly.
    </p>

    {/* Stats block */}
    <div className="mt-8 p-5 bg-white/[0.04] rounded-[10px] border border-white/[0.07]">
      <p className="text-rg-gold text-[28px] font-medium leading-none">₦3.63T</p>
      <p className="text-white/38 text-[11px] mt-1 leading-snug">
        State IGR collected nationally in 2024
      </p>
      <p className="text-rg-teal-light text-[28px] font-medium leading-none mt-4">40–60%</p>
      <p className="text-white/38 text-[11px] mt-1 leading-snug">
        Estimated uncollected revenue potential
      </p>
    </div>
  </div>
  <p className="text-white/22 text-[11px] tracking-wide">Confidential · Demo build · 2026</p>
</div>
```

### Right panel — tab toggle

The tab toggle switches between field agent and state admin login forms. Use `useState` to control which form is active.

```tsx
const [tab, setTab] = useState<'agent' | 'admin'>('agent')

<div className="flex bg-rg-page rounded-[9px] p-[3px] gap-[3px] mb-7">
  {(['agent', 'admin'] as const).map(t => (
    <button
      key={t}
      onClick={() => setTab(t)}
      className={`flex-1 py-2 rounded-[7px] text-[13px] font-medium transition-all
        ${tab === t
          ? 'bg-white text-rg-navy border border-rg-border'
          : 'text-rg-text-muted bg-transparent'
        }`}
    >
      {t === 'agent' ? 'Field agent' : 'State admin'}
    </button>
  ))}
</div>
```

### Right panel — PIN input

The PIN field renders as six individual boxes rather than a text input. This is purely visual — the actual input is a hidden `<input type="password">` that collects keystrokes, and the boxes reflect how many characters have been entered.

```tsx
const [pin, setPin] = useState('')

<div className="relative">
  {/* Hidden real input */}
  <input
    type="password"
    maxLength={6}
    value={pin}
    onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
    className="sr-only"
    autoFocus
  />
  {/* Visual boxes */}
  <div className="flex gap-2 cursor-text" onClick={() => inputRef.current?.focus()}>
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className={`w-[42px] h-[42px] rounded-[8px] border flex items-center
          justify-center transition-colors
          ${i < pin.length
            ? 'bg-rg-navy border-rg-navy'   // filled
            : 'bg-rg-page border-rg-border' // empty
          }`}
      >
        {i < pin.length && (
          <div className="w-2.5 h-2.5 rounded-full bg-white" />
        )}
      </div>
    ))}
  </div>
</div>
```

### Positioning summary

| Element | Class pattern |
|---|---|
| Outer wrapper | `min-h-screen flex items-center justify-center bg-rg-page p-4` |
| Card | `grid grid-cols-[340px_1fr] rounded-2xl overflow-hidden border border-rg-border w-full max-w-[820px]` |
| Left panel | `bg-rg-navy p-10 flex flex-col justify-between` |
| Right panel | `bg-white p-11 flex flex-col justify-center` |

---

## Screen 2 — Collect screen

### Layout

The collect screen uses the standard sidebar + topbar shell, then a two-column content grid inside `<main>`.

```
┌─ Sidebar (210px) ─┬─────────────────────────────────────────────┐
│                   │  Topbar                                     │
│  Nav items        ├──────────────────────┬──────────────────────┤
│                   │  LEFT (flex-1)       │  RIGHT (340px)       │
│                   │                      │                      │
│                   │  Collection form     │  Last receipt card   │
│                   │  card                │                      │
│                   │                      │  Daily summary card  │
│  User footer      │                      │                      │
└───────────────────┴──────────────────────┴──────────────────────┘
```

Main content grid:

```tsx
<main className="flex-1 bg-rg-page p-6">
  <div className="grid grid-cols-[1fr_340px] gap-5 h-full">
    <CollectForm />
    <RightPanel />
  </div>
</main>
```

### Collection form card

The card is `bg-white rounded-xl border border-rg-border p-6`. Inside, the fields are stacked vertically with `space-y-4`.

The amount and payer phone fields sit side by side using `grid grid-cols-2 gap-3`.

```tsx
<div className="bg-white rounded-xl border border-rg-border p-6">
  <p className="text-[14px] font-medium text-rg-text-primary mb-5">Collection details</p>

  {/* Revenue type — full width */}
  <FormField label="Revenue type">
    <select className="w-full bg-rg-page border border-rg-border rounded-[8px]
      px-3 py-2.5 text-[14px] text-rg-text-primary outline-none
      focus:border-rg-blue focus:bg-white appearance-none">
      <option>Market Levy</option>
      <option>Business Permit</option>
      <option>Street Trading</option>
      <option>Signage Fee</option>
    </select>
  </FormField>

  {/* Amount + Phone — side by side */}
  <div className="grid grid-cols-2 gap-3 mt-4">
    <FormField label="Amount (₦)">
      <input type="number" className="field-input" placeholder="0" />
    </FormField>
    <FormField label="Payer phone">
      <input type="tel" className="field-input" placeholder="08XXXXXXXXX" />
    </FormField>
  </div>

  <p className="text-[11px] text-rg-text-muted mt-2">
    SMS receipt fires directly to the payer — not via you.
  </p>

  <hr className="border-rg-border-light my-5" />

  {/* SMS confirmation strip */}
  <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-emerald-50
    rounded-[8px] border border-emerald-200 mb-4 text-[12px] text-emerald-800">
    <i className="ti ti-send text-[15px] text-rg-teal flex-shrink-0" aria-hidden="true" />
    SMS confirmation will fire to {payerPhone} the moment you confirm.
  </div>

  {/* Total box */}
  <div className="flex items-center justify-between px-4 py-3.5
    bg-rg-gold-bg rounded-[9px] border border-rg-gold-border mb-4">
    <p className="text-[13px] text-amber-900">Amount to collect</p>
    <p className="text-[22px] font-medium text-rg-gold-text">
      ₦{amount.toLocaleString()}
    </p>
  </div>

  <button className="w-full py-3 rounded-[9px] bg-rg-navy text-white
    text-[14px] font-medium">
    Confirm and record collection
  </button>
  <button className="w-full py-2.5 rounded-[9px] border border-rg-border
    bg-white text-[13px] text-rg-text-secondary mt-2">
    Clear form
  </button>
</div>
```

### FormField wrapper component

Used consistently for every label + input pair:

```tsx
const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-[11px] font-medium text-rg-text-secondary
      uppercase tracking-[.07em] mb-1.5">
      {label}
    </label>
    {children}
  </div>
)
```

### Right panel — receipt card

The receipt card shows the previous collection. It sits in a `flex flex-col gap-3` column on the right.

```tsx
<div className="bg-white rounded-xl border border-rg-border p-5">
  <p className="text-[11px] font-medium text-rg-text-muted uppercase
    tracking-[.05em] mb-3">Last receipt</p>

  {/* Check circle */}
  <div className="w-11 h-11 rounded-full bg-emerald-50 border-[1.5px]
    border-rg-teal flex items-center justify-center mx-auto mb-3">
    <i className="ti ti-check text-rg-teal text-[18px]" aria-hidden="true" />
  </div>

  <p className="text-[15px] font-medium text-rg-text-primary text-center mb-0.5">
    Collection recorded
  </p>
  <p className="text-[12px] text-rg-text-muted text-center mb-4">
    SMS sent to taxpayer · {time}
  </p>

  {/* Receipt ID block */}
  <div className="text-center px-4 py-3 bg-rg-gold-bg rounded-[8px]
    border border-rg-gold-border mb-3.5">
    <p className="text-[10px] text-amber-700 uppercase tracking-[.1em] mb-1">Receipt ID</p>
    <p className="text-[22px] font-medium text-rg-gold-text tracking-widest font-mono">
      {receiptId}
    </p>
  </div>

  {/* Detail rows */}
  {[
    { label: 'Amount',  value: `₦${amount}`, gold: true },
    { label: 'Type',    value: streamName },
    { label: 'Payer',   value: payerPhone },
    { label: 'Status',  value: 'Synced', teal: true },
  ].map(({ label, value, gold, teal }) => (
    <div key={label} className="flex justify-between py-2
      border-b border-rg-border-light last:border-0 text-[13px]">
      <span className="text-rg-text-muted">{label}</span>
      <span className={`font-medium ${gold ? 'text-rg-gold-text' : teal ? 'text-rg-teal' : 'text-rg-text-primary'}`}>
        {value}
      </span>
    </div>
  ))}
</div>
```

### Right panel — daily summary card

Sits below the receipt card. Two stat boxes in a `grid grid-cols-2 gap-2`:

```tsx
<div className="bg-white rounded-xl border border-rg-border p-5">
  <p className="text-[11px] font-medium text-rg-text-muted uppercase
    tracking-[.05em] mb-3">Today</p>
  <div className="grid grid-cols-2 gap-2">
    <div className="bg-rg-page rounded-[8px] p-3 border border-rg-border">
      <p className="text-[18px] font-medium text-rg-gold-text">
        ₦{todayTotal.toLocaleString()}
      </p>
      <p className="text-[11px] text-rg-text-muted mt-0.5 uppercase tracking-wide">
        Collected
      </p>
    </div>
    <div className="bg-rg-page rounded-[8px] p-3 border border-rg-border">
      <p className="text-[18px] font-medium text-rg-text-primary">{txCount}</p>
      <p className="text-[11px] text-rg-text-muted mt-0.5 uppercase tracking-wide">
        Transactions
      </p>
    </div>
  </div>
</div>
```

---

## Screen 3 — Dashboard

### Layout

Same sidebar + topbar shell as the collect screen. Content area is `bg-rg-page p-6` with a vertical stack of components.

```
┌─ Sidebar (210px) ─┬─────────────────────────────────────────────────────┐
│                   │  Topbar (title + live pill + export + SFTAS)        │
│                   ├─────────────────────────────────────────────────────┤
│                   │  Date row                                           │
│                   │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐             │
│                   │  │ Stat │ │ Stat │ │ Stat │ │ Stat │             │
│                   │  └──────┘ └──────┘ └──────┘ └──────┘             │
│                   │  ┌─────────────────────────────────────────────┐   │
│                   │  │  Transactions table                         │   │
│                   │  │  header · table rows · footer pagination    │   │
│                   │  └─────────────────────────────────────────────┘   │
│                   │  ┌─────────────────────────────────────────────┐   │
│                   │  │  Anomaly flag alert bar                     │   │
│                   │  └─────────────────────────────────────────────┘   │
└───────────────────┴─────────────────────────────────────────────────────┘
```

### Stat cards

Four cards in `grid grid-cols-4 gap-3 mb-5`. Each card has a 3px coloured top strip that signals which metric it belongs to.

```tsx
const StatCard = ({ label, value, change, changeType, accentColor }) => (
  <div className="bg-white rounded-[10px] border border-rg-border overflow-hidden">
    {/* Coloured top bar — 3px, no border-radius on top because card clips it */}
    <div className={`h-[3px] ${accentColor}`} />
    <div className="p-4">
      <p className="text-[11px] text-rg-text-muted uppercase tracking-[.06em] mb-2">
        {label}
      </p>
      <p className={`text-[24px] font-medium leading-none ${valueColor}`}>{value}</p>
      <p className={`text-[11px] mt-1.5 ${changeColor}`}>{change}</p>
    </div>
  </div>
)
```

Accent colours map to brand tokens:

| Card | Top bar class | Value colour |
|---|---|---|
| Collected today | `bg-rg-gold` | `text-rg-gold-text` |
| This month | `bg-rg-teal` | `text-emerald-800` |
| Active agents | `bg-rg-blue` | `text-blue-900` |
| Open flags | `bg-rg-orange` | `text-amber-900` |

### Transactions table

The table lives inside a `bg-white rounded-xl border border-rg-border overflow-hidden` wrapper.

**Table header** — `flex items-center justify-between px-5 py-3.5 border-b border-rg-border-light`

**Column widths** — set via `<colgroup>` to prevent layout shifts when data changes:

```tsx
<colgroup>
  <col className="w-[22%]" />   {/* Agent */}
  <col className="w-[18%]" />   {/* Revenue type */}
  <col className="w-[13%]" />   {/* Amount */}
  <col className="w-[17%]" />   {/* Payer */}
  <col className="w-[14%]" />   {/* Receipt ID */}
  <col className="w-[9%]"  />   {/* Time */}
  <col className="w-[7%]"  />   {/* Status */}
</colgroup>
```

**Table head row** — `bg-rg-page` background, `text-[11px] uppercase text-rg-text-muted tracking-[.06em]`

**Agent cell** — avatar + name in a `flex items-center gap-2`:

```tsx
const AgentCell = ({ initials, name, flagged }) => (
  <div className="flex items-center gap-2">
    <div className={`w-7 h-7 rounded-full flex items-center justify-center
      text-[11px] font-medium flex-shrink-0
      ${flagged
        ? 'bg-amber-50 text-amber-800'
        : 'bg-slate-100 text-slate-700'
      }`}>
      {initials}
    </div>
    <span>{name}</span>
  </div>
)
```

**Revenue type badge** — `inline-block px-2 py-px rounded text-[11px] font-medium bg-emerald-50 text-emerald-800`

**Amount cell** — `font-medium text-rg-gold-text`

**Receipt ID cell** — `font-mono text-[12px] text-rg-text-muted tracking-wide`

**Status cell — synced:**

```tsx
<span className="inline-flex items-center gap-1 text-[11px]
  font-medium text-emerald-800">
  <i className="ti ti-check text-[11px]" aria-hidden="true" />
  Synced
</span>
```

**Status cell — flagged:**

```tsx
<span className="inline-flex items-center gap-1 px-2 py-px rounded
  text-[11px] font-medium bg-amber-50 text-amber-800">
  <i className="ti ti-alert-triangle text-[11px]" aria-hidden="true" />
  Flagged
</span>
```

**Table footer** — `flex items-center justify-between px-5 py-3 border-t border-rg-border-light bg-rg-page`

### Anomaly flag alert bar

Sits below the table. `flex items-center justify-between px-5 py-3.5 bg-rg-orange-bg rounded-[10px] border border-orange-200 mt-3.5`

```tsx
<div className="flex items-center justify-between px-5 py-3.5
  bg-rg-orange-bg rounded-[10px] border border-orange-200 mt-3.5">
  <div className="flex items-center gap-3">
    <i className="ti ti-alert-triangle text-rg-orange text-[18px] flex-shrink-0"
      aria-hidden="true" />
    <div>
      <p className="text-[13px] font-medium text-amber-900">
        {count} anomaly flags require review
      </p>
      <p className="text-[12px] text-amber-800 mt-0.5">{summary}</p>
    </div>
  </div>
  <button className="px-4 py-1.5 bg-rg-orange text-white rounded-[7px]
    text-[12px] font-medium whitespace-nowrap">
    Review flags
  </button>
</div>
```

---

## Component file map

```
app/
├── (auth)/
│   └── login/
│       └── page.tsx          # Full-viewport login, no sidebar
├── (agent)/
│   ├── layout.tsx            # Sidebar (agent nav) + Topbar wrapper
│   ├── collect/
│   │   └── page.tsx          # Two-column collect + receipt panel
│   ├── history/
│   │   └── page.tsx
│   └── summary/
│       └── page.tsx
└── (admin)/
    ├── layout.tsx            # Sidebar (admin nav) + Topbar wrapper
    ├── dashboard/
    │   └── page.tsx          # Stat cards + transactions table + flag alert
    ├── agents/
    │   └── page.tsx
    ├── flags/
    │   └── page.tsx
    └── reports/
        └── page.tsx

components/
├── Sidebar.tsx               # Navy sidebar, accepts navItems prop
├── Topbar.tsx                # White topbar, accepts title + actions props
├── NavItem.tsx               # Single sidebar nav item
├── FormField.tsx             # Label + input wrapper
├── StatCard.tsx              # Dashboard metric card with coloured top bar
├── AgentCell.tsx             # Avatar + name table cell
├── ReceiptCard.tsx           # Green check + receipt details card
├── FlagAlert.tsx             # Orange anomaly alert bar
└── PinInput.tsx              # Six-box PIN input with hidden real input
```

---

## Typography rules

Only two font weights are used throughout. `font-normal` (400) for body text and `font-medium` (500) for headings, labels, and emphasis. Never `font-semibold` or `font-bold` — they look too heavy against the light background.

All labels above form fields and table headers use `uppercase tracking-[.07em]` to establish hierarchy without relying on weight alone.

Gold, teal, and orange values must use the dark stop of each colour when placed on white (`text-rg-gold-text` not `text-rg-gold`, `text-emerald-800` not `text-rg-teal`) so they remain legible at the WCAG AA contrast threshold.

---

## Spacing system

| Usage | Value |
|---|---|
| Sidebar width | `210px` |
| Topbar height | `54px` (agent) / `54px` (admin) |
| Page padding | `p-6` (24px all sides) |
| Card padding | `p-6` large, `p-5` medium, `p-4` compact |
| Card border radius | `rounded-xl` (12px) for main cards, `rounded-[10px]` for stat cards |
| Gap between grid columns | `gap-5` (20px) |
| Gap between stat cards | `gap-3` (12px) |
| Table cell padding | `px-4 py-3` |

---

*Revo UI Implementation Guide — James Ibukunoluwa | Covenant University | 2026*
