import { create } from 'zustand';

export interface HeapObject {
  type: string;
  id: string | number;
  value: unknown;
  ref?: boolean;
}

export interface IOEntry {
  kind: 'stdout' | 'stdin';
  text: string;
  line?: number;
  func_name?: string;
  prompt?: string;
  value?: string;
}

export interface TraceFrame {
  func_name: string;
  line: number;
  locals: Record<string, unknown>;
}

export interface TraceSnapshot {
  event: string;
  line: number;
  func_name?: string;
  stack: TraceFrame[];
  heap: Record<string, HeapObject>;
  io?: IOEntry[];
  io_event?: IOEntry;
  exception?: string;
  return_value?: unknown;
}

export type OutputMode = 'step-sync' | 'replay';

export interface FunctionHistoryItem {
  stepIndex: number;
  type: 'call' | 'return' | 'exception';
  funcName: string;
  line: number;
  depth: number;
  summary: string;
}

export interface StepMetadata {
  stepIndex: number;
  eventKind: string;
  line: number;
  functionName: string;
  callDepth: number;
  changedVariables: string[];
  changedHeapIds: string[];
  loopIteration?: number;
  isInputEvent: boolean;
  isOutputEvent: boolean;
  hasBreakpoint: boolean;
  explanation: string;
}

interface TimelineMetadata {
  steps: StepMetadata[];
  functionHistory: FunctionHistoryItem[];
}

interface SerializedValue {
  type?: string;
  id?: string | number;
  value?: unknown;
  ref?: boolean;
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
  outputMode: OutputMode;
  setOutputMode: (outputMode: OutputMode) => void;
  educationalMode: boolean;
  setEducationalMode: (enabled: boolean) => void;
  breakpoints: number[];
  toggleBreakpoint: (line: number) => void;
  clearBreakpoints: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  continueToNextBreakpoint: () => void;
  isAuthenticated: boolean;
  setAuthenticated: (auth: boolean) => void;
  aiAnalysis: string | null;
  setAiAnalysis: (analysis: string | null) => void;
}

const isSerializedValue = (value: unknown): value is SerializedValue => (
  typeof value === 'object' && value !== null
);

const normalizeForCompare = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeForCompare(item));
  }

  if (isSerializedValue(value)) {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => [key, normalizeForCompare(val)]);

    return Object.fromEntries(entries);
  }

  return value;
};

const signatureOf = (value: unknown): string => {
  try {
    return JSON.stringify(normalizeForCompare(value));
  } catch {
    return String(value);
  }
};

const getChangedVariables = (prevFrame: TraceFrame | undefined, currentFrame: TraceFrame | undefined): string[] => {
  if (!currentFrame) return [];

  const prevLocals = prevFrame?.locals ?? {};
  const currentLocals = currentFrame.locals ?? {};
  const keys = new Set([...Object.keys(prevLocals), ...Object.keys(currentLocals)]);

  return Array.from(keys).filter((key) => {
    const prevValue = prevLocals[key];
    const currentValue = currentLocals[key];
    return signatureOf(prevValue) !== signatureOf(currentValue);
  });
};

const getChangedHeapIds = (prevHeap: Record<string, HeapObject> | undefined, currentHeap: Record<string, HeapObject> | undefined): string[] => {
  if (!currentHeap) return [];

  const prev = prevHeap ?? {};
  const keys = new Set([...Object.keys(prev), ...Object.keys(currentHeap)]);

  return Array.from(keys).filter((id) => signatureOf(prev[id]) !== signatureOf(currentHeap[id]));
};

