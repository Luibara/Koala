const HLIDAC_BASE = 'https://api.hlidacstatu.cz/api/v2';
const TOKEN = process.env.HLIDAC_STATU_TOKEN ?? '';

async function hlidacGet<T>(path: string): Promise<T | null> {
  if (!TOKEN) return null;
  try {
    const res = await fetch(`${HLIDAC_BASE}${path}`, {
      headers: { Authorization: `Token ${TOKEN}`, Accept: 'application/json' },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export interface HlidacStats {
  smlouvyCount: number;       // počet smluv se státem jako příjemce
  isInsolvent: boolean;       // je firma dlužník v insolvenčním řízení?
  insolvenceCount: number;    // počet insolvenčních řízení jako dlužník
  dotaceCount: number;        // počet přijatých dotací
  covidCount: number;         // počet covid podpor
}

export async function getHlidacStats(ico: string): Promise<HlidacStats> {
  const [smlouvy, insolvence, dotace, covid] = await Promise.all([
    hlidacGet<{ total: number }>(`/smlouvy/hledat?dotaz=prijemce.ico:${ico}&strana=1&razeni=0`),
    hlidacGet<{ total: number }>(`/insolvence/hledat?dotaz=dluznici.ico:${ico}&strana=1`),
    hlidacGet<{ total: number }>(`/dotace/hledat?dotaz=ico:${ico}&strana=1`),
    hlidacGet<{ total: number }>(`/datasety/covid-podpora/hledat?dotaz=ico:${ico}&strana=1`),
  ]);

  return {
    smlouvyCount: smlouvy?.total ?? 0,
    isInsolvent: (insolvence?.total ?? 0) > 0,
    insolvenceCount: insolvence?.total ?? 0,
    dotaceCount: dotace?.total ?? 0,
    covidCount: covid?.total ?? 0,
  };
}
