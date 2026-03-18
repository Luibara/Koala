# Adresář českých firem

Webová aplikace pro vyhledávání a prohlížení firem registrovaných v České republice, postavená na Next.js 15.

**Live demo:** *Není nasazeno — projekt nevyžaduje placený hosting; Dockerfile je připraven pro GCP Cloud Run (free tier). Spusťte lokálně podle návodu níže.*
**Repozitář:** https://github.com/Luibara/Koala

---

## Funkce

- **Živé vyhledávání** podle názvu firmy s debounce (bez nutnosti klikat na tlačítko)
- **Filtry** podle kraje (všech 14 krajů ČR) a velikosti podniku
- **Detail firmy** obsahuje:
  - Jednatelé, členové představenstva a společníci z Veřejného rejstříku
  - Ekonomické činnosti (NACE)
  - Přímé odkazy na ARES, Obchodní rejstřík, Živnostenský rejstřík
  - Kontaktní informace přes Firmy.cz (největší český firemní adresář)
- **Panel Hlídač státu** — smlouvy se státem, dotace, covid podpora, insolvence
- **Stránkování** výsledků
- Responzivní design, tmavý režim, shimmer loading skeletony

## Technologie

| Vrstva | Volba | Důvod |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR + API routes v jednom, TypeScript |
| Styling | Tailwind CSS | Rychlý, konzistentní design |
| Ikony | Lucide React | Lehká, konzistentní sada ikon |
| Nasazení | GCP Cloud Run | Docker, free tier, dle zadání |

## Datové zdroje

| Zdroj | Poskytovaná data | Autentizace |
|---|---|---|
| [ARES](https://ares.gov.cz) | Název firmy, IČO, adresa, kraj, právní forma, datum vzniku, NACE | Žádná |
| [ARES VR](https://ares.gov.cz) `/ekonomicke-subjekty-vr/{ico}` | Statutární orgány, společníci (data z OR) | Žádná |
| [ARES ROS](https://ares.gov.cz) `/ekonomicke-subjekty-ros/{ico}` | Telefon a email firmy (pokud je zaregistrován v Registru osob) | Žádná |
| [Firmy.cz](https://www.firmy.cz) | Odkaz na firemní profil (největší český firemní adresář) | Žádná |
| [Hlídač státu](https://www.hlidacstatu.cz) | Smlouvy, dotace, covid podpora, insolvence | API token |

Odpovědi jsou cachovány 1–5 minut přes Next.js `fetch` revalidation.

## Proměnné prostředí

```env
HLIDAC_STATU_TOKEN=váš_token
```

Bezplatný token získáte na [hlidacstatu.cz](https://www.hlidacstatu.cz/api).

## Lokální vývoj

```bash
npm install
# vytvořte .env.local s HLIDAC_STATU_TOKEN
npm run dev
# otevřít http://localhost:3000
```

## Známé problémy a omezení

### Filtr podle obratu / velikosti firmy

Zadání požaduje filtrování podle obratu. ARES — jediný bezplatný, oficiální český firemní rejstřík — **neobsahuje žádná finanční data**. Skutečné údaje o obratu existují pouze ve výročních zprávách na [Justice.cz](https://or.justice.cz), ale tento systém nemá REST API; extrakce dat by vyžadovala nespolehlivý scraping HTML a PDF dokumentů, které nejsou konzistentně strojově čitelné.

Byl zkoumán filtr podle počtu zaměstnanců jako proxy. Po prostudování OpenAPI specifikace ARES (`/v3/api-docs`) bylo zjištěno, že endpoint `/ekonomicke-subjekty/vyhledat` **nepodporuje filtrování podle počtu zaměstnanců ani velikosti podniku** — toto pole v search API vůbec neexistuje. Dostupné filtry jsou pouze: `obchodniJmeno`, `ico`, `sidlo` (kraj/adresa), `pravniForma`, `financniUrad` a `czNace`. Filtr velikosti byl proto z UI odebrán, aby neváděl uživatele v omyl.

### Telefony a e-maily — proč ani právnické osoby kontakty nemají

Zadání požaduje telefon a e-mail vlastníků a managementu. To je zásadně zablokováno dvěma překrývajícími se omezeními:

**1. GDPR (Nařízení EU 2016/679)** — Jména členů statutárních orgánů (jednatelů, členů představenstva) jsou zveřejňována v Obchodním rejstříku, protože to výslovně ukládá český zákon (§ 48 zákona č. 304/2013 Sb.). Jejich osobní telefonní čísla a e-maily zveřejňována *být nemusí* a jsou tedy chráněnými osobními údaji dle GDPR čl. 9. Žádný veřejný český rejstřík je nesmí ukládat ani zpřístupňovat.

**2. Žádný officiální zdroj neexistuje** — Ani u právnických osob (s.r.o., a.s.) český zákon nepožaduje registraci telefonního čísla ani e-mailu v ARES nebo OR. Veřejně dostupná je pouze *sídlová adresa*; kontaktní údaje jsou zcela dobrovolné. Neexistuje tedy žádný autoritativní datový zdroj — ne kvůli omezení API, ale proto, že tato data vůbec nejsou sbírána.

**Byl zkoumán i scraping Firmy.cz.** Suggest API (používané pro párování názvů) telefon ani e-mail nevrací. Testovala se také HTML stránka detailu — telefonní čísla přítomná v HTML se ukázala jako call-tracking přesměrovací čísla (nikoli skutečné číslo firmy) a žádná e-mailová adresa v HTML nebyla nalezena (pravděpodobně renderována JavaScriptem nebo záměrně vynechána). Scraping by tedy vracel zavádějící data.

**Co aplikace dělá místo toho:** stránka detailu automaticky páruje firmu na [Firmy.cz](https://www.firmy.cz) (největší český firemní adresář s dobrovolně zadanými kontakty) a odkazuje přímo na její listing. Pro jednotlivé členy managementu jsou k dispozici přímé vyhledávací odkazy na LinkedIn, Google a Hlídač státu — což je nejbližší praktické řešení v rámci zákonných možností.

### Data managementu pro OSVČ
Fyzické osoby — podnikatelé (OSVČ) nejsou vedeny v Obchodním rejstříku, takže pro ně data o managementu ani vlastnictví ze zákona neexistují. UI zobrazuje záložní odkaz na OR justice.

### Rate limiting ARES
ARES má nedokumentované rate limity. Při reálném provozu by správným řešením byla Redis cache (TTL 5–10 min).

## Co bych udělal jinak s více časem

- **Redis cache** pro zvládnutí rate limitů ARES při větším provozu
- **Parsování Justice.cz** pro extrakci skutečného obratu z výročních zpráv (HTML + PDF scraping)
- **Mapové zobrazení** — vykreslení firem geograficky přes Leaflet nebo Mapbox
- **Více filtrů** — právní forma, NACE sektor, rozsah roku vzniku
- **Export do CSV** výsledků vyhledávání
