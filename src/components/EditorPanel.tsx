"use client";

import { useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useStore } from '../store/useStore';

export default function EditorPanel() {
  const code = useStore((state) => state.code);
  const setCode = useStore((state) => state.setCode);
  const status = useStore((state) => state.status);
  const timeline = useStore((state) => state.timeline);
  const currentStepIndex = useStore((state) => state.currentStepIndex);
  const isRunning = status === 'RUNNING' || status === 'LOADING' || status === 'WAITING_INPUT';

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null);
  const decorationsRef = useRef<editor.IEditorDecorationsCollection | null>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    decorationsRef.current = editor.createDecorationsCollection();
  };

  useEffect(() => {
    const currentLine = timeline[currentStepIndex]?.line;

    if (editorRef.current && decorationsRef.current && monacoRef.current && currentLine && status === 'READY') {
      decorationsRef.current.clear();
      decorationsRef.current.set([
        {
          range: new monacoRef.current.Range(currentLine, 1, currentLine, 1),
          options: {
            isWholeLine: true,
            className: 'active-line-highlight',
            glyphMarginClassName: 'active-line-glyph',
          },
        },
      ]);
      
      editorRef.current.revealLineInCenterIfOutsideViewport(currentLine);
    } else if (decorationsRef.current) {
      decorationsRef.current.clear();
    }
  }, [currentStepIndex, timeline, status]);

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
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            readOnly: isRunning,
            glyphMargin: true,
          }}
        />
      </div>
    </div>
  );
}
