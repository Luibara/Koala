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

export interface VrPerson {
  name: string;
  role: string;
  city?: string;
  ico?: string; // if legal entity
}

interface VrMemberOsoba {
  datumVymazu?: string;
  clenstvi?: { funkce?: { nazev?: string } };
  nazevAngazma?: string;
  fyzickaOsoba?: { jmeno?: string; prijmeni?: string; adresa?: { nazevObce?: string } };
}

interface VrSpolecnikOsoba {
  datumVymazu?: string;
  osoba?: {
    fyzickaOsoba?: { jmeno?: string; prijmeni?: string };
    pravnickaOsoba?: { obchodniJmeno?: string; ico?: string };
  };
}

interface VrZaznam {
  statutarniOrgany?: Array<{
    nazevOrganu?: string;
    clenoveOrganu?: VrMemberOsoba[];
  }>;
  spolecnici?: Array<{
    spolecnik?: VrSpolecnikOsoba[];
  }>;
}

interface VrResponse {
  kod?: string;
  zaznamy?: VrZaznam[];
}

export async function getCompanyVrPeople(ico: string): Promise<VrPerson[]> {
  try {
    const data = await aresGet<VrResponse>(`/ekonomicke-subjekty-vr/${ico}`);
    if (data.kod === 'NENALEZENO' || !data.zaznamy?.length) return [];

    const zaznam = data.zaznamy[0];
    const people: VrPerson[] = [];

    // Statutory body members
    for (const organ of zaznam.statutarniOrgany ?? []) {
      for (const clen of organ.clenoveOrganu ?? []) {
        if (clen.datumVymazu) continue; // no longer active
        const fo = clen.fyzickaOsoba;
        if (!fo?.prijmeni && !fo?.jmeno) continue;
        const name = [fo.jmeno, fo.prijmeni].filter(Boolean).join(' ');
        const role = clen.clenstvi?.funkce?.nazev ?? clen.nazevAngazma ?? organ.nazevOrganu ?? 'Člen org.';
        people.push({ name, role: capitalize(role), city: fo.adresa?.nazevObce });
      }
    }

    // Shareholders / spolecnici
    for (const group of zaznam.spolecnici ?? []) {
      for (const s of group.spolecnik ?? []) {
        if (s.datumVymazu) continue;
        const fo = s.osoba?.fyzickaOsoba;
        const po = s.osoba?.pravnickaOsoba;
        if (fo?.prijmeni || fo?.jmeno) {
          const name = [fo.jmeno, fo.prijmeni].filter(Boolean).join(' ');
          people.push({ name, role: 'Společník' });
        } else if (po?.obchodniJmeno) {
          people.push({ name: po.obchodniJmeno, role: 'Společník (firma)', ico: po.ico });
        }
      }
    }

    // Deduplicate by name
    const seen = new Set<string>();
    return people.filter((p) => {
      if (seen.has(p.name)) return false;
      seen.add(p.name);
      return true;
    });
  } catch {
    return [];
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
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
