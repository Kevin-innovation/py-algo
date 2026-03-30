"use client";

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { buildCurrentStepMetadata, useStore, HeapObject } from '../store/useStore';

export default function Heap() {
  const timeline = useStore((state) => state.timeline);
  const currentStepIndex = useStore((state) => state.currentStepIndex);
  const breakpoints = useStore((state) => state.breakpoints);
  const currentMeta = useMemo(
    () => buildCurrentStepMetadata(timeline, breakpoints, currentStepIndex),
    [timeline, breakpoints, currentStepIndex],
  );
  const currentSnapshot = timeline[currentStepIndex];
  const changedHeapIds = new Set(currentMeta?.changedHeapIds ?? []);

  if (!currentSnapshot || !currentSnapshot.heap) {
    if (currentSnapshot && currentSnapshot.event === 'uncaught_exception') {
      return (
        <div className="flex-1 min-h-0 p-4 overflow-y-auto bg-gray-900 border-l border-gray-700">
          <h2 className="text-xl text-white font-bold mb-4">힙 객체</h2>
          <div className="text-red-500">예외로 인해 실행이 종료되었습니다.</div>
        </div>
      );
    }
    return (
      <div className="flex-1 min-h-0 p-4 overflow-y-auto bg-gray-900">
        <h2 className="text-xl text-white font-bold mb-4">힙 객체</h2>
        <div className="text-gray-500">코드를 실행하여 객체를 확인하세요</div>
      </div>
    );
  }

  const renderHeapObject = (obj: HeapObject, id: string) => {
    switch (obj.type) {
      case 'list':
      case 'tuple':
      case 'set':
        return (
          <div className="flex flex-row flex-wrap gap-1 mt-1 font-mono text-sm border border-gray-600 rounded bg-gray-800 p-1 min-w-[30px] min-h-[20px]">
            {Array.isArray(obj.value) && obj.value.map((v: HeapObject, idx: number) => (
              <div key={idx} className="bg-gray-700 px-2 py-1 rounded">
                {v.ref ? <span id={`heap-${id}-item-${idx}`} className="text-purple-400">참조</span> : <span className="text-yellow-300">{String(v.value)}</span>}
              </div>
            ))}
          </div>
        );
      case 'dict':
        return (
          <div className="flex flex-col gap-1 mt-1 font-mono text-sm border border-gray-600 rounded bg-gray-800 p-2 min-w-[40px]">
            {!!obj.value && typeof obj.value === 'object' && Object.entries(obj.value as Record<string, HeapObject>).map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="text-blue-300">&quot;{k}&quot;</span>
                <span className="text-white">:</span>
                {v.ref ? <span id={`heap-${id}-key-${k}`} className="text-purple-400">참조</span> : <span className="text-yellow-300">{String(v.value)}</span>}
              </div>
            ))}
          </div>
        );
      default:
        return (
          <div className="mt-1 font-mono text-sm text-gray-300 break-words">
            {String(obj.value)}
          </div>
        );
    }
  };

  return (
    <div className="flex-[2] min-h-0 p-4 overflow-y-auto bg-gray-900 border-l border-gray-700">
      <h2 className="text-xl text-white font-bold mb-4">힙 객체</h2>
      <div className="flex flex-row flex-wrap gap-4 items-start">
        <AnimatePresence>
          {Object.entries(currentSnapshot.heap).map(([id, obj]) => {
            const heapObj = obj as HeapObject;
            return (
              <motion.div
                key={id}
                layout
                id={`heap-${id}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`bg-gray-800 rounded-lg p-3 shadow-md border min-w-[120px] ${changedHeapIds.has(id) ? 'border-cyan-400 ring-1 ring-cyan-300/70 shadow-cyan-500/10' : 'border-gray-600'}`}
              >
                <div className="flex justify-between items-center mb-1 pb-1 border-b border-gray-700">
                  <span className="text-xs text-gray-400 font-mono">id:{id}</span>
                  <span className="text-sm font-semibold text-green-400 px-2 py-0.5 bg-gray-900 rounded">{heapObj.type}</span>
                </div>
                {renderHeapObject(heapObj, id)}
                {changedHeapIds.has(id) ? <div className="mt-2 text-[10px] uppercase tracking-wide text-cyan-300">이 단계에서 변경됨</div> : null}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
