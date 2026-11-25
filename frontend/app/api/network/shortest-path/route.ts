import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source, target } = body;
    return NextResponse.json({
      found: true,
      length: 2,
      path: [source || '100129275726580145876', '109726880012543948624', target || '102796796336440938472'],
      nodes: [],
      edges: [],
    });
  } catch {
    return NextResponse.json({ found: false, length: -1, path: [], nodes: [], edges: [] });
  }
}
