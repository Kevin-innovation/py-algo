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

  const handleSelectAlgorithm = (algorithmId: string) => {
    router.push(`/learn?algo=${algorithmId}`);
  };

  const handleRunInEditor = (algorithmCode: string) => {
    setCode(algorithmCode);
    router.push('/');
  };

  return (
    <div className="flex h-full bg-background overflow-hidden flex-col w-full" data-testid="learn-page">
      <div className="h-[var(--spacing-header)] bg-header border-b border-border flex items-center px-6 justify-between shrink-0" data-testid="app-header">
        <h1 className="text-foreground font-semibold text-[var(--text-section-title)] tracking-tight flex items-baseline gap-2">
          <span><span className="text-orange-500">DLAB</span> <span className="text-blue-500">Py</span>Algo</span>
          <span className="text-[var(--text-small)] font-medium text-foreground-secondary tracking-normal">learn mode</span>
        </h1>
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-1 bg-panel-alt p-1 rounded-[var(--radius-md)] border border-border">
            <Link
              href="/"
              className="inline-flex h-9 items-center justify-center rounded-[var(--radius-sm)] px-3 text-[var(--text-body)] text-foreground-secondary transition-colors hover:bg-panel hover:text-foreground"
              data-testid="nav-editor"
            >
              에디터
            </Link>
            <Link
              href="/learn"
              className="inline-flex h-9 items-center justify-center rounded-[var(--radius-sm)] bg-panel px-3 text-[var(--text-body)] font-medium text-foreground shadow-sm transition-colors"
              data-testid="nav-learn"
              aria-current={pathname === '/learn' ? 'page' : undefined}
            >
              학습
            </Link>
          </nav>
          <div className="w-px h-4 bg-border"></div>
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 p-4 gap-4">
        <div className="w-full lg:w-[320px] shrink-0 flex flex-col min-h-0 bg-panel border border-border rounded-[var(--radius-lg)] shadow-sm overflow-hidden">
          <AlgorithmSidebar
            selectedCategory={selectedCategory}
            selectedAlgorithmId={selectedAlgorithmId}
            algorithmsInCategory={algorithmsInCategory}
            onSelectCategory={handleSelectCategory}
            onSelectAlgorithm={handleSelectAlgorithm}
          />
        </div>
        <div className="flex-1 min-h-0 bg-panel border border-border rounded-[var(--radius-lg)] shadow-sm overflow-hidden">
          {selectedAlgorithm ? (
            <AlgorithmDetail
              algorithm={selectedAlgorithm}
              onRunInEditor={(algorithm) => handleRunInEditor(algorithm.code)}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-[var(--text-body)] text-foreground-secondary" data-testid="learn-empty-state">
              표시할 알고리즘이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
