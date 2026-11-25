import { NextRequest, NextResponse } from 'next/server';
import { fallbackData } from '@/lib/fallbackData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const commIdStr = searchParams.get('community_id');
  const communityId = commIdStr !== null ? parseInt(commIdStr, 10) : undefined;
  const data = fallbackData.getGraphView(communityId);
  return NextResponse.json(data);
}
