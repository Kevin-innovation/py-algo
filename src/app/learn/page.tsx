import { Suspense } from 'react';
import LearnPageClient from './LearnPageClient';

export default function LearnPage() {
  return (
    <Suspense fallback={<div className="h-full flex items-center justify-center text-gray-300" data-testid="learn-loading-state">학습 페이지를 불러오는 중...</div>}>
      <LearnPageClient />
    </Suspense>
  );
}
