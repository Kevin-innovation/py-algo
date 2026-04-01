"use client";

import { useRef, useEffect } from 'react';
import { IOEntry, useStore } from '../store/useStore';

export default function Terminal({ onInputSubmit }: { onInputSubmit: (text: string) => void }) {
  const output = useStore((state) => state.output);
  const timeline = useStore((state) => state.timeline);
  const currentStepIndex = useStore((state) => state.currentStepIndex);
  const status = useStore((state) => state.status);
  const error = useStore((state) => state.error);
  const errorLine = useStore((state) => state.errorLine);
  const errorColumn = useStore((state) => state.errorColumn);
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
    <div className="h-56 shrink-0 flex flex-col overflow-y-auto border-t border-border bg-background px-4 py-3 font-mono text-[var(--text-body)] text-emerald-400">
      <div className="mb-3 flex shrink-0 items-center justify-between gap-3 border-b border-border pb-2 text-[var(--text-small)] text-foreground-secondary">
        <span>출력 타임라인</span>
        {status === 'READY' && timeline.length > 0 ? (
          <div className="flex items-center gap-2 text-[var(--text-small)]">
            <button
              onClick={() => setOutputMode('step-sync')}
              className={`rounded-[var(--radius-md)] border px-2 py-1 text-[var(--text-small)] transition-colors ${outputMode === 'step-sync' ? 'border-border bg-panel text-foreground shadow-sm' : 'border-border bg-background text-foreground-secondary hover:bg-panel'}`}
            >
              단계 동기화
            </button>
            <button
              onClick={() => setOutputMode('replay')}
              className={`rounded-[var(--radius-md)] border px-2 py-1 text-[var(--text-small)] transition-colors ${outputMode === 'replay' ? 'border-border bg-panel text-foreground shadow-sm' : 'border-border bg-background text-foreground-secondary hover:bg-panel'}`}
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
                className={`rounded-[var(--radius-md)] border px-3 py-2 shadow-sm ${entry.kind === 'stdin' ? 'border-amber-800/40 bg-amber-950/20 text-amber-200' : 'border-emerald-900/40 bg-emerald-950/20 text-emerald-200'} ${isCursor ? 'ring-1 ring-accent/70' : ''}`}
              >
                <span className="mr-2 text-[var(--text-small)] uppercase tracking-wider opacity-80">
                  {entry.kind} #{idx + 1}
                </span>
                {entry.text}
                {isCursor ? <span className="ml-2 text-[var(--text-small)] text-accent">◀ 재생 커서</span> : null}
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
      
      {error && (
        <div className="mt-2 whitespace-pre-wrap break-words rounded-[var(--radius-md)] border border-red-900/40 bg-red-950/20 px-3 py-2 text-red-300">
          오류{errorLine ? ` (라인 ${errorLine}${errorColumn ? `, 열 ${errorColumn}` : ''})` : ''}: {error}
        </div>
      )}
      
      {status === 'WAITING_INPUT' && (
        <div className="flex flex-col mt-2">
          <div className="mb-2 flex items-center gap-2 rounded-[var(--radius-md)] border border-amber-800/40 bg-amber-950/20 px-3 py-2 text-amber-200 animate-pulse">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500"></span>
            </span>
            입력을 위해 프로그램이 일시 중지되었습니다. 아래에 입력하고 Enter를 누르세요.
          </div>
          {latestInputEntry?.prompt ? (
            <div className="mb-2 rounded-[var(--radius-md)] border border-border bg-panel-alt px-3 py-1.5 text-[var(--text-small)] text-amber-200 shadow-sm">
              프롬프트: {latestInputEntry.prompt}
            </div>
          ) : null}
          <div className="flex items-center rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 shadow-sm">
            <span className="mr-2 font-bold text-amber-400">&gt;</span>
            <input
              type="text"
              className="flex-1 bg-transparent font-mono text-[var(--text-body)] text-foreground outline-none placeholder:text-foreground-secondary/70"
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
