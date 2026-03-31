import { Algorithm } from '../../data/algorithms';

interface AlgorithmDetailProps {
  algorithm: Algorithm;
  onRunInEditor?: (algorithm: Algorithm) => void;
}

export default function AlgorithmDetail({ algorithm, onRunInEditor }: AlgorithmDetailProps) {
  return (
    <div className="flex flex-col h-full bg-gray-900 text-white overflow-y-auto p-6 space-y-8" data-testid="algorithm-detail">
      {/* Header */}
      <div className="flex justify-between items-start border-b border-gray-700 pb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-bold text-white" data-testid="algo-name">{algorithm.name}</h2>
            <span className="px-2.5 py-1 bg-gray-800 text-gray-300 text-xs font-medium rounded-full border border-gray-700 uppercase tracking-wider" data-testid="algo-category">
              {algorithm.category}
            </span>
          </div>
          <p className="text-gray-400 text-lg" data-testid="algo-description">{algorithm.description}</p>
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
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-1 uppercase tracking-wider">시간 복잡도</h3>
          <p className="text-xl font-mono text-orange-400" data-testid="algo-time-complexity">{algorithm.timeComplexity}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-1 uppercase tracking-wider">공간 복잡도</h3>
          <p className="text-xl font-mono text-blue-400" data-testid="algo-space-complexity">{algorithm.spaceComplexity}</p>
        </div>
      </div>

      {/* How it works */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          동작 원리
        </h3>
        <ul className="space-y-3" data-testid="algo-how-it-works">
          {algorithm.howItWorks.map((step, index) => (
            <li key={index} className="flex gap-3 text-gray-300 bg-gray-800/50 p-3 rounded-md border border-gray-700/50">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-700 text-gray-300 flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Code */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          구현 코드
        </h3>
        <div className="bg-[#1e1e1e] rounded-lg border border-gray-700 overflow-hidden">
          <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Python</span>
          </div>
          <pre className="p-4 overflow-x-auto text-sm font-mono text-gray-300 leading-relaxed" data-testid="algo-code">
            <code>{algorithm.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
