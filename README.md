# Czech Companies Directory

A web application for browsing and searching companies registered in the Czech Republic, built with Next.js 15.

**Live demo:** [add Vercel URL after deployment]
**Repository:** https://github.com/Luibara/Koala

---

## Features

- **Live search** by company name with debounce (no button needed)
- **Filter** by region (all 14 Czech regions) and company size
- **Company detail** page with:
  - Management & ownership — jednatele, členy představenstva a společníky z Veřejného rejstříku
  - NACE economic activities
  - Links to ARES, Obchodní rejstřík, Živnostenský rejstřík
  - Contact info via Firmy.cz (biggest CZ company directory with phones & web)
- **Hlídač státu panel** — smlouvy se státem, dotace, covid podpora, insolvence
- **Pagination** for large result sets
- Responsive design, dark mode, loading skeletons

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR + API routes in one, TypeScript |
| Styling | Tailwind CSS | Rapid, consistent design |
| Icons | Lucide React | Lightweight, consistent |
| Deploy | Vercel | Zero config, free tier |

## Data Sources

| Source | Data provided | Auth |
|---|---|---|
| [ARES](https://ares.gov.cz) | Company name, IČO, address, region, legal form, founding date, NACE | None |
| [ARES VR](https://ares.gov.cz) `/ekonomicke-subjekty-vr/{ico}` | Statutory bodies, shareholders (OR data) | None |
| [Firmy.cz](https://www.firmy.cz) | Phone, web, email (via suggest API) | None |
| [Hlídač státu](https://www.hlidacstatu.cz) | Smlouvy, dotace, covid podpora, insolvence | API token |

Responses cached for 1–5 minutes via Next.js `fetch` revalidation.

## Environment Variables

```env
HLIDAC_STATU_TOKEN=your_token_here
```

Get a free token at [hlidacstatu.cz](https://www.hlidacstatu.cz/api).

## Local Development

```bash
npm install
# create .env.local with HLIDAC_STATU_TOKEN
npm run dev
# open http://localhost:3000
```

## Known Issues & Limitations

### Turnover / Revenue data
ARES does **not** contain financial data. Actual turnover figures are in annual reports on [Justice.cz](https://or.justice.cz), but that system has no official REST API and would require HTML scraping.

### Phone numbers & emails
Czech public registries do not store contact details (GDPR). The detail page links to the company's Firmy.cz listing (which has phones and web) and provides Google/LinkedIn search links as fallback.

### Management data for OSVČ
Sole traders (OSVČ) are not in the Obchodní rejstřík so no management/ownership data exists for them by design. The UI shows a fallback link to OR justice.

### ARES rate limiting
ARES has undocumented rate limits. Under real traffic a Redis caching layer (5–10 min TTL) would be the right solution.

## What I'd Do Differently With More Time

- **Redis caching** to handle ARES rate limits at scale
- **Justice.cz parsing** to extract actual turnover from annual reports
- **Map view** — plot companies geographically using Leaflet or Mapbox
- **More filters** — legal form, NACE sector, founding year range
- **CSV export** of search results
- **Dockerfile** for GCP Cloud Run (alternative to Vercel)
