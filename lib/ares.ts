import type { AresSearchResult, AresRegistrace } from '@/types/company';

const ARES_BASE = 'https://ares.gov.cz/ekonomicke-subjekty-v-be/rest';

const DEFAULT_TIMEOUT = 10000;

async function fetchWithTimeout(url: string, ms = DEFAULT_TIMEOUT) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal, next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`ARES HTTP ${res.status}`);
    return res.json();
  } finally {
    clearTimeout(id);
  }
}

export async function searchCompanies(params: {
  query?: string;
  kodKraje?: string;
  pocetPracovniku?: string;
  start?: number;
  pocet?: number;
}): Promise<AresSearchResult> {
  const url = new URL(`${ARES_BASE}/ekonomicke-subjekty`);

  if (params.query?.trim()) {
    url.searchParams.set('obchodniJmeno', params.query.trim());
  }
  if (params.kodKraje) {
    url.searchParams.set('sidlo.kodKraje', params.kodKraje);
  }
  if (params.pocetPracovniku) {
    url.searchParams.set('statistickeUdaje.kodPoctuPracovniku', params.pocetPracovniku);
  }

  url.searchParams.set('start', String(params.start ?? 0));
  url.searchParams.set('pocet', String(params.pocet ?? 20));

  return fetchWithTimeout(url.toString());
}

export async function getCompanyDetail(ico: string): Promise<AresRegistrace> {
  const url = `${ARES_BASE}/ekonomicke-subjekty/${ico}`;
  return fetchWithTimeout(url);
}

export function formatAddress(sidlo: AresRegistrace['sidlo'] | undefined): string {
  if (!sidlo) return 'Adresa neuvedena';
  if (sidlo.textovaAdresa) return sidlo.textovaAdresa;

  const parts: string[] = [];
  if (sidlo.nazevUlice) {
    let street = sidlo.nazevUlice;
    if (sidlo.cisloDomovni) street += ` ${sidlo.cisloDomovni}`;
    if (sidlo.cisloOrientacni) street += `/${sidlo.cisloOrientacni}`;
    parts.push(street);
  }
  if (sidlo.nazevObce) parts.push(sidlo.nazevObce);
  if (sidlo.psc) parts.push(sidlo.psc);
  return parts.join(', ') || 'Adresa neuvedena';
}

export function formatPersonName(person: {
  titulPred?: string;
  jmeno?: string;
  prijmeni?: string;
  titulZa?: string;
}): string {
  const parts = [person.titulPred, person.jmeno, person.prijmeni].filter(Boolean);
  const name = parts.join(' ');
  return person.titulZa ? `${name}, ${person.titulZa}` : name;
}

export function getLegalFormLabel(kod?: string): string {
  const forms: Record<string, string> = {
    '101': 'OSVČ',
    '112': 's.r.o.',
    '121': 'a.s.',
    '141': 'o.p.s.',
    '161': 'Státní podnik',
    '205': 'Spolek',
    '301': 'Příspěvková org.',
  };
  return kod ? (forms[kod] ?? `Forma ${kod}`) : 'Neznámá forma';
}
