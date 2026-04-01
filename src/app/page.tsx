"use client";

import { useEffect, useRef } from "react";
import Link from 'next/link';
import EditorPanel from "../components/EditorPanel";
import ControlBar from "../components/ControlBar";
import Visualizer from "../components/Visualizer";
import Terminal from "../components/Terminal";
import ThemeToggle from "../components/ThemeToggle";
import { useStore } from "../store/useStore";

export default function Home() {
  const workerRef = useRef<Worker | null>(null);
  const inputBufferRef = useRef<SharedArrayBuffer | null>(null);
  const int32ArrayRef = useRef<Int32Array | null>(null);
  const uint8ArrayRef = useRef<Uint8Array | null>(null);

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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    workerRef.current = new Worker("/pyodideWorker.js?v=" + Date.now());

    try {
      if (typeof SharedArrayBuffer === "undefined") {
        throw new Error("SharedArrayBuffer is not supported. Please use localhost or enable Cross-Origin Isolation.");
      }
      inputBufferRef.current = new SharedArrayBuffer(1024 + 8);
      int32ArrayRef.current = new Int32Array(inputBufferRef.current);
      uint8ArrayRef.current = new Uint8Array(inputBufferRef.current);

      workerRef.current.postMessage({
        type: "INIT",
        buffer: inputBufferRef.current,
      });
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message || "Failed to initialize SharedArrayBuffer.");
      } else {
        setError("Failed to initialize SharedArrayBuffer.");
      }
      workerRef.current.postMessage({ type: "INIT" });
    }

    workerRef.current.onmessage = (e) => {
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
      } else if (type === "ERROR") {
        setStatus("ERROR");
        setError(error);
        setErrorLine(typeof errorLine === 'number' ? errorLine : null);
        setErrorColumn(typeof errorColumn === 'number' ? errorColumn : null);
      } else if (type === "DONE") {
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

    return () => {
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

    workerRef.current?.postMessage({ type: "RUN", code });
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
          <button
            onClick={runCode}
            disabled={status === "LOADING" || status === "RUNNING" || status === "WAITING_INPUT"}
            className="inline-flex h-9 items-center justify-center rounded-[var(--radius-md)] border border-border bg-accent px-4 text-[var(--text-body)] font-medium text-accent-foreground shadow-sm transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "RUNNING" ? "실행 중..." : status === "WAITING_INPUT" ? "입력 대기 중" : "코드 실행"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 p-4 gap-4">
        {/* Left Pane: Editor */}
        <div className="w-full lg:w-1/2 flex flex-col relative min-h-0 bg-panel border border-border rounded-[var(--radius-lg)] shadow-sm overflow-hidden">
          <EditorPanel />
        </div>

        {/* Right Pane: Visualizer & Terminal */}
        <div className="w-full lg:w-1/2 flex flex-col min-h-0 bg-panel border border-border rounded-[var(--radius-lg)] shadow-sm overflow-hidden">
          <ControlBar />
          <Visualizer />
          <Terminal onInputSubmit={handleInputSubmit} />
        </div>
      </div>
    </div>
  );
}
