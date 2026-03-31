"use client";

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import ThemeToggle from '../../components/ThemeToggle';
import AlgorithmDetail from '../../components/learn/AlgorithmDetail';
import AlgorithmSidebar from '../../components/learn/AlgorithmSidebar';
import { getAlgorithmById, getAlgorithmsByCategory } from '../../data/algorithms/index';
import { useStore } from '../../store/useStore';
import type { AlgorithmCategory } from '../../data/algorithms';

const FALLBACK_CATEGORY: AlgorithmCategory = 'sorting';

export default function LearnPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const theme = useStore((state) => state.theme);
  const setCode = useStore((state) => state.setCode);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const selectedAlgorithmId = searchParams.get('algo');
  const selectedAlgorithm = useMemo(
    () => (selectedAlgorithmId ? getAlgorithmById(selectedAlgorithmId) : undefined),
    [selectedAlgorithmId],
  );

  const selectedCategory: AlgorithmCategory = selectedAlgorithm?.category ?? FALLBACK_CATEGORY;
  const algorithmsInCategory = useMemo(
    () => getAlgorithmsByCategory(selectedCategory),
    [selectedCategory],
  );

  useEffect(() => {
    if (selectedAlgorithmId && selectedAlgorithm) return;
    const first = algorithmsInCategory[0];
    if (!first) return;
    router.replace(`/learn?algo=${first.id}`);
  }, [algorithmsInCategory, router, selectedAlgorithm, selectedAlgorithmId]);

  const handleSelectCategory = (category: AlgorithmCategory) => {
    const first = getAlgorithmsByCategory(category)[0];
    if (!first) return;
    router.push(`/learn?algo=${first.id}`);
  };

  const handleRunInEditor = (algorithmCode: string) => {
    setCode(algorithmCode);
    router.push('/');
  };

  return (
    <div className="flex h-full bg-gray-900 overflow-hidden flex-col w-full" data-testid="learn-page">
      <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center px-6 justify-between shadow-sm shrink-0" data-testid="app-header">
        <h1 className="text-white font-bold text-2xl tracking-tight flex items-baseline gap-2">
          <span><span className="text-orange-500">DLAB</span> <span className="text-blue-500">Py</span>Algo</span>
          <span className="text-sm font-medium text-gray-400 tracking-normal">learn mode</span>
        </h1>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-sm text-gray-200 bg-gray-700 hover:bg-gray-600 rounded px-3 py-1 transition-colors"
            data-testid="nav-editor"
          >
            에디터
          </Link>
          <Link
            href="/learn"
            className="text-sm text-white bg-gray-700 hover:bg-gray-600 rounded px-3 py-1 transition-colors"
            data-testid="nav-learn"
            aria-current={pathname === '/learn' ? 'page' : undefined}
          >
            학습
          </Link>
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        <AlgorithmSidebar selectedCategory={selectedCategory} onSelectCategory={handleSelectCategory} />
        <div className="flex-1 min-h-0">
          {selectedAlgorithm ? (
            <AlgorithmDetail
              algorithm={selectedAlgorithm}
              onRunInEditor={(algorithm) => handleRunInEditor(algorithm.code)}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-300" data-testid="learn-empty-state">
              표시할 알고리즘이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
