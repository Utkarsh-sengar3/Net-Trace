import { NextRequest, NextResponse } from 'next/server';
import { fallbackData } from '@/lib/fallbackData';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const nodeId = decodeURIComponent(params.id);
  return NextResponse.json(fallbackData.getNodeDetail(nodeId));
}
