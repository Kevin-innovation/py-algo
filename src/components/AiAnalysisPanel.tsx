import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  content: string;
  onClose: () => void;
}

export default function AiAnalysisPanel({ content, onClose }: Props) {
  return (
    <div className="absolute inset-0 bg-gray-900 flex flex-col z-40 border-l border-gray-700 h-full overflow-hidden">
      <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 shrink-0">
        <h2 className="text-white font-semibold text-sm">AI 코드 분석 결과</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
          title="닫기"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 prose prose-invert max-w-none prose-headings:text-blue-400 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-strong:text-white prose-code:text-pink-400 prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-700 prose-blockquote:border-l-blue-500 prose-blockquote:bg-gray-800/50 prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:not-italic prose-blockquote:text-gray-300 prose-li:marker:text-blue-500 prose-hr:border-gray-700 leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
