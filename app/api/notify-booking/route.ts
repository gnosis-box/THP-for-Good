import { NextResponse } from 'next/server';

type NotifyBody = {
  mentorId: string;
  mentorName: string;
  slotLabel: string;
  studentAddress: string;
  txHash: string;
  notifyEmail?: string;
  notifyWebhook?: string;
};

export async function POST(request: Request) {
  let body: NotifyBody;

  try {
    body = (await request.json()) as NotifyBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const webhookUrl =
    body.notifyWebhook ?? process.env.N8N_NOTIFY_WEBHOOK_URL ?? process.env.NOTIFY_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json({
      ok: false,
      reason: 'no_webhook_configured',
      mailto: body.notifyEmail ?? null,
    });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'thp-booking-paid',
        ...body,
        sentAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Webhook delivery failed', status: response.status },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Webhook request failed',
      },
      { status: 502 },
    );
  }
}
