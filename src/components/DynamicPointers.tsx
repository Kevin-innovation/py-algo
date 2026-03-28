"use client";

import { useStore, HeapObject } from '../store/useStore';
import Xarrow from 'react-xarrows';

export default function DynamicPointers() {
  const timeline = useStore((state) => state.timeline);
  const currentStepIndex = useStore((state) => state.currentStepIndex);
  const currentSnapshot = timeline[currentStepIndex];

  if (!currentSnapshot || !currentSnapshot.stack || !currentSnapshot.heap) return null;

  const pointers: { start: string; end: string }[] = [];

  // 1. From Call Stack locals to Heap objects
  currentSnapshot.stack.forEach((frame, frameIdx) => {
    Object.entries(frame.locals || {}).forEach(([varName, val]) => {
      const heapVal = val as HeapObject;
      if (heapVal && heapVal.ref && currentSnapshot.heap[heapVal.id]) {
        pointers.push({
          start: `var-${frame.func_name}-${frameIdx}-${varName}`,
          end: `heap-${heapVal.id}`,
        });
      }
    });
  });

  // 2. From Heap object properties/elements to other Heap objects
  Object.entries(currentSnapshot.heap || {}).forEach(([id, obj]) => {
    const heapObj = obj as HeapObject;
    if (heapObj.type === 'list' || heapObj.type === 'tuple' || heapObj.type === 'set') {
      if (Array.isArray(heapObj.value)) {
        heapObj.value.forEach((v: unknown, idx: number) => {
          const itemVal = v as HeapObject;
          if (itemVal && itemVal.ref && currentSnapshot.heap[itemVal.id]) {
            pointers.push({
              start: `heap-${id}-item-${idx}`,
              end: `heap-${itemVal.id}`,
            });
          }
        });
      }
    } else if (heapObj.type === 'dict') {
      if (heapObj.value && typeof heapObj.value === 'object') {
        Object.entries(heapObj.value as Record<string, HeapObject>).forEach(([k, v]) => {
          if (v && v.ref && currentSnapshot.heap[v.id]) {
            pointers.push({
              start: `heap-${id}-key-${k}`,
              end: `heap-${v.id}`,
            });
          }
        });
      }
    }
  });

  return (
    <>
      {pointers.map((p, idx) => (
        <Xarrow
          key={`${p.start}-${p.end}-${idx}`}
          start={p.start}
          end={p.end}
          color="#a78bfa" // purple-400
          strokeWidth={2}
          headSize={4}
          curveness={0.3}
          path="smooth"
        />
      ))}
    </>
  );
}
