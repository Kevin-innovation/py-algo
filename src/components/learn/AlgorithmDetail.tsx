import { Algorithm } from '../../data/algorithms';

interface AlgorithmDetailProps {
  algorithm: Algorithm;
  onRunInEditor?: (algorithm: Algorithm) => void;
}

export default function AlgorithmDetail({ algorithm, onRunInEditor }: AlgorithmDetailProps) {
  return (
    <div className="flex flex-col h-full bg-panel text-foreground overflow-y-auto p-6 space-y-8" data-testid="algorithm-detail">
      {/* Header */}
      <div className="flex justify-between items-start border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-[var(--text-section-title)] font-bold text-foreground" data-testid="algo-name">{algorithm.name}</h2>
            <span className="px-2.5 py-1 bg-panel-alt text-foreground-secondary text-[var(--text-small)] font-medium rounded-full border border-border uppercase tracking-wider" data-testid="algo-category">
              {algorithm.category}
            </span>
          </div>
          <p className="text-foreground-secondary text-[var(--text-body)] leading-relaxed" data-testid="algo-description">{algorithm.description}</p>
        </div>
        <button
          onClick={() => onRunInEditor?.(algorithm)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 shrink-0"
          data-testid="run-in-editor-btn"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          에디터에서 실행
        </button>
      </div>

      {/* Complexity */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-background p-4 rounded-[var(--radius-lg)] border border-border shadow-sm">
          <h3 className="text-[var(--text-small)] font-medium text-foreground-secondary mb-1 uppercase tracking-wider">시간 복잡도</h3>
          <p className="text-xl font-mono text-orange-400" data-testid="algo-time-complexity">{algorithm.timeComplexity}</p>
        </div>
        <div className="bg-background p-4 rounded-[var(--radius-lg)] border border-border shadow-sm">
          <h3 className="text-[var(--text-small)] font-medium text-foreground-secondary mb-1 uppercase tracking-wider">공간 복잡도</h3>
          <p className="text-xl font-mono text-blue-400" data-testid="algo-space-complexity">{algorithm.spaceComplexity}</p>
        </div>
      </div>

      {/* How it works */}
      <div>
        <h3 className="text-[var(--text-section-title)] font-semibold text-foreground mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          동작 원리
        </h3>
        <ul className="space-y-3" data-testid="algo-how-it-works">
          {algorithm.howItWorks.map((step, index) => (
            <li key={index} className="flex gap-3 text-foreground-secondary bg-background p-3 rounded-[var(--radius-md)] border border-border shadow-sm">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-panel-alt text-foreground-secondary flex items-center justify-center text-[var(--text-small)] font-medium border border-border">
                {index + 1}
              </span>
              <span className="leading-relaxed text-[var(--text-body)]">{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Code */}
      <div>
        <h3 className="text-[var(--text-section-title)] font-semibold text-foreground mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          구현 코드
        </h3>
        <div className="bg-background rounded-[var(--radius-lg)] border border-border shadow-sm overflow-hidden">
          <div className="bg-panel-alt px-4 py-2 border-b border-border flex items-center">
            <span className="text-[var(--text-small)] font-medium text-foreground-secondary uppercase tracking-wider">Python</span>
          </div>
          <pre className="p-4 overflow-x-auto text-[var(--text-small)] font-mono text-foreground-secondary leading-relaxed" data-testid="algo-code">
            <code>{algorithm.code}</code>
          </pre>
        </div>
      </div>

      {/* Analogy - 개념 설명 (실생활 비유) */}
      {algorithm.analogy && (
        <div>
          <h3 className="text-[var(--text-section-title)] font-semibold text-foreground mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.073c.467 0 .884-.266 1.074-.66l2.858-5.714a1 1 0 00-.364-1.118l-2.858-5.714A1.25 1.25 0 008.663 5H4.073a1.25 1.25 0 00-1.074.66L.145 11.372a1 1 0 000 1.256l2.858 5.714c.19.394.607.66 1.074.66z" />
            </svg>
            개념 이해하기
          </h3>
          <div className="bg-background p-5 rounded-[var(--radius-lg)] border border-border shadow-sm">
            <p className="text-foreground-secondary leading-relaxed text-[var(--text-body)]" data-testid="algo-analogy">
              {algorithm.analogy}
            </p>
          </div>
        </div>
      )}

      {/* Pros and Cons - 장단점 */}
      {algorithm.prosCons && (
        <div>
          <h3 className="text-[var(--text-section-title)] font-semibold text-foreground mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            장단점
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {algorithm.prosCons.pros.length > 0 && (
              <div className="bg-green-500/5 p-4 rounded-[var(--radius-lg)] border border-green-500/20 shadow-sm">
                <h4 className="text-[var(--text-small)] font-semibold text-green-400 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  장점
                </h4>
                <ul className="space-y-2" data-testid="algo-pros">
                  {algorithm.prosCons.pros.map((pro, index) => (
                    <li key={index} className="flex gap-2 text-foreground-secondary text-[var(--text-body)]">
                      <span className="text-green-400">•</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {algorithm.prosCons.cons.length > 0 && (
              <div className="bg-red-500/5 p-4 rounded-[var(--radius-lg)] border border-red-500/20 shadow-sm">
                <h4 className="text-[var(--text-small)] font-semibold text-red-400 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  단점
                </h4>
                <ul className="space-y-2" data-testid="algo-cons">
                  {algorithm.prosCons.cons.map((con, index) => (
                    <li key={index} className="flex gap-2 text-foreground-secondary text-[var(--text-body)]">
                      <span className="text-red-400">•</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Examples - 실전 예제 */}
      {algorithm.examples && algorithm.examples.length > 0 && (
        <div>
          <h3 className="text-[var(--text-section-title)] font-semibold text-foreground mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-1.396a1.5 1.5 0 00-1.86 0l-2.387 1.396a2 2 0 01-1.022.547l-3.146.874a2 2 0 01-1.86-1.022l-.874-3.146a2 2 0 00-.547-1.022L3.9 11.172a1.5 1.5 0 010-1.86l1.396-2.387a2 2 0 00.547-1.022L5.77 2.6a2 2 0 011.022-.547l3.146-.874a2 2 0 011.86 0l2.387 1.396a2 2 0 001.022.547l3.146.874a2 2 0 001.86 1.022l.874 3.146a2 2 0 00.547 1.022l1.396 2.387a1.5 1.5 0 010 1.86z" />
            </svg>
            실전 활용 예시
          </h3>
          <ul className="space-y-3" data-testid="algo-examples">
            {algorithm.examples.map((example, index) => (
              <li key={index} className="flex gap-3 text-foreground-secondary bg-background p-3 rounded-[var(--radius-md)] border border-border shadow-sm">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-[var(--text-small)] font-bold border border-indigo-500/20">
                  {index + 1}
                </span>
                <span className="leading-relaxed text-[var(--text-body)]">{example}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Practice Problems - 연습 문제 */}
      {algorithm.practiceProblems && algorithm.practiceProblems.length > 0 && (
        <div>
          <h3 className="text-[var(--text-section-title)] font-semibold text-foreground mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M4 16h.01" />
            </svg>
            연습 문제
          </h3>
          <ul className="space-y-3" data-testid="algo-practice-problems">
            {algorithm.practiceProblems.map((problem, index) => (
              <li key={index} className="flex gap-3 text-foreground-secondary bg-background p-3 rounded-[var(--radius-md)] border border-border shadow-sm">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-500/10 text-pink-400 flex items-center justify-center text-[var(--text-small)] font-bold border border-pink-500/20">
                  Q{index + 1}
                </span>
                <span className="leading-relaxed text-[var(--text-body)]">{problem}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Caveats - 주의사항 */}
      {algorithm.caveats && algorithm.caveats.length > 0 && (
        <div>
          <h3 className="text-[var(--text-section-title)] font-semibold text-foreground mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 0v2m0 0h2m0 0v2m0 0h2m0 0v2m0 0v2m0 0h2m0 0v2M7 5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H7z" />
            </svg>
            주의사항
          </h3>
          <div className="bg-orange-500/5 p-5 rounded-[var(--radius-lg)] border border-orange-500/20 shadow-sm">
            <ul className="space-y-2" data-testid="algo-caveats">
              {algorithm.caveats.map((caveat, index) => (
                <li key={index} className="flex gap-2 text-foreground-secondary text-[var(--text-body)]">
                  <span className="text-orange-400">⚠</span>
                  <span>{caveat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
