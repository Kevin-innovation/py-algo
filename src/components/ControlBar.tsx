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
    return <div className="h-14 bg-gray-800 border-b border-gray-700 p-3 flex items-center text-gray-400 shrink-0">Run code to see timeline controls</div>;
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
            First
          </button>
          <button
            onClick={stepBackward}
            disabled={currentStepIndex === 0}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={stepForward}
            disabled={currentStepIndex === timeline.length - 1}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50"
          >
            Next
          </button>
          <button
            onClick={continueToNextBreakpoint}
            disabled={currentStepIndex === timeline.length - 1 || breakpoints.length === 0}
            className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-500 disabled:opacity-50"
            title="Jump to the next step that lands on a breakpoint line"
          >
            Continue ▶
          </button>
          <button
            onClick={() => setCurrentStepIndex(timeline.length - 1)}
            disabled={currentStepIndex === timeline.length - 1}
            className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50"
          >
            Last
          </button>
          <button
            onClick={clearBreakpoints}
            disabled={breakpoints.length === 0}
            className="px-3 py-1 bg-gray-700 text-orange-200 rounded hover:bg-gray-600 disabled:opacity-50"
          >
            Clear BPs
          </button>
        </div>

        <div className="text-white font-mono flex-1 px-4 text-right">
          Step {currentStepIndex + 1} of {timeline.length}
          {currentMeta?.loopIteration ? <span className="text-amber-300 ml-3">Loop #{currentMeta.loopIteration}</span> : null}
        </div>

        <label className="text-sm text-gray-300 flex items-center gap-2">
          <input
            type="checkbox"
            checked={educationalMode}
            onChange={(e) => setEducationalMode(e.target.checked)}
            className="accent-blue-500"
          />
          Explain
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
          aria-label="Timeline step slider"
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
                title={`Step ${idx + 1}: ${step.eventKind} at line ${step.line}`}
              >
                <span className="sr-only">Go to step {idx + 1}</span>
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
                title={`Breakpoint on line ${line}`}
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
        Event colors: <span className="text-emerald-300">stdout</span>, <span className="text-amber-300">stdin</span>, <span className="text-sky-300">call</span>, <span className="text-violet-300">return</span>, <span className="text-rose-400">exception</span>
      </div>
    </div>
  );
}
