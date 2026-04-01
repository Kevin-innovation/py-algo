import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  content: string;
  onClose: () => void;
}

export default function AiAnalysisPanel({ content, onClose }: Props) {
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
      <div className="flex-1 overflow-y-auto p-6 prose max-w-none prose-headings:text-foreground prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-foreground-secondary prose-a:text-accent hover:prose-a:text-accent/80 prose-strong:text-foreground prose-code:text-foreground prose-code:bg-background prose-code:border prose-code:border-border prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-background prose-pre:border prose-pre:border-border prose-blockquote:border-l-border prose-blockquote:bg-panel-alt prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:not-italic prose-blockquote:text-foreground-secondary prose-li:marker:text-accent prose-hr:border-border leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
