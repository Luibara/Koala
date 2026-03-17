import type { AresSearchResult, AresRegistrace } from '@/types/company';

const ARES_BASE = 'https://ares.gov.cz/ekonomicke-subjekty-v-be/rest';
const DEFAULT_TIMEOUT = 12000;

async function aresPost<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
  try {
    const res = await fetch(`${ARES_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody?.popis ?? `ARES HTTP ${res.status}`);
    }
    return res.json();
  } finally {
    clearTimeout(id);
  }
}

async function aresGet<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
  try {
    const res = await fetch(`${ARES_BASE}${path}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`ARES HTTP ${res.status}`);
    return res.json();
  } finally {
    clearTimeout(id);
  }
}

export async function searchCompanies(params: {
  query?: string;
  kodKraje?: number;
  start?: number;
  pocet?: number;
}): Promise<AresSearchResult> {
  const body: Record<string, unknown> = {
    start: params.start ?? 0,
    pocet: params.pocet ?? 20,
  };

  if (params.query?.trim()) body.obchodniJmeno = params.query.trim();
  if (params.kodKraje) body.sidlo = { kodKraje: params.kodKraje };

  return aresPost<AresSearchResult>('/ekonomicke-subjekty/vyhledat', body);
}

export async function getCompanyDetail(ico: string): Promise<AresRegistrace> {
  return aresGet<AresRegistrace>(`/ekonomicke-subjekty/${ico}`);
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
  if (sidlo.psc) parts.push(String(sidlo.psc));
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

export function getLegalFormLabel(kod?: string | number): string {
  const forms: Record<string, string> = {
    '100': 'OSVČ',
    '101': 'OSVČ',
    '105': 'OSVČ',
    '107': 'OSVČ',
    '112': 's.r.o.',
    '121': 'a.s.',
    '141': 'o.p.s.',
    '161': 'Státní podnik',
    '205': 'Spolek',
    '301': 'Příspěvková org.',
  };
  const k = String(kod ?? '');
  return k ? (forms[k] ?? `Forma ${k}`) : 'Neznámá forma';
}
