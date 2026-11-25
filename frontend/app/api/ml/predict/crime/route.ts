import { NextRequest, NextResponse } from 'next/server';
import { fallbackData } from '@/lib/fallbackData';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    return NextResponse.json(fallbackData.predictCrime(payload));
  } catch {
    return NextResponse.json({ error: 'Invalid prediction parameters' }, { status: 400 });
  }
}
