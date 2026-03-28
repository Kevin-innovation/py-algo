import { create } from 'zustand';

export interface HeapObject {
  type: string;
  id: string;
  value: unknown;
  ref?: boolean;
}

export interface TraceSnapshot {
  event: string;
  line: number;
  stack: Array<{
    func_name: string;
    line: number;
    locals: Record<string, unknown>;
  }>;
  heap: Record<string, HeapObject>;
  exception?: string;
  return_value?: unknown;
}

interface StoreState {
  code: string;
  setCode: (code: string) => void;
  timeline: TraceSnapshot[];
  setTimeline: (timeline: TraceSnapshot[]) => void;
  currentStepIndex: number;
  setCurrentStepIndex: (index: number) => void;
  status: 'IDLE' | 'LOADING' | 'READY' | 'RUNNING' | 'WAITING_INPUT' | 'ERROR';
  setStatus: (status: 'IDLE' | 'LOADING' | 'READY' | 'RUNNING' | 'WAITING_INPUT' | 'ERROR') => void;
  output: string[];
  appendOutput: (text: string) => void;
  clearOutput: () => void;
  error: string | null;
  setError: (error: string | null) => void;
  stepForward: () => void;
  stepBackward: () => void;
}

export const useStore = create<StoreState>((set) => ({
  code: 'def factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(5))\n',
  setCode: (code) => set({ code }),
  timeline: [],
  setTimeline: (timeline) => set({ timeline, currentStepIndex: 0 }),
  currentStepIndex: 0,
  setCurrentStepIndex: (index) => set({ currentStepIndex: index }),
  status: 'IDLE',
  setStatus: (status) => set({ status }),
  output: [],
  appendOutput: (text) => set((state) => ({ output: [...state.output, text] })),
  clearOutput: () => set({ output: [] }),
  error: null,
  setError: (error) => set({ error }),
  stepForward: () => set((state) => ({
    currentStepIndex: Math.min(state.currentStepIndex + 1, state.timeline.length - 1)
  })),
  stepBackward: () => set((state) => ({
    currentStepIndex: Math.max(state.currentStepIndex - 1, 0)
  })),
}));
