'use client';

import { SlidersHorizontal } from 'lucide-react';
import { REGIONS } from '@/types/company';

interface Props {
  region: string;
  onRegionChange: (v: string) => void;
}

export default function FilterPanel({ region, onRegionChange }: Props) {
  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 sticky top-4">
        <div className="flex items-center gap-2 mb-5">
          <SlidersHorizontal className="w-4 h-4 text-blue-600" />
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Filtry</h2>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
            Kraj
          </label>
          <select
            value={region}
            onChange={(e) => onRegionChange(e.target.value)}
            className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          >
            {Object.entries(REGIONS).map(([kod, nazev]) => (
              <option key={kod} value={kod}>
                {nazev}
              </option>
            ))}
          </select>
        </div>

        {region && (
          <button
            onClick={() => onRegionChange('')}
            className="mt-5 w-full text-sm text-blue-600 dark:text-blue-400 hover:underline text-center"
          >
            Zrušit filtr
          </button>
        )}
      </div>
    </aside>
  );
}
