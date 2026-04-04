"use client";

import { useEffect, useMemo, useState } from 'react';
import { buildTimelineMetadata, useStore } from '../store/useStore';

interface FunctionHistoryPanelProps {
  showAdvancedMemory: boolean;
  onToggleAdvancedMemory: () => void;
  showAllPointers: boolean;
  onToggleShowAllPointers: () => void;
}

export default function FunctionHistoryPanel({
  showAdvancedMemory,
  onToggleAdvancedMemory,
  showAllPointers,
  onToggleShowAllPointers,
}: FunctionHistoryPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const currentStepIndex = useStore((state) => state.currentStepIndex);
  const setCurrentStepIndex = useStore((state) => state.setCurrentStepIndex);
  const timeline = useStore((state) => state.timeline);
  const breakpoints = useStore((state) => state.breakpoints);
  const timelineMeta = useMemo(() => buildTimelineMetadata(timeline, breakpoints), [timeline, breakpoints]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('functionHistoryCollapsed');
      queueMicrotask(() => {
        setCollapsed(stored === 'true');
      });
    } catch {
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem('functionHistoryCollapsed', String(next));
      } catch {
      }
      return next;
    });
  };

  if (timelineMeta.functionHistory.length === 0) {
    return (
      <div className="bg-panel border-b border-border p-3 shrink-0">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-foreground">함수 기록</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleCollapsed}
              className="inline-flex h-7 items-center rounded-[var(--radius-sm)] border border-border bg-background px-2 text-[var(--text-small)] text-foreground-secondary transition-colors hover:bg-panel hover:text-foreground"
            >
              {collapsed ? '기록 펼치기' : '기록 접기'}
            </button>
            <button
              type="button"
              onClick={onToggleShowAllPointers}
              className="inline-flex h-7 items-center rounded-[var(--radius-sm)] border border-border bg-background px-2 text-[var(--text-small)] text-foreground-secondary transition-colors hover:bg-panel hover:text-foreground"
            >
              {showAllPointers ? '전체 화살표 끄기' : '전체 화살표 켜기'}
            </button>
            <button
              type="button"
              onClick={onToggleAdvancedMemory}
              className="inline-flex h-7 items-center rounded-[var(--radius-sm)] border border-border bg-background px-2 text-[var(--text-small)] text-foreground-secondary transition-colors hover:bg-panel hover:text-foreground"
            >
              {showAdvancedMemory ? '메모리 뷰 숨기기' : '고급 메모리 보기'}
            </button>
          </div>
        </div>
        <div className="text-xs text-foreground-secondary mt-1">호출 및 반환 이벤트가 여기에 표시됩니다.</div>
        <div className="text-[11px] text-foreground-secondary mt-1">글로벌 포인터 변수명을 클릭하면 화살표를 개별 on/off 할 수 있습니다.</div>
      </div>
    );
  }

  return (
    <div className="bg-panel border-b border-border p-3 shrink-0">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground">함수 기록</h3>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-foreground-secondary">{timelineMeta.functionHistory.length}개 이벤트</span>
          <button
            type="button"
            onClick={toggleCollapsed}
            className="inline-flex h-7 items-center rounded-[var(--radius-sm)] border border-border bg-background px-2 text-[var(--text-small)] text-foreground-secondary transition-colors hover:bg-panel hover:text-foreground"
          >
            {collapsed ? '기록 펼치기' : '기록 접기'}
          </button>
          <button
            type="button"
            onClick={onToggleShowAllPointers}
            className="inline-flex h-7 items-center rounded-[var(--radius-sm)] border border-border bg-background px-2 text-[var(--text-small)] text-foreground-secondary transition-colors hover:bg-panel hover:text-foreground"
          >
            {showAllPointers ? '전체 화살표 끄기' : '전체 화살표 켜기'}
          </button>
          <button
            type="button"
            onClick={onToggleAdvancedMemory}
            className="inline-flex h-7 items-center rounded-[var(--radius-sm)] border border-border bg-background px-2 text-[var(--text-small)] text-foreground-secondary transition-colors hover:bg-panel hover:text-foreground"
          >
            {showAdvancedMemory ? '메모리 뷰 숨기기' : '고급 메모리 보기'}
          </button>
        </div>
      </div>
      {!collapsed ? (
        <>
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
          <div className="mt-2 text-[11px] text-foreground-secondary">글로벌 포인터 변수명을 클릭하면 화살표를 개별 on/off 할 수 있습니다.</div>
        </>
      ) : (
        <div className="text-[11px] text-foreground-secondary">함수 기록이 접혀 있습니다. 공간을 넓게 사용합니다.</div>
      )}
    </div>
  );
}
