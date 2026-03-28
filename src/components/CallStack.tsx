"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { selectCurrentStepMetadata, useStore, HeapObject } from '../store/useStore';

export default function CallStack() {
  const timeline = useStore((state) => state.timeline);
  const currentStepIndex = useStore((state) => state.currentStepIndex);
  const currentMeta = useStore(selectCurrentStepMetadata);
  const currentSnapshot = timeline[currentStepIndex];
  const changedVarSet = new Set(currentMeta?.changedVariables ?? []);

  if (!currentSnapshot || !currentSnapshot.stack) {
    if (currentSnapshot && currentSnapshot.event === 'uncaught_exception') {
      return (
        <div className="flex-1 min-h-0 p-4 border-r border-gray-700 overflow-y-auto bg-gray-900">
          <h2 className="text-xl text-red-500 font-bold mb-4">Exception</h2>
          <div className="text-red-400 font-mono text-sm whitespace-pre-wrap">{currentSnapshot.exception}</div>
        </div>
      );
    }
    return (
      <div className="flex-1 min-h-0 p-4 border-r border-gray-700 overflow-y-auto">
        <h2 className="text-xl text-white font-bold mb-4">Call Stack</h2>
        <div className="text-gray-500">Run code to see stack</div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 p-4 border-r border-gray-700 overflow-y-auto bg-gray-900">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl text-white font-bold">Call Stack</h2>
        <div className="text-xs text-gray-400">
          depth {currentMeta?.callDepth ?? currentSnapshot.stack.length}
          {currentMeta?.loopIteration ? <span className="text-amber-300 ml-2">loop #{currentMeta.loopIteration}</span> : null}
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
              className="bg-gray-800 rounded-lg p-3 shadow-md border border-gray-600"
            >
              <div className="font-semibold text-blue-300 mb-2 border-b border-gray-600 pb-1">
                {frame.func_name} <span className="text-gray-400 text-sm ml-2">line {frame.line}</span>
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
                          pointer
                        </span>
                      ) : (
                        <span className={changed ? 'text-amber-200 font-semibold' : 'text-yellow-300'}>{String(localVal.value)}</span>
                      )}
                      {changed ? <span className="text-[10px] uppercase tracking-wide text-emerald-300">changed</span> : null}
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
