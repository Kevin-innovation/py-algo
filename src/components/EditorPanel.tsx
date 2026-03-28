"use client";

import Editor from '@monaco-editor/react';
import { useStore } from '../store/useStore';

export default function EditorPanel() {
  const code = useStore((state) => state.code);
  const setCode = useStore((state) => state.setCode);
  const status = useStore((state) => state.status);
  const isRunning = status === 'RUNNING' || status === 'LOADING' || status === 'WAITING_INPUT';

  return (
    <div className="flex-1 border-r border-gray-700 flex flex-col min-h-0">
      <div className="bg-gray-800 p-2 text-white font-semibold flex justify-between shrink-0">
        <span>Code Editor</span>
        <span className="text-sm text-gray-400">{status}</span>
      </div>
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          defaultLanguage="python"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            readOnly: isRunning,
          }}
        />
      </div>
    </div>
  );
}
