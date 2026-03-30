"use client";

import { useRef, useEffect, useMemo, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { buildCurrentStepMetadata, useStore } from '../store/useStore';
import PasswordModal from './PasswordModal';
import AiAnalysisPanel from './AiAnalysisPanel';

export default function EditorPanel() {
  const code = useStore((state) => state.code);
  const setCode = useStore((state) => state.setCode);
  const status = useStore((state) => state.status);
  const timeline = useStore((state) => state.timeline);
  const currentStepIndex = useStore((state) => state.currentStepIndex);
  const breakpoints = useStore((state) => state.breakpoints);
  const toggleBreakpoint = useStore((state) => state.toggleBreakpoint);
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const setAuthenticated = useStore((state) => state.setAuthenticated);
  const aiAnalysis = useStore((state) => state.aiAnalysis);
  const setAiAnalysis = useStore((state) => state.setAiAnalysis);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

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
          glyphMarginHoverMessage: { value: `${line}번째 줄의 재생 중단점` },
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
            glyphMarginHoverMessage: { value: `${line}번째 줄의 재생 중단점` },
          },
        })),
      );
    }
  }, [breakpoints, currentMeta?.eventKind, currentMeta?.hasBreakpoint, currentStepIndex, timeline, status]);

  const handleAiAnalysis = async () => {
    if (!isAuthenticated) {
      setIsModalOpen(true);
      return;
    }

    if (!code.trim()) return;

    setIsAiLoading(true);
    setIsPanelOpen(true);
    setAiAnalysis('AI가 코드를 분석하고 있습니다. 잠시만 기다려주세요...\n\n(이 작업은 코드가 길거나 복잡할 경우 수십 초가 걸릴 수 있습니다.)');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, password: '4490' })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '분석 실패');
      }

      setAiAnalysis(data.result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setAiAnalysis(`분석 중 오류가 발생했습니다: ${error.message}`);
      } else {
        setAiAnalysis(`분석 중 오류가 발생했습니다.`);
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex-1 border-r border-gray-700 flex flex-col min-h-0 relative">
      <div className="bg-gray-800 p-2 text-white font-semibold flex justify-between items-center shrink-0">
        <span>코드 편집기</span>
        <div className="flex items-center gap-4">
          <button
            onClick={handleAiAnalysis}
            disabled={isAiLoading || !code.trim()}
            className="flex items-center gap-1.5 px-3 py-1 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 text-sm rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {isAiLoading ? '분석 중...' : 'AI 분석'}
          </button>
          <span className="text-sm text-gray-400">{status} • 중단점 {breakpoints.length}개</span>
        </div>
      </div>
      <div className="flex-1 min-h-0 relative">
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
        {isPanelOpen && aiAnalysis !== null && (
          <AiAnalysisPanel 
            content={aiAnalysis} 
            onClose={() => setIsPanelOpen(false)} 
          />
        )}
      </div>

      <PasswordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          setAuthenticated(true);
          handleAiAnalysis();
        }}
      />
    </div>
  );
}
