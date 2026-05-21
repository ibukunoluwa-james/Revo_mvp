import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendSMS } from '@/lib/sms';

export async function POST(req: NextRequest) {
  try {
    const { agentId, streamName, amountNaira, payerPhone } = await req.json();

    if (!agentId || !streamName || !amountNaira || !payerPhone) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    if (isNaN(parseInt(amountNaira)) || parseInt(amountNaira) <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const collection = await prisma.collection.create({
      data: {
        agentId,
        streamName,
        amountKobo: parseInt(amountNaira) * 100,
        payerPhone,
      },
      include: { agent: true },
    });

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
