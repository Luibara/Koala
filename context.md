# context.md — Decision Log

## Problem Understanding

The task asks to build an app that:
1. Lists Czech companies
2. Filters by turnover and location
3. Shows company details including owners/management with phone + email

This is intentionally hard — the assignment says so explicitly.

## Key Decision: Data Source

**Chosen: ARES API (ares.gov.cz)**

The Czech government's ARES (Administrativní registr ekonomických subjektů) is the canonical, authoritative, and free source for Czech business data. Alternative commercial sources (Bisnode, Creditcheck, Merk) have better data coverage but require paid API keys.

ARES provides:
- Company name, IČO, address ✅
- Region/location ✅
- Legal form, founding date ✅
- Statutory body members (jednatelé, společníci) ✅ (for registered companies)
- NACE economic activities ✅
- Employee count category (proxy for turnover) ✅

ARES does NOT provide:
- Revenue / turnover ❌ (would require parsing justice.cz annual reports)
- Phone numbers ❌ (not in any public registry — GDPR)
- Email addresses ❌ (same reason)

## Turnover Filter

The spec asks to filter by turnover. Since ARES doesn't have this data, I made a deliberate trade-off:

- **Option A**: Skip the filter, explain the limitation → honest but incomplete
- **Option B**: Use employee count categories as a proxy → adds real value while being transparent
- **Option C**: Scrape justice.cz annual reports → technically possible, but time-consuming and fragile

**Chose Option B** — the employee count filter genuinely approximates company size (micro/small/medium/large maps to EU SME definitions). The limitation is documented in the UI and README.

## Contact Information (Phone/Email)

This is the hardest part. Czech law (and GDPR) means personal contact details are simply not in public registries. Options considered:

1. **Show nothing** — correct but unhelpful
2. **Link to external search** — practical workaround
3. **Scrape company websites** — too unreliable and time-consuming
4. **Use a paid data enrichment API** — not "publicly available"

**Chose Option 2** — the detail page shows a clearly explained notice and provides direct links to Google search and LinkedIn. This is honest and more useful than pretending the data doesn't exist.

## Architecture Decisions

**Next.js App Router + API routes**: The API routes act as a proxy/adapter between the browser and ARES. This is better than calling ARES directly from the client because:
- CORS headers on ARES can be unpredictable
- Allows caching at the server level
- Hides implementation details (can swap data source later)

**No database**: All data is fetched live from ARES. For a production system, a caching layer (Redis) would be important, but for this demo it's unnecessary complexity.

**TypeScript throughout**: Avoids runtime surprises with the ARES API response shape, which can vary by company type.

## What I'd Do Differently

1. **Proper turnover data**: Parse justice.cz `VR` endpoint to extract financial statements from annual reports. This is doable but complex.

2. **Caching**: Even a simple in-memory LRU cache for ARES responses would significantly improve perceived performance.

3. **Better management data**: The obchodní rejstřík (or.justice.cz) has richer management data than ARES. An `or.justice.cz` API call on the detail page would fill gaps.

4. **Search UX**: A "popular searches" or "recently viewed" section on the empty state would improve first-time user experience.

5. **GCP Cloud Run**: Would containerize with Docker (multi-stage build, ~200MB image) and deploy to Cloud Run for better scalability vs Vercel serverless cold starts.

## Trade-offs Summary

| Feature | What was done | What would be ideal |
|---|---|---|
| Company list | ARES search + pagination | Same, with caching |
| Location filter | Region (kraj) dropdown | Map-based selection |
| Turnover filter | Employee count proxy | Parsed justice.cz data |
| Management | ARES statutory bodies | or.justice.cz enrichment |
| Contact info | Links to Google/LinkedIn | Data enrichment API |
| Deploy | Vercel | GCP Cloud Run (Docker) |
