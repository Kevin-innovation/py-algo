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
      <div className="bg-panel border-b border-border p-3 shrink-0">
        <div className="text-sm font-semibold text-foreground">함수 기록</div>
        <div className="text-xs text-foreground-secondary mt-1">호출 및 반환 이벤트가 여기에 표시됩니다.</div>
      </div>
    );
  }

  return (
    <div className="bg-panel border-b border-border p-3 shrink-0">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground">함수 기록</h3>
        <span className="text-[11px] text-foreground-secondary">{timelineMeta.functionHistory.length}개 이벤트</span>
      </div>
      <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
        {timelineMeta.functionHistory.map((item) => {
          const isActive = item.stepIndex === currentStepIndex;
          return (
            <button
              key={`${item.type}-${item.stepIndex}-${item.funcName}`}
              type="button"
              onClick={() => setCurrentStepIndex(item.stepIndex)}
              className={`w-full text-left rounded px-2 py-1 border text-xs font-mono transition-colors ${isActive ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-background border-border text-foreground-secondary hover:border-border'}`}
              title={`단계 ${item.stepIndex + 1}(으)로 이동`}
            >
              <span className="uppercase tracking-wide text-[10px] mr-2 text-foreground-secondary">{item.type}</span>
              {item.funcName}() @ {item.line}번째 줄
              <span className="text-foreground-secondary ml-2">단계 {item.stepIndex + 1}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
