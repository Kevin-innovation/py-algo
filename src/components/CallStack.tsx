"use client";

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { buildCurrentStepMetadata, useStore, HeapObject } from '../store/useStore';

export default function CallStack() {
  const timeline = useStore((state) => state.timeline);
  const currentStepIndex = useStore((state) => state.currentStepIndex);
  const breakpoints = useStore((state) => state.breakpoints);
  const currentMeta = useMemo(
    () => buildCurrentStepMetadata(timeline, breakpoints, currentStepIndex),
    [timeline, breakpoints, currentStepIndex],
  );
  const currentSnapshot = timeline[currentStepIndex];
  const changedVarSet = new Set(currentMeta?.changedVariables ?? []);

  if (!currentSnapshot || !currentSnapshot.stack) {
    if (currentSnapshot === undefined) {
      return (
        <div className="h-full min-h-0 p-4 border-r border-border overflow-y-auto bg-panel">
          <div className="flex items-center justify-center h-full">
            <p className="text-foreground-secondary">호출 스택 정보가 없습니다.</p>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="h-full min-h-0 p-4 border-r border-border overflow-y-auto bg-panel">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl text-foreground font-bold">호출 스택</h2>
        <div className="text-xs text-foreground-secondary">
          깊이 {currentMeta?.callDepth ?? currentSnapshot.stack.length}
          {currentMeta?.loopIteration ? <span className="text-amber-600 ml-2">루프 #{currentMeta.loopIteration}</span> : null}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <AnimatePresence>
          {currentSnapshot.stack.map((frame, frameIdx) => (
            <motion.div
              key={`${frame.func_name}-${frameIdx}`}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-background rounded-lg p-3 shadow-md border border-border"
            >
              <div className="mb-2 border-b border-border pb-1 font-semibold text-[var(--trace-call-text)]">
                {frame.func_name} <span className="ml-2 text-sm text-foreground-secondary">{frame.line}번째 줄</span>
              </div>
              <div className="flex flex-col gap-1">
                {Object.entries(frame.locals || {}).map(([varName, val]) => {
                  const localVal = val as HeapObject;
                  const changed = changedVarSet.has(varName) && frameIdx === currentSnapshot.stack.length - 1;
                  return (
                    <motion.div
                      layout
                      key={varName}
                      className={`flex flex-row items-center gap-2 rounded px-1 font-mono text-sm ${changed ? 'bg-[var(--trace-stdout-bg)] ring-1 ring-[var(--trace-stdout-border)]' : ''}`}
                    >
                      <span className={changed ? 'font-semibold text-[var(--trace-stdout-text)]' : 'text-[var(--trace-stdout-text)]'}>{varName}</span>
                      <span className="text-foreground">=</span>
                      {localVal.ref ? (
                        <span
                          id={`var-${frame.func_name}-${frameIdx}-${varName}`}
                          className={changed ? 'cursor-pointer text-[var(--trace-return-text)] hover:underline' : 'cursor-pointer text-[var(--trace-return-text)] hover:underline'}
                        >
                          포인터
                        </span>
                      ) : (
                        <span className={changed ? 'font-semibold text-[var(--trace-stdin-text)]' : 'text-[var(--trace-stdin-text)]'}>{String(localVal.value)}</span>
                      )}
                      {changed ? <span className="text-[10px] uppercase tracking-wide text-[var(--trace-stdout-text)]">변경됨</span> : null}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
