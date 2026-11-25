import { NextRequest, NextResponse } from 'next/server';
import { fallbackData } from '@/lib/fallbackData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const commIdStr = searchParams.get('community_id');
  const isBridgeStr = searchParams.get('is_bridge');
  const search = searchParams.get('search') || undefined;
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;
  const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;

  const data = fallbackData.getNodes({
    community_id: commIdStr !== null ? parseInt(commIdStr, 10) : undefined,
    is_bridge: isBridgeStr !== null ? isBridgeStr === 'true' : undefined,
    search,
    limit,
    offset,
  });
  return NextResponse.json(data);
}
