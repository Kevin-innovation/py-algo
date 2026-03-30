"use client";

import { useRef, useEffect } from 'react';
import { IOEntry, useStore } from '../store/useStore';

export default function Terminal({ onInputSubmit }: { onInputSubmit: (text: string) => void }) {
  const output = useStore((state) => state.output);
  const timeline = useStore((state) => state.timeline);
  const currentStepIndex = useStore((state) => state.currentStepIndex);
  const status = useStore((state) => state.status);
  const error = useStore((state) => state.error);
  const outputMode = useStore((state) => state.outputMode);
  const setOutputMode = useStore((state) => state.setOutputMode);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const currentSnapshot = timeline[currentStepIndex];
  const timelineOutput: IOEntry[] = status === 'READY' && currentSnapshot?.io
    ? currentSnapshot.io
    : output.map((text) => ({ kind: 'stdout', text }));
  const displayAsReplay = status === 'READY' && timeline.length > 0 && outputMode === 'replay';
  const replayCursor = currentSnapshot?.event === 'stdout' || currentSnapshot?.event === 'stdin'
    ? Math.max((currentSnapshot?.io?.length ?? 1) - 1, 0)
    : -1;

  const latestInputEntry = [...timelineOutput].reverse().find((entry) => entry.kind === 'stdin');

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [timelineOutput, status, outputMode]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const text = e.currentTarget.value;
      onInputSubmit(text + '\n');
      e.currentTarget.value = '';
    }
  };

  return (
    <div className="h-56 bg-black text-green-400 font-mono text-sm p-4 overflow-y-auto flex flex-col border-t border-gray-700 shrink-0">
      <div className="text-gray-500 mb-2 border-b border-gray-800 pb-1 shrink-0 flex items-center justify-between">
        <span>출력 타임라인</span>
        {status === 'READY' && timeline.length > 0 ? (
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setOutputMode('step-sync')}
              className={`px-2 py-0.5 rounded border ${outputMode === 'step-sync' ? 'border-emerald-400 text-emerald-300' : 'border-gray-700 text-gray-500'}`}
            >
              단계 동기화
            </button>
            <button
              onClick={() => setOutputMode('replay')}
              className={`px-2 py-0.5 rounded border ${outputMode === 'replay' ? 'border-cyan-400 text-cyan-300' : 'border-gray-700 text-gray-500'}`}
            >
              재생
            </button>
          </div>
        ) : null}
      </div>

      {displayAsReplay ? (
        <div className="space-y-1 whitespace-pre-wrap break-words">
          {timelineOutput.map((entry, idx) => {
            const isCursor = idx === replayCursor;
            return (
              <div
                key={`${entry.kind}-${idx}`}
                className={`rounded px-2 py-1 border ${entry.kind === 'stdin' ? 'text-yellow-300 border-yellow-700/60 bg-yellow-900/10' : 'text-green-300 border-green-800/60 bg-green-900/10'} ${isCursor ? 'ring-1 ring-blue-300/70' : ''}`}
              >
                <span className="text-[10px] uppercase tracking-wider mr-2 opacity-80">
                  {entry.kind} #{idx + 1}
                </span>
                {entry.text}
                {isCursor ? <span className="ml-2 text-[10px] text-blue-300">◀ 재생 커서</span> : null}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="whitespace-pre-wrap break-words">
          {timelineOutput.map((entry, idx) => (
            <span
              key={`${entry.kind}-${idx}`}
              className={entry.kind === 'stdin' ? 'text-yellow-300' : 'text-green-400'}
            >
              {entry.text}
            </span>
          ))}
        </div>
      )}
      
      {error && <div className="text-red-500 mt-2">오류: {error}</div>}
      
      {status === 'WAITING_INPUT' && (
        <div className="flex flex-col mt-2">
          <div className="text-yellow-300 mb-2 animate-pulse flex items-center gap-2 bg-yellow-900/20 border border-yellow-700/40 rounded px-2 py-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
            </span>
            입력을 위해 프로그램이 일시 중지되었습니다. 아래에 입력하고 Enter를 누르세요.
          </div>
          {latestInputEntry?.prompt ? (
            <div className="text-xs text-amber-200 mb-2 font-mono bg-amber-900/20 border border-amber-700/50 rounded px-2 py-1">
              프롬프트: {latestInputEntry.prompt}
            </div>
          ) : null}
          <div className="flex items-center bg-gray-900 border border-yellow-500/50 rounded p-1 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
            <span className="text-yellow-400 mr-2 ml-1 font-bold">&gt;</span>
            <input
              type="text"
              className="bg-transparent text-white outline-none flex-1 font-mono"
              autoFocus
              placeholder="표준 입력(stdin) 값을 제공하고 Enter를 누르세요"
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      )}
      <div ref={terminalEndRef} />
    </div>
  );
}
