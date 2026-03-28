"use client";

import { useRef, useEffect, useMemo } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { buildCurrentStepMetadata, useStore } from '../store/useStore';

export default function EditorPanel() {
  const code = useStore((state) => state.code);
  const setCode = useStore((state) => state.setCode);
  const status = useStore((state) => state.status);
  const timeline = useStore((state) => state.timeline);
  const currentStepIndex = useStore((state) => state.currentStepIndex);
  const breakpoints = useStore((state) => state.breakpoints);
  const toggleBreakpoint = useStore((state) => state.toggleBreakpoint);
  const currentMeta = useMemo(
    () => buildCurrentStepMetadata(timeline, breakpoints, currentStepIndex),
    [timeline, breakpoints, currentStepIndex],
  );
  const isRunning = status === 'RUNNING' || status === 'LOADING' || status === 'WAITING_INPUT';

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null);
  const decorationsRef = useRef<editor.IEditorDecorationsCollection | null>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    decorationsRef.current = editor.createDecorationsCollection();

    editor.onMouseDown((event) => {
      const target = event.target;
      if (!target.position || !monacoRef.current) return;
      if (target.type === monacoRef.current.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
        toggleBreakpoint(target.position.lineNumber);
      }
    });
  };

  useEffect(() => {
    const currentLine = timeline[currentStepIndex]?.line;

    if (editorRef.current && decorationsRef.current && monacoRef.current && status === 'READY') {
      const breakpointDecorations = breakpoints.map((line) => ({
        range: new monacoRef.current!.Range(line, 1, line, 1),
        options: {
          glyphMarginClassName: 'breakpoint-glyph',
          glyphMarginHoverMessage: { value: `Playback breakpoint at line ${line}` },
        },
      }));

      if (!currentLine) {
        decorationsRef.current.clear();
        decorationsRef.current.set(breakpointDecorations);
        return;
      }

      const emphasisClass = currentMeta?.eventKind === 'stdout'
        ? 'active-line-highlight-stdout'
        : currentMeta?.eventKind === 'stdin'
          ? 'active-line-highlight-stdin'
          : currentMeta?.hasBreakpoint
            ? 'active-line-highlight-breakpoint'
            : 'active-line-highlight';

      decorationsRef.current.clear();
      decorationsRef.current.set([
        ...breakpointDecorations,
        {
          range: new monacoRef.current.Range(currentLine, 1, currentLine, 1),
          options: {
            isWholeLine: true,
            className: emphasisClass,
            glyphMarginClassName: 'active-line-glyph',
          },
        },
      ]);
      
      editorRef.current.revealLineInCenterIfOutsideViewport(currentLine);
    } else if (decorationsRef.current && monacoRef.current) {
      decorationsRef.current.clear();
      decorationsRef.current.set(
        breakpoints.map((line) => ({
          range: new monacoRef.current!.Range(line, 1, line, 1),
          options: {
            glyphMarginClassName: 'breakpoint-glyph',
            glyphMarginHoverMessage: { value: `Playback breakpoint at line ${line}` },
          },
        })),
      );
    }
  }, [breakpoints, currentMeta?.eventKind, currentMeta?.hasBreakpoint, currentStepIndex, timeline, status]);

  return (
    <div className="flex-1 border-r border-gray-700 flex flex-col min-h-0">
      <div className="bg-gray-800 p-2 text-white font-semibold flex justify-between shrink-0">
        <span>Code Editor</span>
        <span className="text-sm text-gray-400">{status} • {breakpoints.length} BP</span>
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