const buildExplanation = (
  snapshot: TraceSnapshot,
  changedVariables: string[],
  changedHeapIds: string[],
  loopIteration: number | undefined,
): string => {
  const fnName = snapshot.func_name ?? snapshot.stack[snapshot.stack.length - 1]?.func_name ?? '전역(Global)';
  const subject = `${fnName} 함수(라인 ${snapshot.line})`;

  if (snapshot.event === 'stdout') {
    const outputText = snapshot.io_event?.text?.trim();
    return outputText
      ? `${subject}에서 다음 내용 출력: ${outputText}`
      : `${subject}에서 출력이 발생했습니다.`;
  }

  if (snapshot.event === 'stdin') {
    const prompt = snapshot.io_event?.prompt;
    const value = snapshot.io_event?.value;
    if (prompt || value) {
      return `${subject}에서 입력을 대기합니다.${prompt ? ` (안내 메시지: ${prompt})` : ''}${value ? ` 입력된 값: "${value}"` : ''}.`;
    }
    return `${subject}에서 입력을 대기합니다.`;
  }

  if (snapshot.event === 'call') {
    return `${snapshot.line}번째 라인에서 ${fnName} 함수를 호출했습니다.`;
  }

  if (snapshot.event === 'return') {
    return `${snapshot.line}번째 라인에서 ${fnName} 함수의 실행을 마치고 반환합니다.`;
  }

  if (snapshot.event === 'exception' || snapshot.event === 'uncaught_exception') {
    return `${subject}에서 예외가 발생했습니다${snapshot.exception ? `: ${snapshot.exception}` : '.'}`;
  }

  if (loopIteration && loopIteration > 1) {
    return `${subject}에서 루프 반복 실행 중 (현재 ${loopIteration}번째 반복)${changedVariables.length ? `, 변경된 변수: ${changedVariables.join(', ')}` : ''}.`;
  }

  if (changedVariables.length > 0 || changedHeapIds.length > 0) {
    const varText = changedVariables.length ? `변수 (${changedVariables.join(', ')})` : '';
    const heapText = changedHeapIds.length ? `힙 객체 (${changedHeapIds.join(', ')})` : '';
    const connector = varText && heapText ? ' 및 ' : '';
    return `${subject}에서 상태가 변경되었습니다: ${varText}${connector}${heapText}.`;
  }

  return `${snapshot.line}번째 라인에서 ${fnName} 코드 실행을 진행합니다.`;
};

export const buildTimelineMetadata = (timeline: TraceSnapshot[], breakpoints: number[]): TimelineMetadata => {
  const lineHitCounts = new Map<string, number>();
  const steps: StepMetadata[] = [];
  const functionHistory: FunctionHistoryItem[] = [];

  timeline.forEach((snapshot, stepIndex) => {
    const prevSnapshot = stepIndex > 0 ? timeline[stepIndex - 1] : undefined;
    const activeFrame = snapshot.stack?.[snapshot.stack.length - 1];
    const prevActiveFrame = prevSnapshot?.stack?.[prevSnapshot.stack.length - 1];
    const functionName = snapshot.func_name ?? activeFrame?.func_name ?? 'Global';
    const line = snapshot.line ?? activeFrame?.line ?? 0;
    const callDepth = snapshot.stack?.length ?? 0;

    const changedVariables = getChangedVariables(prevActiveFrame, activeFrame);
    const changedHeapIds = getChangedHeapIds(prevSnapshot?.heap, snapshot.heap);

    let loopIteration: number | undefined;
    if (snapshot.event === 'line' || snapshot.event === 'stdout' || snapshot.event === 'stdin') {
      const lineKey = `${functionName}:${line}`;
      const count = (lineHitCounts.get(lineKey) ?? 0) + 1;
      lineHitCounts.set(lineKey, count);
      if (count > 1) {
        loopIteration = count;
      }
    }

    if (snapshot.event === 'call' || snapshot.event === 'return' || snapshot.event === 'exception') {
      functionHistory.push({
        stepIndex,
        type: snapshot.event,
        funcName: functionName,
        line,
        depth: callDepth,
        summary: snapshot.event === 'call'
          ? `Call ${functionName}()`
          : snapshot.event === 'return'
            ? `Return from ${functionName}()`
            : `Exception in ${functionName}()`,
      });
    }

    steps.push({
      stepIndex,
      eventKind: snapshot.event,
      line,
      functionName,
      callDepth,
      changedVariables,
      changedHeapIds,
      loopIteration,
      isInputEvent: snapshot.event === 'stdin',
      isOutputEvent: snapshot.event === 'stdout',
      hasBreakpoint: breakpoints.includes(line),
      explanation: buildExplanation(snapshot, changedVariables, changedHeapIds, loopIteration),
    });
  });

  return { steps, functionHistory };
};

