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
  const errorLine = useStore((state) => state.errorLine);
  const errorColumn = useStore((state) => state.errorColumn);
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const setAuthenticated = useStore((state) => state.setAuthenticated);
  const aiAnalysis = useStore((state) => state.aiAnalysis);
  const setAiAnalysis = useStore((state) => state.setAiAnalysis);
  const theme = useStore((state) => state.theme);

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

    if (!decorationsRef.current || !monacoRef.current) {
      return;
    }

    const monaco = monacoRef.current;
    const codeLines = code.split('\n');

    const breakpointDecorations = breakpoints.map((line) => ({
      range: new monaco.Range(line, 1, line, 1),
      options: {
        glyphMarginClassName: 'breakpoint-glyph',
        glyphMarginHoverMessage: { value: `${line}번째 줄의 재생 중단점` },
      },
    }));

    const errorDecorations = errorLine
      ? [{
        range: new monaco.Range(errorLine, 1, errorLine, 1),
        options: {
          isWholeLine: true,
          className: 'compile-error-line-highlight',
          glyphMarginClassName: 'compile-error-glyph',
          glyphMarginHoverMessage: { value: `${errorLine}번째 줄${errorColumn ? ` ${errorColumn}번째 열` : ''}에서 컴파일 오류가 발생했습니다.` },
        },
      }, {
        range: new monaco.Range(
          errorLine,
          Math.max(errorColumn ?? 1, 1),
          errorLine,
          Math.min(Math.max(errorColumn ?? 1, 1) + 1, (codeLines[errorLine - 1]?.length ?? 0) + 1),
        ),
        options: {
          inlineClassName: 'compile-error-inline-highlight',
          hoverMessage: { value: `${errorLine}번째 줄${errorColumn ? ` ${errorColumn}번째 열` : ''} 근처 문법을 확인하세요.` },
        },
      }]
      : [];

    if (editorRef.current && status === 'READY') {
      if (!currentLine) {
        decorationsRef.current.clear();
        decorationsRef.current.set([...breakpointDecorations, ...errorDecorations]);
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
        ...errorDecorations,
        {
          range: new monaco.Range(currentLine, 1, currentLine, 1),
          options: {
            isWholeLine: true,
            className: emphasisClass,
            glyphMarginClassName: 'active-line-glyph',
          },
        },
      ]);
      
      editorRef.current.revealLineInCenterIfOutsideViewport(currentLine);
    } else {
      decorationsRef.current.clear();
      decorationsRef.current.set([...breakpointDecorations, ...errorDecorations]);

      if (errorLine && editorRef.current) {
        editorRef.current.revealLineInCenterIfOutsideViewport(errorLine);
        if (errorColumn) {
          editorRef.current.setPosition({ lineNumber: errorLine, column: errorColumn });
        }
      }
    }
  }, [breakpoints, code, currentMeta?.eventKind, currentMeta?.hasBreakpoint, currentStepIndex, errorColumn, errorLine, timeline, status]);

  const runAiAnalysis = async () => {
    if (!code.trim()) return;

    setIsAiLoading(true);
    setIsPanelOpen(true);
    setAiAnalysis('AI가 코드를 분석하고 있습니다. 잠시만 기다려주세요...\n\n(이 작업은 코드가 길거나 복잡할 경우 수십 초가 걸릴 수 있습니다.)');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const data = await response.json();

      if (response.status === 401) {
        setAuthenticated(false);
        setIsModalOpen(true);
        throw new Error(data.error || 'AI 분석 인증이 만료되었습니다.');
      }
      
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

  const handleAiAnalysis = async () => {
    if (!isAuthenticated) {
      setIsModalOpen(true);
      return;
    }

    await runAiAnalysis();
  };

  return (
    <div className="flex-1 border-r border-border bg-panel flex flex-col min-h-0 relative">
      <div className="flex items-center justify-between gap-4 shrink-0 border-b border-border bg-panel-alt px-4 py-2.5 text-foreground">
        <span className="text-[var(--text-body)] font-medium">코드 편집기</span>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAiAnalysis}
            disabled={isAiLoading || !code.trim()}
            className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-background px-3 text-[var(--text-body)] text-foreground shadow-sm transition-colors hover:bg-panel disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-background"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {isAiLoading ? '분석 중...' : 'AI 분석'}
          </button>
          <span className="text-[var(--text-small)] text-foreground-secondary whitespace-nowrap">{status} • 중단점 {breakpoints.length}개</span>
        </div>
      </div>
      <div className="flex-1 min-h-0 relative">
        <Editor
          height="100%"
          defaultLanguage="python"
          theme={theme === 'dark' ? 'vs-dark' : 'vs'}
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
          runAiAnalysis();
        }}
      />

    </div>
  );
}
