"use client";

import { useEffect, useRef, useState } from 'react';
import CallStack from './CallStack';
import Heap from './Heap';
import DynamicPointers from './DynamicPointers';
import FunctionHistoryPanel from './FunctionHistoryPanel';
import { Xwrapper } from 'react-xarrows';

export default function Visualizer() {
  const splitRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const [leftPercent, setLeftPercent] = useState(38);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const update = () => setIsDesktop(window.innerWidth >= 1024);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
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
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative min-h-0 bg-panel">
      <FunctionHistoryPanel />
      <div ref={splitRef} className="flex-1 flex flex-row overflow-hidden relative min-h-0 bg-background">
        <Xwrapper>
          <div className="min-h-0" style={isDesktop ? { width: `calc(${leftPercent}% - 4px)` } : undefined}>
            <CallStack />
          </div>
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
          <DynamicPointers />
        </Xwrapper>
      </div>
    </div>
  );
}
