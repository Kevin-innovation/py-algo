"use client";

import { useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';

export default function Terminal({ onInputSubmit }: { onInputSubmit: (text: string) => void }) {
  const output = useStore((state) => state.output);
  const status = useStore((state) => state.status);
  const error = useStore((state) => state.error);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output, status]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const text = e.currentTarget.value;
      onInputSubmit(text + '\n');
      e.currentTarget.value = '';
    }
  };

  return (
    <div className="h-48 bg-black text-green-400 font-mono text-sm p-4 overflow-y-auto flex flex-col border-t border-gray-700 shrink-0">
      <div className="text-gray-500 mb-2 border-b border-gray-800 pb-1 shrink-0">Terminal</div>
      {output.map((line, idx) => (
        <div key={idx} className="whitespace-pre-wrap">{line}</div>
      ))}
      
      {error && <div className="text-red-500 mt-2">Error: {error}</div>}
      
      {status === 'WAITING_INPUT' && (
        <div className="flex flex-col mt-2">
          <div className="text-yellow-400 mb-1 animate-pulse flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
            </span>
            Program is waiting for your input. Type below and press Enter:
          </div>
          <div className="flex items-center bg-gray-900 border border-yellow-500/50 rounded p-1 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
            <span className="text-yellow-400 mr-2 ml-1 font-bold">&gt;</span>
            <input
              type="text"
              className="bg-transparent text-white outline-none flex-1 font-mono"
              autoFocus
              placeholder="Enter input here..."
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      )}
      <div ref={terminalEndRef} />
    </div>
  );
}
