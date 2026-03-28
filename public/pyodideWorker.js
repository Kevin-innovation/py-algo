importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js");

let pyodide = null;
let inputBuffer = null;
let inputInt32Array = null;

async function initPyodide() {
  if (!pyodide) {
    self.postMessage({ type: 'STATUS', status: 'Loading Pyodide...' });
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
            throw new Error("Cannot receive input. Ensure you are on localhost or a secure context.");
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

    self.postMessage({ type: 'STATUS', status: 'Ready' });
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
      self.postMessage({ type: 'ERROR', error: 'Init failed: ' + e.message });
    }
  } else if (type === 'RUN') {
    try {
      if (!pyodide) await initPyodide();
      
      self.postMessage({ type: 'STATUS', status: 'Loading dependencies...' });
      await pyodide.loadPackagesFromImports(code);
      self.postMessage({ type: 'STATUS', status: 'Running...' });
      
      const tracerCodeResponse = await fetch('/tracer.py');
      const tracerCode = await tracerCodeResponse.text();
      await pyodide.runPythonAsync(tracerCode);

      const runTraced = pyodide.globals.get('run_traced');
      const traceOutput = runTraced(code);
      
      self.postMessage({ type: 'DONE', trace: traceOutput });
    } catch (error) {
      self.postMessage({ type: 'ERROR', error: error.message });
    }
  }
};
