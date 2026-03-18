import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  Calendar,
  ArrowLeft,
  Users,
  ExternalLink,
  Hash,
  AlertCircle,
  Phone,
  Globe,
  Search,
  Linkedin,
  FileText,
  ShieldAlert,
  ShieldCheck,
  Banknote,
  HeartHandshake,
} from 'lucide-react';
import { getCompanyDetail, getCompanyVrPeople, formatAddress, getLegalFormLabel } from '@/lib/ares';
import { findFirmyCz } from '@/lib/firmy';
import { getHlidacStats } from '@/lib/hlidac';
import type { AresRegistrace } from '@/types/company';

interface Props {
  params: Promise<{ ico: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { ico } = await params;
  try {
    const company = await getCompanyDetail(ico);
    return { title: `${company.obchodniJmeno} — Czech Companies` };
  } catch {
    return { title: 'Detail firmy — Czech Companies' };
  }
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

export default async function CompanyDetailPage({ params }: Props) {
  const { ico } = await params;

  if (!/^\d{8}$/.test(ico)) notFound();

  let company: AresRegistrace;
  try {
    company = await getCompanyDetail(ico);
  } catch {
    notFound();
  }

  // Fetch all external data in parallel
  const city = company.sidlo?.nazevObce;
  const [firmyCz, hlidac, vrPeople] = await Promise.all([
    findFirmyCz(company.obchodniJmeno, city),
    getHlidacStats(ico),
    getCompanyVrPeople(ico),
  ]);

  const address = formatAddress(company.sidlo);
  const legalForm = getLegalFormLabel(company.pravniForma);
  const founded = company.datumVzniku
    ? new Date(company.datumVzniku).toLocaleDateString('cs-CZ', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  // People come from the VR (Veřejný rejstřík) endpoint
  const allPeople = vrPeople;

  const naceActivities = company.czNace ?? [];

  // Find VR (Obchodní rejstřík) file number from dalsiUdaje
  const dalsiUdaje = (company as unknown as { dalsiUdaje?: Array<{ datovyZdroj?: string; spisovaZnacka?: string }> }).dalsiUdaje;
  const vrData = dalsiUdaje?.find((d) => d.datovyZdroj === 'vr');
  const spisovaZnacka = vrData?.spisovaZnacka;

  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(company.obchodniJmeno + ' kontakt')}`;
  const linkedinSearchUrl = `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(company.obchodniJmeno)}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Zpět na vyhledávání
          </Link>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                {company.obchodniJmeno}
              </h1>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                  IČO: {company.ico}
                </span>
                <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                  {legalForm}
                </span>
                {company.datumZaniku && (
                  <span className="text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                    Zaniklá firma
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-1 space-y-4">
            {/* Basic info */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-400" />
                Základní informace
              </h2>
              <InfoRow icon={<Hash className="w-4 h-4 text-gray-500" />} label="IČO" value={company.ico} />
              <InfoRow icon={<Building2 className="w-4 h-4 text-gray-500" />} label="Právní forma" value={legalForm} />
              <InfoRow icon={<MapPin className="w-4 h-4 text-gray-500" />} label="Sídlo" value={address} />
              {company.sidlo?.nazevKraje && (
                <InfoRow icon={<MapPin className="w-4 h-4 text-gray-500" />} label="Kraj" value={company.sidlo.nazevKraje} />
              )}
              {founded && (
                <InfoRow icon={<Calendar className="w-4 h-4 text-gray-500" />} label="Datum vzniku" value={founded} />
              )}
              {spisovaZnacka && (
                <InfoRow icon={<Hash className="w-4 h-4 text-gray-500" />} label="Spisová značka" value={spisovaZnacka} />
              )}
            </div>

            {/* NACE */}
            {naceActivities.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Ekonomické činnosti (NACE)
                </h2>
                <div className="flex flex-wrap gap-2">
                  {naceActivities.slice(0, 8).map((code) => (
                    <span key={code} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full">
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* External links */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Rejstříky
              </h2>
              <div className="space-y-2">
                <a href={`https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${company.ico}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  <ExternalLink className="w-3.5 h-3.5" /> ARES (raw data)
                </a>
                <a href={`https://or.justice.cz/ias/ui/rejstrik-firma.vysledky?subjektId=&typ=PLATNE&pf=&ico=${company.ico}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  <ExternalLink className="w-3.5 h-3.5" /> Obchodní rejstřík
                </a>
                <a href={`https://www.rzp.cz/cgi-bin/aps_cacheWEB.sh?VSS_SERV=ZVWSBJVYP&SUBJID=${company.ico}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  <ExternalLink className="w-3.5 h-3.5" /> Živnostenský rejstřík
                </a>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Management */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                Vedení & vlastnictví
              </h2>

              {allPeople.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Informace o vedení nejsou v ARES dostupné pro tuto firmu.
                  </p>
                  <a href={`https://or.justice.cz/ias/ui/rejstrik-firma.vysledky?subjektId=&typ=PLATNE&pf=&ico=${company.ico}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Zobrazit v obchodním rejstříku
                  </a>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 pb-2 uppercase tracking-wider">Jméno</th>
                        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 pb-2 uppercase tracking-wider">Funkce</th>
                        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 pb-2 uppercase tracking-wider hidden md:table-cell">Město</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allPeople.map((person, i) => {
                        const personQuery = encodeURIComponent(`${person.name} ${company.obchodniJmeno}`);
                        const linkedinUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(person.name)}`;
                        const googleUrl = `https://www.google.com/search?q=${personQuery}`;
                        const hlidacPersonUrl = `https://www.hlidacstatu.cz/hledat?q=${encodeURIComponent(person.name)}&tab=osoby`;
                        return (
                          <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                            <td className="py-3 pr-3">
                              <p className="font-medium text-gray-900 dark:text-white text-sm">{person.name || '—'}</p>
                              {/* Contact search links */}
                              {person.name && (
                                <div className="flex items-center gap-2 mt-1">
                                  <a href={linkedinUrl} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                                    <Linkedin className="w-3 h-3" />LinkedIn
                                  </a>
                                  <span className="text-gray-300 dark:text-gray-600">·</span>
                                  <a href={googleUrl} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:underline">
                                    <Search className="w-3 h-3" />Google
                                  </a>
                                  <span className="text-gray-300 dark:text-gray-600">·</span>
                                  <a href={hlidacPersonUrl} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:underline">
                                    <ExternalLink className="w-3 h-3" />Hlídač
                                  </a>
                                </div>
                              )}
                            </td>
                            <td className="py-3 pr-4 align-top">
                              <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                {person.role}
                              </span>
                            </td>
                            <td className="py-3 text-gray-500 dark:text-gray-400 text-xs hidden md:table-cell align-top">{person.city ?? '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="mt-3 flex gap-1.5 items-start p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-500">
                      Přímý telefon a email jednatelů nejsou v žádném veřejném registru ČR (GDPR). Použijte LinkedIn nebo Google pro vyhledání kontaktu.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Hlídač státu */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                Hlídač státu
              </h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Smlouvy */}
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Smlouvy</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white">{hlidac.smlouvyCount.toLocaleString('cs-CZ')}</p>
                  </div>
                </div>
                {/* Dotace */}
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                    <Banknote className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Dotace</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white">{hlidac.dotaceCount.toLocaleString('cs-CZ')}</p>
                  </div>
                </div>
                {/* Covid podpora */}
                {hlidac.covidCount > 0 && (
                  <div className="flex items-center gap-2.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                      <HeartHandshake className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs text-amber-700 dark:text-amber-400">Covid podpora</p>
                      <p className="text-base font-bold text-amber-900 dark:text-amber-300">{hlidac.covidCount}×</p>
                    </div>
                  </div>
                )}
                {/* Insolvence */}
                <div className={`flex items-center gap-2.5 p-3 rounded-lg border ${
                  hlidac.isInsolvent
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                } ${hlidac.covidCount > 0 ? '' : 'col-span-1'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    hlidac.isInsolvent ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'
                  }`}>
                    {hlidac.isInsolvent
                      ? <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
                      : <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                    }
                  </div>
                  <div>
                    <p className={`text-xs ${hlidac.isInsolvent ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                      Insolvence
                    </p>
                    <p className={`text-sm font-semibold ${hlidac.isInsolvent ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>
                      {hlidac.isInsolvent ? `${hlidac.insolvenceCount}× evidována` : 'Neevidována'}
                    </p>
                  </div>
                </div>
              </div>
              <a
                href={`https://www.hlidacstatu.cz/Firma/${ico}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Zobrazit na Hlídač státu
              </a>
            </div>

            {/* Contact section */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                Kontaktní údaje
              </h2>

              {/* Firmy.cz match — if found */}
              {firmyCz ? (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Nalezena shoda na <strong>Firmy.cz</strong> — největší česká firemní databáze s telefony, emaily a webem:
                  </p>
                  <a
                    href={firmyCz.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-blue-700 dark:text-blue-300 text-sm group-hover:underline">
                        {firmyCz.sentence}
                      </p>
                      <p className="text-xs text-blue-600/70 dark:text-blue-400/70 truncate mt-0.5">
                        {firmyCz.loc}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-blue-500 shrink-0" />
                  </a>
                </div>
              ) : (
                <div className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Firma nebyla automaticky nalezena na Firmy.cz. Zkuste vyhledat ručně:
                  </p>
                  <a
                    href={`https://www.firmy.cz/?query=${encodeURIComponent(company.obchodniJmeno)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Hledat na Firmy.cz
                  </a>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-gray-100 dark:border-gray-700 my-4" />

              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Další možnosti hledání:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <a
                  href={googleSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300"
                >
                  <Search className="w-4 h-4 text-gray-400" />
                  Google
                </a>
                <a
                  href={linkedinSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300"
                >
                  <Linkedin className="w-4 h-4 text-gray-400" />
                  LinkedIn
                </a>
                <a
                  href={`https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(company.obchodniJmeno)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300"
                >
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                  Heureka
                </a>
              </div>

              {/* GDPR notice */}
              <div className="mt-4 flex gap-2.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed">
                  Telefon a email nejsou součástí veřejných rejstříků (ARES, OR) z důvodu GDPR.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
