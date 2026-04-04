"use client";

import { useMemo, useState } from 'react';
import { buildCurrentStepMetadata, buildTimelineMetadata, useStore } from '../store/useStore';

const eventMarkerClass = (eventKind: string): string => {
  if (eventKind === 'stdout') return 'bg-[var(--trace-stdout-text)]';
  if (eventKind === 'stdin') return 'bg-[var(--trace-stdin-text)]';
  if (eventKind === 'call') return 'bg-[var(--trace-call-text)]';
  if (eventKind === 'return') return 'bg-[var(--trace-return-text)]';
  if (eventKind === 'exception' || eventKind === 'uncaught_exception') return 'bg-[var(--trace-exception-text)]';
  return 'bg-foreground-secondary';
};

export default function ControlBar() {
  const currentStepIndex = useStore((state) => state.currentStepIndex);
  const timeline = useStore((state) => state.timeline);
  const stepForward = useStore((state) => state.stepForward);
  const stepBackward = useStore((state) => state.stepBackward);
  const setCurrentStepIndex = useStore((state) => state.setCurrentStepIndex);
  const continueToNextBreakpoint = useStore((state) => state.continueToNextBreakpoint);
  const educationalMode = useStore((state) => state.educationalMode);
  const setEducationalMode = useStore((state) => state.setEducationalMode);
  const breakpoints = useStore((state) => state.breakpoints);
  const clearBreakpoints = useStore((state) => state.clearBreakpoints);
  const [compactOverride, setCompactOverride] = useState<boolean | null>(null);

  const timelineMeta = useMemo(() => buildTimelineMetadata(timeline, breakpoints), [timeline, breakpoints]);
  const currentMeta = useMemo(
    () => buildCurrentStepMetadata(timeline, breakpoints, currentStepIndex),
    [timeline, breakpoints, currentStepIndex],
  );

  if (timeline.length === 0) {
    return <div className="h-14 shrink-0 border-b border-border bg-panel-alt px-4 flex items-center text-[var(--text-body)] text-foreground-secondary">코드를 실행하여 타임라인 컨트롤을 확인하세요</div>;
  }

  const totalSteps = timeline.length;
  const autoCompact = totalSteps >= 80;
  const isCompact = compactOverride ?? autoCompact;
  const markerStride = Math.max(1, Math.ceil(totalSteps / (isCompact ? 80 : 140)));

  const toggleCompact = () => {
    setCompactOverride((prev) => (prev === null ? !autoCompact : !prev));
  };

  return (
    <div className={`flex flex-col shrink-0 border-b border-border bg-panel-alt px-4 text-foreground ${isCompact ? 'gap-2 py-2' : 'gap-3 py-3'}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCurrentStepIndex(0)}
            disabled={currentStepIndex === 0}
            className={`inline-flex items-center justify-center rounded-[var(--radius-md)] border border-border bg-background px-3 text-foreground shadow-sm transition-colors hover:bg-panel disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-background ${isCompact ? 'h-8 text-[var(--text-small)]' : 'h-9 text-[var(--text-body)]'}`}
          >
            처음
          </button>
          <button
            onClick={stepBackward}
            disabled={currentStepIndex === 0}
            className={`inline-flex items-center justify-center rounded-[var(--radius-md)] border border-border bg-accent px-3 text-accent-foreground shadow-sm transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:opacity-50 ${isCompact ? 'h-8 text-[var(--text-small)]' : 'h-9 text-[var(--text-body)]'}`}
          >
            이전
          </button>
          <button
            onClick={stepForward}
            disabled={currentStepIndex === timeline.length - 1}
            className={`inline-flex items-center justify-center rounded-[var(--radius-md)] border border-border bg-accent px-3 text-accent-foreground shadow-sm transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:opacity-50 ${isCompact ? 'h-8 text-[var(--text-small)]' : 'h-9 text-[var(--text-body)]'}`}
          >
            다음
          </button>
          <button
            onClick={continueToNextBreakpoint}
            disabled={currentStepIndex === timeline.length - 1 || breakpoints.length === 0}
            className={`inline-flex items-center justify-center rounded-[var(--radius-md)] border border-border bg-background px-3 text-foreground shadow-sm transition-colors hover:bg-panel disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-background ${isCompact ? 'h-8 text-[var(--text-small)]' : 'h-9 text-[var(--text-body)]'}`}
            title="다음 중단점이 있는 단계로 건너뛰기"
          >
            계속 ▶
          </button>
          <button
            onClick={() => setCurrentStepIndex(timeline.length - 1)}
            disabled={currentStepIndex === timeline.length - 1}
            className={`inline-flex items-center justify-center rounded-[var(--radius-md)] border border-border bg-background px-3 text-foreground shadow-sm transition-colors hover:bg-panel disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-background ${isCompact ? 'h-8 text-[var(--text-small)]' : 'h-9 text-[var(--text-body)]'}`}
          >
            마지막
          </button>
          <button
            onClick={clearBreakpoints}
            disabled={breakpoints.length === 0}
            className={`inline-flex items-center justify-center rounded-[var(--radius-md)] border border-border bg-background px-3 text-foreground-secondary shadow-sm transition-colors hover:bg-panel disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-background ${isCompact ? 'h-8 text-[var(--text-small)]' : 'h-9 text-[var(--text-body)]'}`}
          >
            중단점 지우기
          </button>
          <button
            type="button"
            onClick={toggleCompact}
            className={`inline-flex items-center justify-center rounded-[var(--radius-md)] border border-border bg-background px-3 text-foreground-secondary shadow-sm transition-colors hover:bg-panel ${isCompact ? 'h-8 text-[var(--text-small)]' : 'h-9 text-[var(--text-body)]'}`}
            title="컨트롤 바 높이를 줄여 가시성을 높입니다"
          >
            {isCompact ? '여백 넓게' : '컴팩트 보기'}
          </button>
        </div>

        <div className={`flex-1 rounded-[var(--radius-md)] border border-border bg-background text-right font-mono text-[var(--text-small)] text-foreground-secondary shadow-sm ${isCompact ? 'px-2 py-1.5' : 'px-3 py-2'}`}>
          단계 {currentStepIndex + 1} / {timeline.length}
          {currentMeta?.loopIteration ? <span className="ml-3 text-[var(--trace-stdin-text)]">루프 #{currentMeta.loopIteration}</span> : null}
        </div>

        <label className="flex items-center gap-2 text-[var(--text-small)] text-foreground-secondary whitespace-nowrap">
          <input
            type="checkbox"
            checked={educationalMode}
            onChange={(e) => setEducationalMode(e.target.checked)}
            className="accent-accent"
          />
          설명
        </label>
      </div>

      <div className={`relative ${isCompact ? 'pt-1 pb-0.5' : 'pt-2 pb-1'}`}>
        <input
          type="range"
          min={0}
          max={Math.max(totalSteps - 1, 0)}
          value={currentStepIndex}
          onChange={(e) => setCurrentStepIndex(Number(e.target.value))}
          className="w-full accent-accent"
          aria-label="타임라인 단계 슬라이더"
        />
        <div className="pointer-events-none absolute left-0 right-0 top-0 h-4">
          {timelineMeta.steps.map((step, idx) => {
            const isActive = idx === currentStepIndex;
            const isBreakpoint = breakpoints.includes(step.line);
            const shouldRenderMarker = isActive || isBreakpoint || idx % markerStride === 0;
            if (!shouldRenderMarker) return null;

            const denominator = Math.max(totalSteps - 1, 1);
            const leftPercent = (idx / denominator) * 100;
            return (
              <button
                key={`marker-${idx}`}
                type="button"
                onClick={() => setCurrentStepIndex(idx)}
                className={`pointer-events-auto absolute top-0 rounded-sm ${eventMarkerClass(step.eventKind)} ${isActive ? 'ring-1 ring-accent' : ''} ${isCompact ? 'h-2 w-0.5' : 'h-3 w-1'}`}
                style={{ left: `${leftPercent}%` }}
                title={`단계 ${idx + 1}: ${step.line}번째 줄에서 ${step.eventKind}`}
              >
                <span className="sr-only">단계 {idx + 1}(으)로 이동</span>
              </button>
            );
          })}

          {breakpoints.map((line) => {
            const idx = timeline.findIndex((step) => step.line === line);
            if (idx < 0) return null;
            const denominator = Math.max(totalSteps - 1, 1);
            const leftPercent = (idx / denominator) * 100;
            return (
              <span
                key={`bp-${line}`}
                className="absolute -top-1 h-5 w-2 bg-orange-500/90 rounded-sm"
                style={{ left: `${leftPercent}%` }}
                title={`${line}번째 줄의 중단점`}
              />
            );
          })}
        </div>
      </div>

      {!isCompact && educationalMode && currentMeta ? (
        <div className="rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-[var(--text-small)] text-foreground-secondary shadow-sm">
          {currentMeta.explanation}
        </div>
      ) : null}

      {!isCompact ? <div className="text-[var(--text-small)] text-foreground-secondary">
        이벤트 색상: <span className="text-[var(--trace-stdout-text)]">stdout</span>, <span className="text-[var(--trace-stdin-text)]">stdin</span>, <span className="text-[var(--trace-call-text)]">call</span>, <span className="text-[var(--trace-return-text)]">return</span>, <span className="text-[var(--trace-exception-text)]">exception</span>
      </div> : null}
    </div>
  );
}
