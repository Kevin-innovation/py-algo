"use client";

import { useStore } from '../store/useStore';

export default function ControlBar() {
  const { currentStepIndex, timeline, stepForward, stepBackward, setCurrentStepIndex } = useStore();

  if (timeline.length === 0) {
    return <div className="h-12 bg-gray-800 border-b border-gray-700 p-2 flex items-center text-gray-400 shrink-0">Run code to see timeline controls</div>;
  }

  return (
    <div className="h-12 bg-gray-800 border-b border-gray-700 p-2 flex items-center justify-between shrink-0">
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
          onClick={() => setCurrentStepIndex(timeline.length - 1)}
          disabled={currentStepIndex === timeline.length - 1}
          className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Last
        </button>
      </div>
      <div className="text-white font-mono flex-1 px-4 text-center">
        Step {currentStepIndex + 1} of {timeline.length}
      </div>
    </div>
  );
}
