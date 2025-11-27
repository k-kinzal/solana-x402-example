import { NextResponse } from 'next/server';
import { drawGatya } from '@/lib/gatya/messages';

export async function GET() {
  const gatyaResult = drawGatya();

  return NextResponse.json({
    success: true,
    result: gatyaResult,
  });
}

export const POST = GET;
