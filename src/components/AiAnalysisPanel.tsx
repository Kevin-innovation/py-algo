import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  content: string;
  isLoading: boolean;
  progress: number;
  onClose: () => void;
}

const getLoadingLabel = (progress: number): string => {
  if (progress < 25) return '코드 구조를 파악하는 중...';
  if (progress < 50) return '핵심 로직을 분석하는 중...';
  if (progress < 75) return '복잡도와 개선 포인트를 정리하는 중...';
  if (progress < 100) return '분석 결과를 문서화하는 중...';
  return '마무리 중...';
};

export default function AiAnalysisPanel({ content, isLoading, progress, onClose }: Props) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="absolute inset-0 bg-panel flex flex-col z-40 border-l border-border h-full overflow-hidden">
      <div className="h-10 bg-panel-alt border-b border-border flex items-center justify-between px-4 shrink-0">
        <h2 className="text-foreground font-semibold text-sm">AI 코드 분석 결과</h2>
        <button
          onClick={onClose}
          className="text-foreground-secondary hover:text-foreground transition-colors"
          title="닫기"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="mb-6 rounded-[var(--radius-lg)] border border-border bg-panel-alt p-4">
            <div className="mb-2 flex items-center gap-2 text-[var(--analysis-section)]">
              <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-[var(--analysis-marker)]" />
              <span className="text-sm font-semibold">분석 중...</span>
            </div>
            <p className="mb-3 text-sm text-[var(--analysis-body)]">{getLoadingLabel(clampedProgress)}</p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-background border border-[var(--analysis-code-border)]">
              <div
                className="h-full rounded-full bg-[var(--analysis-marker)] transition-all duration-500"
                style={{ width: `${clampedProgress}%` }}
              />
            </div>
            <div className="mt-2 text-right text-xs font-medium text-[var(--analysis-muted)]">{clampedProgress}%</div>
          </div>
        ) : null}
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="mb-4 text-2xl font-bold tracking-tight text-[var(--analysis-title)]">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="mb-3 mt-10 border-l-4 border-[var(--analysis-marker)] pl-3 text-xl font-bold text-[var(--analysis-section)]">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="mb-3 mt-7 text-lg font-semibold text-[var(--analysis-subsection)]">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="mb-4 leading-8 text-[var(--analysis-body)]">{children}</p>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-[var(--analysis-strong)]">{children}</strong>
            ),
            ul: ({ children }) => (
              <ul className="mb-5 list-disc space-y-2 pl-6 marker:text-[var(--analysis-marker)]">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="mb-5 list-decimal space-y-2 pl-6 marker:font-semibold marker:text-[var(--analysis-marker)]">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="text-[var(--analysis-body)] leading-8">{children}</li>
            ),
            hr: () => <hr className="my-8 border-[var(--analysis-divider)]" />,
            blockquote: ({ children }) => (
              <blockquote className="my-6 rounded-[var(--radius-md)] border-l-4 border-[var(--analysis-quote-border)] bg-[var(--analysis-quote-bg)] px-4 py-3 text-[var(--analysis-quote-text)]">
                {children}
              </blockquote>
            ),
            pre: ({ children }) => (
              <pre className="my-4 overflow-x-auto rounded-[var(--radius-md)] border border-[var(--analysis-code-border)] bg-[var(--analysis-code-bg)] p-3">
                {children}
              </pre>
            ),
            code: ({ children }) => {
              return (
                <code className="rounded border border-[var(--analysis-code-border)] bg-[var(--analysis-code-bg)] px-1.5 py-0.5 text-[13px] font-medium text-[var(--analysis-code-text)]">
                  {children}
                </code>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
