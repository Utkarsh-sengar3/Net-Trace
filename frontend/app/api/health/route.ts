import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    services: {
      graph_engine: 'ready',
      crime_context: 'ready',
      synthetic_network: 'ready',
      ml_forecasting: 'ready',
    },
    timestamp: Date.now() / 1000,
  });
}
