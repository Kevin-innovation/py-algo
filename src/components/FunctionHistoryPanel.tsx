"use client";

import { useMemo } from 'react';
import { buildTimelineMetadata, useStore } from '../store/useStore';

export default function FunctionHistoryPanel() {
  const currentStepIndex = useStore((state) => state.currentStepIndex);
  const setCurrentStepIndex = useStore((state) => state.setCurrentStepIndex);
  const timeline = useStore((state) => state.timeline);
  const breakpoints = useStore((state) => state.breakpoints);
  const timelineMeta = useMemo(() => buildTimelineMetadata(timeline, breakpoints), [timeline, breakpoints]);

  if (timelineMeta.functionHistory.length === 0) {
    return (
      <div className="bg-gray-900 border-b border-gray-700 p-3 shrink-0">
        <div className="text-sm font-semibold text-gray-200">함수 기록</div>
        <div className="text-xs text-gray-500 mt-1">호출 및 반환 이벤트가 여기에 표시됩니다.</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border-b border-gray-700 p-3 shrink-0">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-200">함수 기록</h3>
        <span className="text-[11px] text-gray-500">{timelineMeta.functionHistory.length}개 이벤트</span>
      </div>
      <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
        {timelineMeta.functionHistory.map((item) => {
          const isActive = item.stepIndex === currentStepIndex;
          return (
            <button
              key={`${item.type}-${item.stepIndex}-${item.funcName}`}
              type="button"
              onClick={() => setCurrentStepIndex(item.stepIndex)}
              className={`w-full text-left rounded px-2 py-1 border text-xs font-mono transition-colors ${isActive ? 'bg-blue-900/30 border-blue-500/70 text-blue-200' : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'}`}
              title={`단계 ${item.stepIndex + 1}(으)로 이동`}
            >
              <span className="uppercase tracking-wide text-[10px] mr-2 text-gray-400">{item.type}</span>
              {item.funcName}() @ {item.line}번째 줄
              <span className="text-gray-500 ml-2">단계 {item.stepIndex + 1}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
