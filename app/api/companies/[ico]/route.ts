import { NextRequest, NextResponse } from 'next/server';
import { getCompanyDetail } from '@/lib/ares';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ico: string }> }
) {
  const { ico } = await params;

  if (!/^\d{8}$/.test(ico)) {
    return NextResponse.json({ error: 'Neplatné IČO' }, { status: 400 });
  }

  try {
    const data = await getCompanyDetail(ico);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
