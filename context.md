# context.md — Decision Log

## Problem Understanding

The task asks to build an app that:
1. Lists Czech companies
2. Filters by turnover and location
3. Shows company details including owners/management with phone + email

This is intentionally hard — the assignment says so explicitly.

## Key Decision: Data Sources

Multiple public sources are combined to maximize data coverage:

### ARES (ares.gov.cz) — primary register
The Czech government's ARES is the canonical, free, authoritative source.

- Company name, IČO, address ✅
- Region/location ✅
- Legal form, founding date ✅
- NACE economic activities ✅

ARES does NOT provide:
- Revenue / turnover ❌ (would require parsing justice.cz annual reports)
- Phone numbers ❌ (not in any public registry — GDPR)
- Email addresses ❌ (same reason)

### ARES Veřejný rejstřík endpoint — management & ownership
The `/ekonomicke-subjekty-vr/{ico}` endpoint returns full OR (Obchodní rejstřík) data including:

- Statutory body members (jednatele, členy představenstva) with roles and cities ✅
- Shareholders (fyzické i právnické osoby) ✅

Only active records are shown (entries without `datumVymazu`). This works for s.r.o. and a.s. For OSVČ, no data exists — this is expected by design (sole traders have no company structure).

### Firmy.cz — contact enrichment
The Firmy.cz suggest API (`firmy.cz/suggest?phrase=...`) is a free, unauthenticated endpoint that returns the best matching listing including phone, web and email. Results are fuzzy-matched by name + city bonus to reduce false positives. When found, a direct link to the listing is shown.

### Hlídač státu — public interest data
The Hlídač státu API provides transparency data from public registries:

| Data | Endpoint |
|---|---|
| Smlouvy se státem | `/smlouvy/hledat?dotaz=prijemce.ico:{ico}` |
| Dotace | `/dotace/hledat?dotaz=ico:{ico}` |
| Covid podpora | `/datasety/covid-podpora/hledat?dotaz=ico:{ico}` |
| Insolvence | `/insolvence/hledat?dotaz=dluznici.ico:{ico}` |

Requires a free API token (env: `HLIDAC_STATU_TOKEN`).

## Turnover Filter

The spec asks to filter by turnover. Since ARES doesn't have this data, a deliberate trade-off was made:

- **Option A**: Skip the filter, explain the limitation → honest but incomplete
- **Option B**: Use employee count categories as a proxy → adds real value while being transparent
- **Option C**: Scrape justice.cz annual reports → technically possible but fragile

**Chose Option B** — employee count filter approximates company size (micro/small/medium/large per EU SME definitions). The limitation is documented in the UI and README.

## Contact Information (Phone/Email)

Czech law (and GDPR) means personal contact details are not in public registries. Options considered:

1. **Show nothing** — correct but unhelpful
2. **Link to Firmy.cz** — practical workaround with real data
3. **Scrape company websites** — too unreliable
4. **Paid data enrichment API** — not "publicly available"

**Chose Option 2** — Firmy.cz is the largest Czech company directory and has phones, emails and website URLs for most registered businesses. A fuzzy-match automatically finds the right listing and links directly to it.

## Architecture Decisions

**Next.js App Router + API routes**: API routes proxy ARES calls from the browser. This avoids CORS issues, allows server-side caching, and hides implementation details.

**No database**: All data is fetched live from public APIs. For production, a Redis caching layer (5–10 min TTL) would be the right next step.

**Parallel fetches on detail page**: ARES detail, ARES VR, Firmy.cz, and all four Hlídač státu endpoints are fetched in parallel using `Promise.all`, minimising page load time.

**TypeScript throughout**: Avoids runtime surprises with ARES API response shapes, which vary by company type and data source.

## Trade-offs Summary

| Feature | What was done | What would be ideal |
|---|---|---|
| Company list | ARES search + pagination | Same + Redis cache |
| Location filter | Region (kraj) dropdown | Map-based selection |
| Turnover filter | Employee count proxy | Parsed justice.cz data |
| Management | ARES VR endpoint (real OR data) | Same — already done |
| Shareholders | ARES VR spolecnici | Same — already done |
| Contact info | Firmy.cz auto-match + fallback links | Paid enrichment API |
| State contracts | Hlídač státu smlouvy count | Full contract list view |
| Subsidies | Hlídač státu dotace count | Full subsidy breakdown |
| Covid support | Hlídač státu covid dataset | — |
| Insolvency | Hlídač státu insolvence | — |
| Deploy | Vercel | GCP Cloud Run (Docker) |
