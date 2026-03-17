'use client';

import Link from 'next/link';
import { Building2, MapPin, Calendar, ArrowRight } from 'lucide-react';
import type { AresCompany } from '@/types/company';
import { formatAddress, getLegalFormLabel } from '@/lib/ares';

interface Props {
  company: AresCompany;
}

export default function CompanyCard({ company }: Props) {
  const address = formatAddress(company.sidlo);
  const region = company.sidlo?.nazevKraje ?? company.sidlo?.nazevObce ?? '';
  const legalForm = getLegalFormLabel(company.pravniForma);
  const year = company.datumVzniku ? new Date(company.datumVzniku).getFullYear() : null;

  return (
    <Link href={`/company/${company.ico}`} className="group block">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {company.obchodniJmeno}
              </h3>
              <span className="inline-block text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full mt-1">
                {legalForm}
              </span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors shrink-0 mt-1" />
        </div>

        {/* Details */}
        <div className="space-y-2 flex-1">
          {region && (
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
              <span className="truncate">{region}</span>
            </div>
          )}
          <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400 mt-0.5" />
            <span className="line-clamp-2">{address}</span>
          </div>
          {year && (
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <Calendar className="w-3.5 h-3.5 shrink-0 text-gray-400" />
              <span>Zapsána {year}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
            IČO: {company.ico}
          </span>
          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium group-hover:underline">
            Detail →
          </span>
        </div>
      </div>
    </Link>
  );
}
