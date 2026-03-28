"use client";

import CallStack from './CallStack';
import Heap from './Heap';
import DynamicPointers from './DynamicPointers';
import { Xwrapper } from 'react-xarrows';

export default function Visualizer() {
  return (
    <div className="flex-1 flex flex-row overflow-hidden relative min-h-0">
      <Xwrapper>
        <CallStack />
        <Heap />
        <DynamicPointers />
      </Xwrapper>
    </div>
  );
}
