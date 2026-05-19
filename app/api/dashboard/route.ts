import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Collections at or above this amount (kobo) are flagged for review.
// Simple, deterministic anomaly heuristic for the MVP — a single large
// cash collection is the pattern most worth a second look.
const FLAG_THRESHOLD_KOBO = 50_000 * 100;

function initialsOf(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [collections, monthAgg, totalAgents] = await Promise.all([
    prisma.collection.findMany({
      where: { createdAt: { gte: today } },
      include: { agent: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.collection.aggregate({
      _sum: { amountKobo: true },
      where: { createdAt: { gte: monthStart } },
    }),
    prisma.agent.count({ where: { active: true } }),
  ]);

  const todayTotal = collections.reduce((s, c) => s + c.amountKobo, 0) / 100;
  const monthTotal = (monthAgg._sum.amountKobo ?? 0) / 100;
  const agentCount = new Set(collections.map((c) => c.agentId)).size;

  const mapped = collections.map((c) => {
    const flagged = c.amountKobo >= FLAG_THRESHOLD_KOBO;
    return {
      id: c.id,
      agentName: c.agent.name,
      agentInitials: initialsOf(c.agent.name),
      streamName: c.streamName,
      amount: c.amountKobo / 100,
      payerPhone: c.payerPhone,
      receiptRef: c.receiptRef.slice(0, 8).toUpperCase(),
      time: c.createdAt.toLocaleTimeString('en-NG', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      flagged,
    };
  });

  const openFlags = mapped.filter((c) => c.flagged).length;

  return NextResponse.json({
    todayTotal,
    monthTotal,
    // kept for backward compatibility with any existing consumers
    allTimeTotal: monthTotal,
    agentCount,
    totalAgents,
    openFlags,
    collections: mapped,
  });
}
