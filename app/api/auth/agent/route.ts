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
