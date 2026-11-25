import { NextRequest, NextResponse } from 'next/server';
import { fallbackData } from '@/lib/fallbackData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state') || undefined;
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 100;
  return NextResponse.json(fallbackData.getDistricts({ state, limit }));
}
