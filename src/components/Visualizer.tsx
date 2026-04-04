"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import CallStack from './CallStack';
import Heap from './Heap';
import DynamicPointers from './DynamicPointers';
import FunctionHistoryPanel from './FunctionHistoryPanel';
import { Xwrapper } from 'react-xarrows';
import { HeapObject, useStore } from '../store/useStore';

export default function Visualizer() {
  const splitRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const [leftPercent, setLeftPercent] = useState(38);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showAdvancedMemory, setShowAdvancedMemory] = useState(false);
  const [showAllPointers, setShowAllPointers] = useState(false);
  const [enabledGlobalPointerVars, setEnabledGlobalPointerVars] = useState<string[]>([]);
  const timeline = useStore((state) => state.timeline);
  const currentStepIndex = useStore((state) => state.currentStepIndex);
  const status = useStore((state) => state.status);
  const currentSnapshot = timeline[currentStepIndex];

  const globalPointerVarNames = useMemo(() => {
    if (!currentSnapshot?.stack || !currentSnapshot.heap) return [] as string[];
    const globalFrame = currentSnapshot.stack.find((frame) => frame.func_name === 'Global');
    if (!globalFrame) return [];

    return Object.entries(globalFrame.locals || {})
      .filter(([, val]) => {
        const heapVal = val as HeapObject;
        return Boolean(heapVal?.ref && currentSnapshot.heap[heapVal.id]);
      })
      .map(([varName]) => varName);
  }, [currentSnapshot]);

  useEffect(() => {
    queueMicrotask(() => {
      setEnabledGlobalPointerVars((prev) => {
        return prev.filter((name) => globalPointerVarNames.includes(name));
      });
    });
  }, [globalPointerVarNames]);

  useEffect(() => {
    if (status !== 'RUNNING') return;

    queueMicrotask(() => {
      setShowAllPointers(false);
      setEnabledGlobalPointerVars([]);
    });
  }, [status]);

  useEffect(() => {
    const update = () => setIsDesktop(window.innerWidth >= 1024);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      if (!showAdvancedMemory) return;
      if (!draggingRef.current || !splitRef.current) return;
      const rect = splitRef.current.getBoundingClientRect();
      const raw = ((event.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.min(70, Math.max(25, raw));
      setLeftPercent(clamped);
    };

    const handleUp = () => {
      draggingRef.current = false;
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [showAdvancedMemory]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('showAdvancedMemory');
      queueMicrotask(() => {
        setShowAdvancedMemory(stored === 'true');
      });
    } catch {
    }
  }, []);

  const toggleAdvancedMemory = () => {
    setShowAdvancedMemory((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem('showAdvancedMemory', String(next));
      } catch {
      }
      return next;
    });
  };

  const toggleShowAllPointers = () => {
    setShowAllPointers((prev) => !prev);
  };

  const toggleGlobalPointerVar = (varName: string) => {
    setEnabledGlobalPointerVars((prev) => (
      prev.includes(varName)
        ? prev.filter((item) => item !== varName)
        : [...prev, varName]
    ));
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative min-h-0 bg-panel">
      <FunctionHistoryPanel
        showAdvancedMemory={showAdvancedMemory}
        onToggleAdvancedMemory={toggleAdvancedMemory}
        showAllPointers={showAllPointers}
        onToggleShowAllPointers={toggleShowAllPointers}
      />
      <div ref={splitRef} className="flex-1 flex flex-row overflow-hidden relative min-h-0 bg-background">
        <Xwrapper>
          <div className="min-h-0" style={isDesktop && showAdvancedMemory ? { width: `calc(${leftPercent}% - 4px)` } : undefined}>
            <CallStack
              showHeapPanel={showAdvancedMemory}
              showAllPointers={showAllPointers}
              enabledGlobalPointerVars={enabledGlobalPointerVars}
              onToggleGlobalPointerVar={toggleGlobalPointerVar}
            />
          </div>
          {showAdvancedMemory ? (
            <>
              <div
                onMouseDown={() => {
                  draggingRef.current = true;
                }}
                className="hidden lg:flex w-2 shrink-0 cursor-col-resize items-center justify-center"
                aria-hidden="true"
              >
                <div className="h-full w-px bg-border" />
              </div>
              <div className="flex-1 min-h-0" style={isDesktop ? { width: `calc(${100 - leftPercent}% - 4px)` } : undefined}>
                <Heap />
              </div>
              <DynamicPointers
                showAllPointers={showAllPointers}
                enabledGlobalPointerVars={enabledGlobalPointerVars}
              />
            </>
          ) : null}
        </Xwrapper>
      </div>
    </div>
  );
}
