"use client";

import { useEffect, useRef } from "react";
import EditorPanel from "../components/EditorPanel";
import ControlBar from "../components/ControlBar";
import Visualizer from "../components/Visualizer";
import Terminal from "../components/Terminal";
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
    setTimeline,
  } = useStore();

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
      const { type, status: msgStatus, text, error, trace } = e.data;

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
      } else if (type === "DONE") {
        setStatus("READY");
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
    <div className="flex h-full bg-gray-900 overflow-hidden flex-col w-full">
      <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center px-6 justify-between shadow-sm shrink-0">
        <h1 className="text-white font-bold text-2xl tracking-tight flex items-baseline gap-2">
          <span><span className="text-blue-500">DLAB Py</span>Algo</span>
          <span className="text-sm font-medium text-gray-400 tracking-normal">visualization by Kevin</span>
        </h1>
        <button
          onClick={runCode}
          disabled={status === "LOADING" || status === "RUNNING" || status === "WAITING_INPUT"}
          className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-md font-semibold disabled:opacity-50 transition-colors"
        >
          {status === "RUNNING" ? "실행 중..." : status === "WAITING_INPUT" ? "입력 대기 중" : "코드 실행"}
        </button>
      </div>

      <div className="flex-1 flex flex-row overflow-hidden min-h-0">
        {/* Left Pane: Editor */}
        <div className="w-1/2 flex flex-col relative min-h-0">
          <EditorPanel />
        </div>

        {/* Right Pane: Visualizer & Terminal */}
        <div className="w-1/2 flex flex-col bg-gray-900 border-l border-gray-700 min-h-0">
          <ControlBar />
          <Visualizer />
          <Terminal onInputSubmit={handleInputSubmit} />
        </div>
      </div>
    </div>
  );
}
