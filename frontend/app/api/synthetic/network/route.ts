import { NextResponse } from 'next/server';
import { fallbackData } from '@/lib/fallbackData';

export async function GET() {
  return NextResponse.json(fallbackData.getSyntheticNetwork());
}
