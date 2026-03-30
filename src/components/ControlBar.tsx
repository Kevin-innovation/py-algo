"use client";

import { useMemo } from 'react';
import { buildCurrentStepMetadata, buildTimelineMetadata, useStore } from '../store/useStore';

const eventMarkerClass = (eventKind: string): string => {
  if (eventKind === 'stdout') return 'bg-emerald-400';
  if (eventKind === 'stdin') return 'bg-amber-400';
  if (eventKind === 'call') return 'bg-sky-400';
  if (eventKind === 'return') return 'bg-violet-400';
  if (eventKind === 'exception' || eventKind === 'uncaught_exception') return 'bg-rose-500';
  return 'bg-gray-500';
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

  const timelineMeta = useMemo(() => buildTimelineMetadata(timeline, breakpoints), [timeline, breakpoints]);
  const currentMeta = useMemo(
    () => buildCurrentStepMetadata(timeline, breakpoints, currentStepIndex),
    [timeline, breakpoints, currentStepIndex],
  );

  if (timeline.length === 0) {
    return <div className="h-14 bg-gray-800 border-b border-gray-700 p-3 flex items-center text-gray-400 shrink-0">코드를 실행하여 타임라인 컨트롤을 확인하세요</div>;
  }

  const totalSteps = timeline.length;

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-3 flex flex-col gap-2 shrink-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentStepIndex(0)}
            disabled={currentStepIndex === 0}
            className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50"
          >
            처음
          </button>
          <button
            onClick={stepBackward}
            disabled={currentStepIndex === 0}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50"
          >
            이전
          </button>
          <button
            onClick={stepForward}
            disabled={currentStepIndex === timeline.length - 1}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50"
          >
            다음
          </button>
          <button
            onClick={continueToNextBreakpoint}
            disabled={currentStepIndex === timeline.length - 1 || breakpoints.length === 0}
            className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-500 disabled:opacity-50"
            title="다음 중단점이 있는 단계로 건너뛰기"
          >
            계속 ▶
          </button>
          <button
            onClick={() => setCurrentStepIndex(timeline.length - 1)}
            disabled={currentStepIndex === timeline.length - 1}
            className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50"
          >
            마지막
          </button>
          <button
            onClick={clearBreakpoints}
            disabled={breakpoints.length === 0}
            className="px-3 py-1 bg-gray-700 text-orange-200 rounded hover:bg-gray-600 disabled:opacity-50"
          >
            중단점 지우기
          </button>
        </div>

        <div className="text-white font-mono flex-1 px-4 text-right">
          단계 {currentStepIndex + 1} / {timeline.length}
          {currentMeta?.loopIteration ? <span className="text-amber-300 ml-3">루프 #{currentMeta.loopIteration}</span> : null}
        </div>

        <label className="text-sm text-gray-300 flex items-center gap-2">
          <input
            type="checkbox"
            checked={educationalMode}
            onChange={(e) => setEducationalMode(e.target.checked)}
            className="accent-blue-500"
          />
          설명
        </label>
      </div>

      <div className="relative pt-4 pb-1">
        <input
          type="range"
          min={0}
          max={Math.max(totalSteps - 1, 0)}
          value={currentStepIndex}
          onChange={(e) => setCurrentStepIndex(Number(e.target.value))}
          className="w-full accent-blue-500"
          aria-label="타임라인 단계 슬라이더"
        />
        <div className="pointer-events-none absolute left-0 right-0 top-0 h-4">
          {timelineMeta.steps.map((step, idx) => {
            const denominator = Math.max(totalSteps - 1, 1);
            const leftPercent = (idx / denominator) * 100;
            return (
              <button
                key={`marker-${idx}`}
                type="button"
                onClick={() => setCurrentStepIndex(idx)}
                className={`pointer-events-auto absolute top-0 h-3 w-1 rounded-sm ${eventMarkerClass(step.eventKind)} ${idx === currentStepIndex ? 'ring-1 ring-white' : ''}`}
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

      {educationalMode && currentMeta ? (
        <div className="text-xs text-blue-100 bg-blue-900/20 border border-blue-800/60 rounded px-3 py-2">
          {currentMeta.explanation}
        </div>
      ) : null}

      <div className="text-xs text-gray-400">
        이벤트 색상: <span className="text-emerald-300">stdout</span>, <span className="text-amber-300">stdin</span>, <span className="text-sky-300">call</span>, <span className="text-violet-300">return</span>, <span className="text-rose-400">exception</span>
      </div>
    </div>
  );
}
