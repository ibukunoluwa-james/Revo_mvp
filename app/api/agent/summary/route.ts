import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Today's collection totals for a single agent — powers the collect
// screen's daily summary card.
export async function GET(req: NextRequest) {
  const agentId = req.nextUrl.searchParams.get('agentId');
  if (!agentId) {
    return NextResponse.json({ error: 'agentId required' }, { status: 400 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const collections = await prisma.collection.findMany({
    where: { agentId, createdAt: { gte: today } },
  });

  const todayTotal = collections.reduce((sum, c) => sum + c.amountKobo, 0) / 100;

  return NextResponse.json({
    todayTotal,
    txCount: collections.length,
  });
}
