# Czech Companies Directory

A web application for browsing and searching companies registered in the Czech Republic, built with Next.js 15.

**Live demo:** [add Vercel URL after deployment]
**Repository:** [add GitHub URL]

---

## Features

- **Live search** by company name with debounce (no button needed)
- **Filter** by region (all 14 Czech regions) and company size
- **Company detail** page — statutory bodies, registered address, NACE activities, links to official registries
- **Pagination** for large result sets
- Responsive design, dark mode, loading skeletons

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR + API routes in one, TypeScript |
| Styling | Tailwind CSS | Rapid, consistent design |
| Data | ARES REST API | Official CZ business register, free, no key needed |
| Icons | Lucide React | Lightweight, consistent |
| Deploy | Vercel | Zero config, free tier |

## Data Source

All data comes from **[ARES](https://ares.gov.cz)** — Administrativní registr ekonomických subjektů, maintained by the Czech Ministry of Finance.

```
https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty
```

No API key required. Responses cached for 5 minutes via Next.js `fetch` revalidation.

## Local Development

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Known Issues & Limitations

### Turnover / Revenue data
ARES does **not** contain financial data. The "company size" filter uses employee count categories as a proxy. Actual turnover figures are in annual reports on [Justice.cz](https://or.justice.cz), but that API has no official REST endpoint and would require HTML scraping.

### Phone numbers & emails
Czech public registries intentionally do not store contact details (GDPR). The detail page provides direct links to Google, LinkedIn, and the company's own website as practical workarounds. This limitation is acknowledged openly in the UI.

### ARES rate limiting
ARES has undocumented rate limits. Under real traffic a Redis caching layer (5–10 min TTL) would be the right solution.

### Management data
Some company types (sole traders, older entries) may not have statutory body data in ARES. The UI handles this gracefully with a fallback to the Obchodní rejstřík link.

## What I'd Do Differently With More Time

- **Redis caching** to handle ARES rate limits at scale
- **Justice.cz parsing** to extract actual turnover from annual reports
- **Map view** — plot companies geographically using Leaflet
- **More filters** — legal form, NACE sector, founding year range
- **CSV export** of search results
- **Dockerfile** for GCP Cloud Run (alternative to Vercel)

## Time Spent

~4 hours:
- 30 min — setup, ARES API research
- 1 hr — data layer (types, wrapper, API routes)
- 1.5 hr — UI (components + pages)
- 30 min — styling, dark mode, responsive
- 30 min — documentation
