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
} from 'lucide-react';
import { getCompanyDetail, formatAddress, formatPersonName, getLegalFormLabel } from '@/lib/ares';
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

  const address = formatAddress(company.sidlo);
  const legalForm = getLegalFormLabel(company.pravniForma);
  const founded = company.datumVzniku
    ? new Date(company.datumVzniku).toLocaleDateString('cs-CZ', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  // Collect all people from statutory bodies and shareholders
  const allPeople: Array<{ name: string; role: string; address?: string }> = [];

  if (company.statutarniOrgany) {
    for (const organ of company.statutarniOrgany) {
      for (const clen of organ.clenove ?? []) {
        allPeople.push({
          name: formatPersonName(clen),
          role: clen.funkce ?? organ.nazev ?? 'Statutární orgán',
          address: clen.adresa?.textovaAdresa ?? clen.adresa?.nazevObce,
        });
      }
    }
  }

  if (company.spolecnici) {
    for (const s of company.spolecnici) {
      allPeople.push({
        name: formatPersonName(s),
        role: 'Společník',
        address: s.adresa?.textovaAdresa ?? s.adresa?.nazevObce,
      });
    }
  }

  const naceActivities = company.czNace ?? [];

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
          {/* Left column — basic info */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-400" />
                Základní informace
              </h2>

              <InfoRow
                icon={<Hash className="w-4 h-4 text-gray-500" />}
                label="IČO"
                value={company.ico}
              />
              <InfoRow
                icon={<Building2 className="w-4 h-4 text-gray-500" />}
                label="Právní forma"
                value={legalForm}
              />
              <InfoRow
                icon={<MapPin className="w-4 h-4 text-gray-500" />}
                label="Sídlo"
                value={address}
              />
              {company.sidlo?.nazevKraje && (
                <InfoRow
                  icon={<MapPin className="w-4 h-4 text-gray-500" />}
                  label="Kraj"
                  value={company.sidlo.nazevKraje}
                />
              )}
              {founded && (
                <InfoRow
                  icon={<Calendar className="w-4 h-4 text-gray-500" />}
                  label="Datum vzniku"
                  value={founded}
                />
              )}
            </div>

            {/* NACE activities */}
            {naceActivities.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Ekonomické činnosti (NACE)
                </h2>
                <div className="flex flex-wrap gap-2">
                  {naceActivities.slice(0, 8).map((code) => (
                    <span
                      key={code}
                      className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* External links */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Externí zdroje
              </h2>
              <div className="space-y-2">
                <a
                  href={`https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${company.ico}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  ARES (raw data)
                </a>
                <a
                  href={`https://or.justice.cz/ias/ui/rejstrik-firma.vysledky?subjektId=&typ=PLATNE&pf=&ico=${company.ico}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Obchodní rejstřík
                </a>
                <a
                  href={`https://www.rzp.cz/cgi-bin/aps_cacheWEB.sh?VSS_SERV=ZVWSBJVYP&SUBJID=${company.ico}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Živnostenský rejstřík
                </a>
              </div>
            </div>
          </div>

          {/* Right column — management */}
          <div className="lg:col-span-2 space-y-4">
            {/* Management & owners */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                Vedení & vlastnictví
              </h2>

              {allPeople.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Informace o vedení nejsou v ARES dostupné pro tuto firmu.
                  </p>
                  <a
                    href={`https://or.justice.cz/ias/ui/rejstrik-firma.vysledky?subjektId=&typ=PLATNE&pf=&ico=${company.ico}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Zobrazit v obchodním rejstříku
                  </a>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 pb-2 uppercase tracking-wider">
                          Jméno
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 pb-2 uppercase tracking-wider">
                          Funkce
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 pb-2 uppercase tracking-wider hidden md:table-cell">
                          Adresa
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {allPeople.map((person, i) => (
                        <tr
                          key={i}
                          className="border-b border-gray-100 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                        >
                          <td className="py-3 font-medium text-gray-900 dark:text-white pr-4">
                            {person.name || '—'}
                          </td>
                          <td className="py-3 text-gray-600 dark:text-gray-400 pr-4">
                            <span className="inline-block text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                              {person.role}
                            </span>
                          </td>
                          <td className="py-3 text-gray-500 dark:text-gray-400 text-xs hidden md:table-cell">
                            {person.address ?? '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Contact info disclaimer */}
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-amber-800 dark:text-amber-400 mb-1">
                    Kontaktní údaje
                  </h3>
                  <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed">
                    Telefonní čísla a emailové adresy nejsou součástí veřejných registrů (ARES,
                    obchodní rejstřík) z důvodu GDPR. Pro kontaktní údaje doporučujeme{' '}
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(company.obchodniJmeno + ' kontakt')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-medium"
                    >
                      Google
                    </a>
                    ,{' '}
                    <a
                      href={`https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(company.obchodniJmeno)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-medium"
                    >
                      LinkedIn
                    </a>{' '}
                    nebo web firmy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
