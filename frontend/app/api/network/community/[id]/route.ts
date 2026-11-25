import { NextRequest, NextResponse } from 'next/server';
import { fallbackData } from '@/lib/fallbackData';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const commId = parseInt(params.id, 10);
  return NextResponse.json(fallbackData.getCommunityDetail(commId));
}
