"use client";

import { useEffect, useRef, useState } from "react";
import Link from 'next/link';
import EditorPanel from "../components/EditorPanel";
import ControlBar from "../components/ControlBar";
import Visualizer from "../components/Visualizer";
import Terminal from "../components/Terminal";
import ThemeToggle from "../components/ThemeToggle";
import AuthButton from "../components/AuthButton";
import { useStore } from "../store/useStore";

const EXECUTION_TIMEOUT_MS = 8_000;
const EXECUTION_TIMEOUT_ERROR = `실행 시간이 ${EXECUTION_TIMEOUT_MS / 1000}초를 초과해 중단했습니다. 무한 루프를 확인해 주세요.`;

export default function Home() {
  const workerRef = useRef<Worker | null>(null);
  const inputBufferRef = useRef<SharedArrayBuffer | null>(null);
  const int32ArrayRef = useRef<Int32Array | null>(null);
  const uint8ArrayRef = useRef<Uint8Array | null>(null);
  const mainSplitRef = useRef<HTMLDivElement | null>(null);
  const rightSplitRef = useRef<HTMLDivElement | null>(null);
  const draggingMainRef = useRef(false);
  const draggingVerticalRef = useRef(false);
  const executionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mainSplitPercent, setMainSplitPercent] = useState(50);
  const [rightTopPercent, setRightTopPercent] = useState(66);
  const [isDesktop, setIsDesktop] = useState(false);

  const {
    code,
    setStatus,
    status,
    appendOutput,
    clearOutput,
    setError,
    setErrorLine,
    setErrorColumn,
    setTimeline,
    theme,
  } = useStore();

  const clearExecutionTimeout = () => {
    if (!executionTimeoutRef.current) return;
    clearTimeout(executionTimeoutRef.current);
    executionTimeoutRef.current = null;
  };

  const armExecutionTimeout = () => {
    clearExecutionTimeout();
    executionTimeoutRef.current = setTimeout(() => {
      workerRef.current?.terminate();
      workerRef.current = null;

      setStatus("ERROR");
      setError(EXECUTION_TIMEOUT_ERROR);
      setErrorLine(null);
      setErrorColumn(null);
    }, EXECUTION_TIMEOUT_MS);
  };

  const handleWorkerMessage = (e: MessageEvent) => {
    const { type, status: msgStatus, text, error, errorLine, errorColumn, trace } = e.data;

    if (type === "STATUS") {
      setStatus(msgStatus);
    } else if (type === "READY") {
      setStatus("READY");
    } else if (type === "STDOUT") {
      appendOutput(text);
    } else if (type === "STDERR") {
      appendOutput(text);
    } else if (type === "INPUT_REQUEST") {
      setStatus("WAITING_INPUT");
      clearExecutionTimeout();
    } else if (type === "ERROR") {
      clearExecutionTimeout();
      setStatus("ERROR");
      setError(error);
      setErrorLine(typeof errorLine === 'number' ? errorLine : null);
      setErrorColumn(typeof errorColumn === 'number' ? errorColumn : null);
    } else if (type === "DONE") {
      clearExecutionTimeout();
      setStatus("READY");
      setErrorLine(null);
      setErrorColumn(null);
      if (trace) {
        try {
          const parsedTrace = JSON.parse(trace);
          setTimeline(parsedTrace);
        } catch (err) {
          console.error("Failed to parse trace JSON:", err);
          setError("Failed to parse execution trace.");
        }
      }
    }
  };

  const createWorker = () => {
    const worker = new Worker("/pyodideWorker.js?v=" + Date.now());
    worker.onmessage = handleWorkerMessage;

    if (inputBufferRef.current) {
      worker.postMessage({
        type: "INIT",
        buffer: inputBufferRef.current,
      });
    } else {
      worker.postMessage({ type: "INIT" });
    }

    return worker;
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (draggingMainRef.current && mainSplitRef.current) {
        const rect = mainSplitRef.current.getBoundingClientRect();
        const raw = ((event.clientX - rect.left) / rect.width) * 100;
        const clamped = Math.min(70, Math.max(30, raw));
        setMainSplitPercent(clamped);
      }

      if (draggingVerticalRef.current && rightSplitRef.current) {
        const rect = rightSplitRef.current.getBoundingClientRect();
        const raw = ((event.clientY - rect.top) / rect.height) * 100;
        const clamped = Math.min(82, Math.max(38, raw));
        setRightTopPercent(clamped);
      }
    };

    const handleMouseUp = () => {
      draggingMainRef.current = false;
      draggingVerticalRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    const update = () => setIsDesktop(window.innerWidth >= 1024);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    try {
      if (typeof SharedArrayBuffer === "undefined") {
        throw new Error("SharedArrayBuffer is not supported. Please use localhost or enable Cross-Origin Isolation.");
      }
      inputBufferRef.current = new SharedArrayBuffer(1024 + 8);
      int32ArrayRef.current = new Int32Array(inputBufferRef.current);
      uint8ArrayRef.current = new Uint8Array(inputBufferRef.current);

      workerRef.current = createWorker();
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message || "Failed to initialize SharedArrayBuffer.");
      } else {
        setError("Failed to initialize SharedArrayBuffer.");
      }
      workerRef.current = createWorker();
    }

    return () => {
      clearExecutionTimeout();
      workerRef.current?.terminate();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runCode = () => {
    clearOutput();
    setError(null);
    setErrorLine(null);
    setErrorColumn(null);
    setStatus("RUNNING");
    setTimeline([]);
    
    if (int32ArrayRef.current) {
      Atomics.store(int32ArrayRef.current, 0, 0);
    }

    if (!workerRef.current) {
      workerRef.current = createWorker();
    }

    workerRef.current?.postMessage({ type: "RUN", code });
    armExecutionTimeout();
  };

  const handleInputSubmit = (text: string) => {
    if (!int32ArrayRef.current || !uint8ArrayRef.current || !inputBufferRef.current) return;

    appendOutput(text);

    // Encode string
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    const length = Math.min(bytes.length, 1024);

    // Write to buffer
    uint8ArrayRef.current.set(bytes.subarray(0, length), 8);
    int32ArrayRef.current[1] = length;

    setStatus("RUNNING");

    // Notify worker
    Atomics.store(int32ArrayRef.current, 0, 1);
    Atomics.notify(int32ArrayRef.current, 0, 1);
    armExecutionTimeout();
  };

  return (
    <div className="flex h-full bg-background overflow-hidden flex-col w-full">
      <div className="h-[var(--spacing-header)] bg-header border-b border-border flex items-center px-6 justify-between shrink-0" data-testid="app-header">
        <h1 className="text-foreground font-semibold text-[var(--text-section-title)] tracking-tight flex items-baseline gap-2">
          <span><span className="text-orange-500">DLAB</span> <span className="text-blue-500">Py</span>Algo</span>
          <span className="text-[var(--text-small)] font-medium text-foreground-secondary tracking-normal">visualization by Kevin</span>
        </h1>
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-1 bg-panel-alt p-1 rounded-[var(--radius-md)] border border-border">
            <Link
              href="/"
              className="inline-flex h-9 items-center justify-center rounded-[var(--radius-sm)] bg-panel px-3 text-[var(--text-body)] font-medium text-foreground shadow-sm transition-colors"
              data-testid="nav-editor"
            >
              에디터
            </Link>
            <Link
              href="/learn"
              className="inline-flex h-9 items-center justify-center rounded-[var(--radius-sm)] px-3 text-[var(--text-body)] text-foreground-secondary transition-colors hover:bg-panel hover:text-foreground"
              data-testid="nav-learn"
            >
              학습
            </Link>
          </nav>
          <div className="w-px h-4 bg-border"></div>
          <ThemeToggle />
          <AuthButton />
          <button
            onClick={runCode}
            disabled={status === "LOADING" || status === "RUNNING" || status === "WAITING_INPUT"}
            className="inline-flex h-9 items-center justify-center rounded-[var(--radius-md)] border border-border bg-accent px-4 text-[var(--text-body)] font-medium text-accent-foreground shadow-sm transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "RUNNING" ? "실행 중..." : status === "WAITING_INPUT" ? "입력 대기 중" : "코드 실행"}
          </button>
        </div>
      </div>

      <div ref={mainSplitRef} className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 p-4 lg:gap-0 gap-4">
        <div
          className="w-full flex flex-col relative min-h-0 bg-panel border border-border rounded-[var(--radius-lg)] shadow-sm overflow-hidden"
          style={isDesktop ? { width: `calc(${mainSplitPercent}% - 4px)` } : undefined}
        >
          <EditorPanel />
        </div>

        <div
          onMouseDown={() => {
            draggingMainRef.current = true;
          }}
          className="hidden lg:flex w-2 shrink-0 cursor-col-resize items-center justify-center"
          aria-hidden="true"
        >
          <div className="h-full w-px bg-border" />
        </div>

        <div
          ref={rightSplitRef}
          className={`w-full flex flex-col min-h-0 bg-panel border border-border rounded-[var(--radius-lg)] shadow-sm ${isDesktop ? 'overflow-hidden' : 'overflow-y-auto'}`}
          style={isDesktop ? { width: `calc(${100 - mainSplitPercent}% - 4px)` } : undefined}
        >
          <ControlBar />
          <div className={`flex-1 min-h-0 flex flex-col ${isDesktop ? 'overflow-hidden' : 'overflow-visible'}`}>
            <div
              className={isDesktop ? 'min-h-0' : 'min-h-[360px] shrink-0'}
              style={isDesktop ? { flexBasis: `${rightTopPercent}%` } : undefined}
            >
              <Visualizer />
            </div>
            <div
              onMouseDown={() => {
                draggingVerticalRef.current = true;
              }}
              className="hidden lg:flex h-2 shrink-0 cursor-row-resize items-center justify-center"
              aria-hidden="true"
            >
              <div className="w-full h-px bg-border" />
            </div>
            <div
              className={isDesktop ? 'min-h-0' : 'min-h-[240px] shrink-0'}
              style={isDesktop ? { flexBasis: `${100 - rightTopPercent}%` } : undefined}
            >
              <Terminal onInputSubmit={handleInputSubmit} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
