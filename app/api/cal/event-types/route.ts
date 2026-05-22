import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get('username');
  if (!username) return NextResponse.json({ error: 'username required' }, { status: 400 });

  try {
    const key = process.env.CAL_API_KEY;
    const res = await fetch(
      `https://api.cal.com/v2/event-types?username=${encodeURIComponent(username)}`,
      {
        headers: {
          'cal-api-version': '2024-06-14',
          ...(key ? { Authorization: `Bearer ${key}` } : {}),
        },
      },
    );

    if (!res.ok) return NextResponse.json([], { status: 200 });

    type CalResponse = {
      data?: Array<{ id: number; slug: string; title: string }>;
    };
    const body = (await res.json()) as CalResponse;
    const types = (body.data ?? []).map(({ id, slug, title }) => ({ id, slug, title }));
    return NextResponse.json(types);
  } catch {
    return NextResponse.json({ error: 'Cal.com unavailable' }, { status: 502 });
  }
}
