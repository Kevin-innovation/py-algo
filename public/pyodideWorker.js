importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js");

let pyodide = null;
let inputBuffer = null;
let inputInt32Array = null;

async function initPyodide() {
  if (!pyodide) {
    self.postMessage({ type: 'STATUS', status: 'Pyodide 로딩 중...' });
    pyodide = await loadPyodide({
      stdout: (text) => {
        self.postMessage({ type: 'STDOUT', text });
      },
      stderr: (text) => {
        self.postMessage({ type: 'STDERR', text });
      },
    });

    pyodide.setStdin({
      stdin: () => {
        try {
          if (!inputBuffer) {
            throw new Error("입력을 받을 수 없습니다. localhost 또는 안전한 컨텍스트(HTTPS) 환경인지 확인해주세요.");
          }
          self.postMessage({ type: 'INPUT_REQUEST' });
          
          Atomics.wait(inputInt32Array, 0, 0);
          
          const length = inputInt32Array[1];
          const sharedBytes = new Uint8Array(inputBuffer, 8, length);
          const localBytes = new Uint8Array(sharedBytes);
          const decoder = new TextDecoder();
          const str = decoder.decode(localBytes);
          
          Atomics.store(inputInt32Array, 0, 0);
          
          return str;
        } catch (e) {
          self.postMessage({ type: 'STDERR', text: 'STDIN JS ERROR: ' + e.message });
          throw e;
        }
      }
    });

    self.postMessage({ type: 'STATUS', status: '준비됨' });
    self.postMessage({ type: 'READY' });
  }
}

self.onmessage = async (event) => {
  const { type, code, buffer } = event.data;

  if (type === 'INIT') {
    if (buffer) {
      inputBuffer = buffer;
      inputInt32Array = new Int32Array(inputBuffer);
    }
    try {
      await initPyodide();
    } catch (e) {
      self.postMessage({ type: 'ERROR', error: '초기화 실패: ' + e.message });
    }
  } else if (type === 'RUN') {
    try {
      if (!pyodide) await initPyodide();
      
      self.postMessage({ type: 'STATUS', status: '패키지 불러오는 중...' });
      try {
        await pyodide.loadPackagesFromImports(code);
      } catch (e) {
        console.warn("Some packages failed to load:", e);
      }
      self.postMessage({ type: 'STATUS', status: '실행 중...' });
      
      const tracerCodeResponse = await fetch('/tracer.py?v=' + Date.now());
      const tracerCode = await tracerCodeResponse.text();
      await pyodide.runPythonAsync(tracerCode);

      const runTraced = pyodide.globals.get('run_traced');
      const traceOutput = runTraced(code);
      const parsedTrace = JSON.parse(traceOutput);

      if (Array.isArray(parsedTrace) && parsedTrace[0]?.event === 'compile_error') {
        const compileError = parsedTrace[0];
        self.postMessage({
          type: 'ERROR',
          error: `${compileError.error_type}: ${compileError.error_message}`,
          errorLine: compileError.line ?? null,
          errorColumn: compileError.offset ?? null,
          trace: traceOutput,
        });
        return;
      }
      
      self.postMessage({ type: 'DONE', trace: traceOutput });
    } catch (error) {
      self.postMessage({ type: 'ERROR', error: error.message, errorLine: null, errorColumn: null });
    }
  }
};
