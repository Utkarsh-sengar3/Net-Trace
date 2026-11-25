import { NextRequest, NextResponse } from 'next/server';
import { fallbackData } from '@/lib/fallbackData';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const nodeId = decodeURIComponent(params.id);
  const { searchParams } = new URL(request.url);
  const hops = searchParams.get('hops') ? parseInt(searchParams.get('hops')!, 10) : 1;
  return NextResponse.json(fallbackData.getNodeNeighborhood(nodeId, hops));
}
