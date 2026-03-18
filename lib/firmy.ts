export interface FirmyCzResult {
  id: number;
  seo_name: string;
  sentence: string;
  loc: string;
  url: string;
}

// Normalize company name for fuzzy matching
function normalize(s: string): string {
  return s
    .toLowerCase()
    // Strip legal suffixes regardless of word boundary (handles trailing dots correctly)
    .replace(/\s*(s\.r\.o\.|a\.s\.|spol\.\s*s\s*r\.o\.|o\.p\.s\.|v\.o\.s\.|k\.s\.)\s*/g, ' ')
    .replace(/[,.\-–]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Simple name similarity: how many words overlap
function similarity(a: string, b: string): number {
  const wa = new Set(normalize(a).split(' ').filter(Boolean));
  const wb = new Set(normalize(b).split(' ').filter(Boolean));
  let overlap = 0;
  wa.forEach((w) => { if (wb.has(w)) overlap++; });
  return overlap / Math.max(wa.size, wb.size, 1);
}

export async function findFirmyCz(
  companyName: string,
  city?: string
): Promise<FirmyCzResult | null> {
  try {
    const phrase = encodeURIComponent(companyName);
    const res = await fetch(
      `https://www.firmy.cz/suggest?phrase=${phrase}&page_no=1&offset=0&limit=10&category_id=0&region_id=0`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CzechCompaniesApp/1.0)' },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const results: Array<{ sentence: string; userData: { seo_name: string; id: number; loc: string } }> =
      data?.result ?? [];

    if (results.length === 0) return null;

    // Score each result
    const scored = results
      .filter((r) => r.userData?.seo_name && r.userData?.id)
      .map((r) => {
        let score = similarity(companyName, r.sentence);
        // Bonus if city matches
        if (city && r.userData.loc?.toLowerCase().includes(city.toLowerCase())) {
          score += 0.3;
        }
        return { score, r };
      })
      .sort((a, b) => b.score - a.score);

    if (scored.length === 0 || scored[0].score < 0.25) return null;

    const best = scored[0].r;
    return {
      id: best.userData.id,
      seo_name: best.userData.seo_name,
      sentence: best.sentence,
      loc: best.userData.loc,
      url: `https://www.firmy.cz/detail/${best.userData.id}-${best.userData.seo_name}`,
    };
  } catch {
    return null;
  }
}
