import { NextRequest, NextResponse } from 'next/server';
import { searchCompanies } from '@/lib/ares';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const query = searchParams.get('query') ?? '';
  const region = searchParams.get('region') ?? '';
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const pageSize = 20;

  if (!query.trim()) {
    return NextResponse.json({ pocetCelkem: 0, ekonomickeSubjekty: [] });
  }

  try {
    const data = await searchCompanies({
      query: query || undefined,
      kodKraje: region ? Number(region) : undefined,
      start: (page - 1) * pageSize,
      pocet: pageSize,
    });

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';

    // ARES returns this when query is too broad (>1000 results)
    if (message.includes('příliš mnoho')) {
      return NextResponse.json({
        error: 'too_broad',
        message: 'Dotaz vrací příliš mnoho výsledků. Upřesněte hledaný výraz.',
      }, { status: 422 });
    }

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