export const buildCurrentStepMetadata = (
  timeline: TraceSnapshot[],
  breakpoints: number[],
  currentStepIndex: number,
): StepMetadata | null => {
  const snapshot = timeline[currentStepIndex];
  if (!snapshot) return null;

  const prevSnapshot = currentStepIndex > 0 ? timeline[currentStepIndex - 1] : undefined;
  const activeFrame = snapshot.stack?.[snapshot.stack.length - 1];
  const prevActiveFrame = prevSnapshot?.stack?.[prevSnapshot.stack.length - 1];
  const functionName = snapshot.func_name ?? activeFrame?.func_name ?? 'Global';
  const line = snapshot.line ?? activeFrame?.line ?? 0;
  const callDepth = snapshot.stack?.length ?? 0;

  const changedVariables = getChangedVariables(prevActiveFrame, activeFrame);
  const changedHeapIds = getChangedHeapIds(prevSnapshot?.heap, snapshot.heap);

  let loopIteration: number | undefined;
  if (snapshot.event === 'line' || snapshot.event === 'stdout' || snapshot.event === 'stdin') {
    let count = 0;
    for (let idx = 0; idx <= currentStepIndex; idx += 1) {
      const candidate = timeline[idx];
      const candidateName = candidate.func_name ?? candidate.stack?.[candidate.stack.length - 1]?.func_name ?? 'Global';
      const candidateLine = candidate.line ?? candidate.stack?.[candidate.stack.length - 1]?.line ?? 0;
      if (candidateName === functionName && candidateLine === line && (candidate.event === 'line' || candidate.event === 'stdout' || candidate.event === 'stdin')) {
        count += 1;
      }
    }
    if (count > 1) {
      loopIteration = count;
    }
  }

  return {
    stepIndex: currentStepIndex,
    eventKind: snapshot.event,
    line,
    functionName,
    callDepth,
    changedVariables,
    changedHeapIds,
    loopIteration,
    isInputEvent: snapshot.event === 'stdin',
    isOutputEvent: snapshot.event === 'stdout',
    hasBreakpoint: breakpoints.includes(line),
    explanation: buildExplanation(snapshot, changedVariables, changedHeapIds, loopIteration),
  };
};

export const selectTimelineMetadata = (state: StoreState): TimelineMetadata => (
  buildTimelineMetadata(state.timeline, state.breakpoints)
);

export const selectCurrentStepMetadata = (state: StoreState): StepMetadata | null => {
  if (!state.timeline[state.currentStepIndex]) return null;
  return selectTimelineMetadata(state).steps[state.currentStepIndex] ?? null;
};

export const selectReplayOutput = (state: StoreState): IOEntry[] => {
  const currentSnapshot = state.timeline[state.currentStepIndex];
  return currentSnapshot?.io ?? [];
};

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
  outputMode: 'step-sync',
  setOutputMode: (outputMode) => set({ outputMode }),
  educationalMode: true,
  setEducationalMode: (enabled) => set({ educationalMode: enabled }),
  breakpoints: [],
  toggleBreakpoint: (line) => set((state) => {
    if (state.breakpoints.includes(line)) {
      return { breakpoints: state.breakpoints.filter((value) => value !== line) };
    }
    return { breakpoints: [...state.breakpoints, line].sort((a, b) => a - b) };
  }),
  clearBreakpoints: () => set({ breakpoints: [] }),
  stepForward: () => set((state) => ({
    currentStepIndex: Math.min(state.currentStepIndex + 1, state.timeline.length - 1)
  })),
  stepBackward: () => set((state) => ({
    currentStepIndex: Math.max(state.currentStepIndex - 1, 0)
  })),
  continueToNextBreakpoint: () => set((state) => {
    if (state.timeline.length === 0 || state.breakpoints.length === 0) {
      return state;
    }

    const nextIndex = state.timeline.findIndex((snapshot, idx) => (
      idx > state.currentStepIndex && state.breakpoints.includes(snapshot.line)
    ));

    if (nextIndex === -1) {
      return { currentStepIndex: state.timeline.length - 1 };
    }

    return { currentStepIndex: nextIndex };
  }),
  isAuthenticated: false,
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  aiAnalysis: null,
  setAiAnalysis: (aiAnalysis) => set({ aiAnalysis }),
}));
