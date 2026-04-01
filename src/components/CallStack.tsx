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
        <div className="flex-1 min-h-0 p-4 border-r border-border overflow-y-auto bg-panel">
          <div className="flex items-center justify-center h-full">
            <p className="text-foreground-secondary">호출 스택 정보가 없습니다.</p>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex-1 min-h-0 p-4 border-r border-border overflow-y-auto bg-panel">
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
              <div className="font-semibold text-blue-300 mb-2 border-b border-gray-600 pb-1">
                {frame.func_name} <span className="text-gray-400 text-sm ml-2">{frame.line}번째 줄</span>
              </div>
              <div className="flex flex-col gap-1">
                {Object.entries(frame.locals || {}).map(([varName, val]) => {
                  const localVal = val as HeapObject;
                  const changed = changedVarSet.has(varName) && frameIdx === currentSnapshot.stack.length - 1;
                  return (
                    <motion.div
                      layout
                      key={varName}
                      className={`flex flex-row items-center gap-2 font-mono text-sm rounded px-1 ${changed ? 'bg-emerald-500/10 ring-1 ring-emerald-400/60' : ''}`}
                    >
                      <span className={changed ? 'text-emerald-200 font-semibold' : 'text-green-300'}>{varName}</span>
                      <span className="text-white">=</span>
                      {localVal.ref ? (
                        <span
                          id={`var-${frame.func_name}-${frameIdx}-${varName}`}
                          className={changed ? 'text-fuchsia-300 cursor-pointer hover:underline' : 'text-purple-400 cursor-pointer hover:underline'}
                        >
                          포인터
                        </span>
                      ) : (
                        <span className={changed ? 'text-amber-200 font-semibold' : 'text-yellow-300'}>{String(localVal.value)}</span>
                      )}
                      {changed ? <span className="text-[10px] uppercase tracking-wide text-emerald-300">변경됨</span> : null}
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
