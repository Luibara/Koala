'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Building2, Search } from 'lucide-react';
import type { AresSearchResult } from '@/types/company';
import SearchBar from '@/components/SearchBar';
import FilterPanel from '@/components/FilterPanel';
import CompanyCard from '@/components/CompanyCard';
import Pagination from '@/components/Pagination';
import LoadingSkeleton from '@/components/LoadingSkeleton';

const PAGE_SIZE = 20;


export default function HomePage() {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('');
  const [page, setPage] = useState(1);

  const [results, setResults] = useState<AresSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchCompanies = useCallback(async (q: string, r: string, p: number) => {
    if (!q.trim() && !r) {
      setResults(null);
      setLoading(false);
      return;
    }

    // Cancel previous request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (q.trim()) params.set('query', q.trim());
    if (r) params.set('region', r);
    params.set('page', String(p));

    try {
      const res = await fetch(`/api/companies?${params.toString()}`, {
        signal: abortRef.current.signal,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message ?? 'Chyba při načítání dat z ARES');
      }
      setResults(data as AresSearchResult);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Neznámá chyba');
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce on query/filter change, reset page
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchCompanies(query, region, 1);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, region]);

  // Immediate fetch on page change
  useEffect(() => {
    if (page === 1) return; // already handled by filter effect
    fetchCompanies(query, region, page);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleRegionChange = (v: string) => { setRegion(v); setPage(1); };
  const handleQueryChange = (v: string) => { setQuery(v); setPage(1); };

  const hasSearch = query.trim() || region;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                Czech Companies
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Data z ARES — Administrativní registr ekonomických subjektů
              </p>
            </div>
          </div>
          <SearchBar value={query} onChange={handleQueryChange} />
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <FilterPanel
            region={region}
            onRegionChange={handleRegionChange}
          />

          <div className="flex-1 min-w-0">
            {/* Result count */}
            {hasSearch && results && !loading && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Nalezeno{' '}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {results.pocetCelkem.toLocaleString('cs-CZ')}
                </span>{' '}
                firem
              </p>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4 text-sm text-red-700 dark:text-red-400">
                ⚠️ {error} — zkuste to prosím znovu.
              </div>
            )}

            {/* Loading skeleton */}
            {loading && <LoadingSkeleton />}

            {/* Empty state */}
            {!loading && !hasSearch && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Vyhledejte firmu
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
                  Zadejte název firmy nebo vyberte kraj pomocí filtrů vlevo.
                  Data pocházejí z&nbsp;
                  <a
                    href="https://ares.gov.cz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    ARES
                  </a>
                  .
                </p>
              </div>
            )}

            {/* No results */}
            {!loading && hasSearch && results?.pocetCelkem === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <Building2 className="w-7 h-7 text-gray-400" />
                </div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                  Žádné výsledky
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Zkuste změnit hledaný výraz nebo filtry.
                </p>
              </div>
            )}

            {/* Grid */}
            {!loading && results && results.ekonomickeSubjekty.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {results.ekonomickeSubjekty.map((company) => (
                    <CompanyCard key={company.ico} company={company} />
                  ))}
                </div>
                <Pagination
                  page={page}
                  total={results.pocetCelkem}
                  pageSize={PAGE_SIZE}
                  onChange={setPage}
                />
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-12 border-t border-gray-200 dark:border-slate-700 py-6">
        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
          Data poskytuje{' '}
          <a
            href="https://ares.gov.cz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            ARES (Ministerstvo financí ČR)
          </a>{' '}
          — veřejně dostupná data
        </p>
      </footer>
    </div>
  );
}
