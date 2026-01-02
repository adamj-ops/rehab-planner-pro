import { NextRequest, NextResponse } from 'next/server';
import { placeDetails, placesRateLimiter } from '@/lib/google/places';

function getErrorCode(e: unknown): string | undefined {
  if (!e || typeof e !== 'object') return undefined;
  if (!('code' in e)) return undefined;
  const code = (e as { code?: unknown }).code;
  return typeof code === 'string' ? code : undefined;
}

function getClientIp(req: NextRequest) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = placesRateLimiter.check(`places_details:${ip}`);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000))),
        },
      }
    );
  }

  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get('placeId') || '';

  try {
    const details = await placeDetails(placeId);
    return NextResponse.json({ success: true, data: details });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to fetch place details';
    const code = getErrorCode(e);
    const status = code === 'MISSING_GOOGLE_PLACES_API_KEY' ? 500 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

