import sys
import json
import builtins

trace_output = []
MAX_REPR_LEN = 100
MAX_STEPS = 10000
MAX_COLLECTION_ITEMS = 120
MAX_HEAP_OBJECTS = 400
MAX_IO_EVENTS = 300
MAX_TRACE_BYTES = 5_000_000
step_count = 0
heap_objects = {}
io_history = []
trace_bytes = 0
io_overflowed = False


def truncate_repr_text(text):
    if len(text) > MAX_REPR_LEN:
        return text[:MAX_REPR_LEN] + "..."
    return text


def trim_collection(values):
    if len(values) <= MAX_COLLECTION_ITEMS:
        return values, 0
    return values[:MAX_COLLECTION_ITEMS], len(values) - MAX_COLLECTION_ITEMS


def trim_mapping_items(items):
    if len(items) <= MAX_COLLECTION_ITEMS:
        return items, 0
    return items[:MAX_COLLECTION_ITEMS], len(items) - MAX_COLLECTION_ITEMS

def append_io(kind, text, line=None, func_name=None, prompt=None, value=None):
    global io_overflowed
    if len(io_history) >= MAX_IO_EVENTS:
        if not io_overflowed:
            io_overflowed = True
            io_history.append({
                "kind": "stdout",
                "text": "[trace] IO 기록이 너무 많아 이후 일부 항목은 생략됩니다."
            })
        return

    entry = {
        "kind": kind,
        "text": text,
    }
    if line is not None:
        entry["line"] = line
    if func_name is not None:
        entry["func_name"] = func_name
    if prompt is not None:
        entry["prompt"] = prompt
    if value is not None:
        entry["value"] = value
    io_history.append(entry)

def get_obj_id(obj):
    return id(obj)

def get_type_name(obj):
    return type(obj).__name__


def get_size_bytes(obj):
    try:
        return int(sys.getsizeof(obj))
    except Exception:
        return None

def serialize_value(val):
    val_type = get_type_name(val)
    obj_id = get_obj_id(val)
    
    if val is None or isinstance(val, (int, float, bool, str)):
        if isinstance(val, str):
            val = truncate_repr_text(val)
        return {"type": val_type, "value": val, "id": obj_id}
    else:
        # Complex object -> add to heap tracking
        if obj_id not in heap_objects and len(heap_objects) < MAX_HEAP_OBJECTS:
            heap_objects[obj_id] = val
        return {"type": val_type, "id": obj_id, "ref": True}

def serialize_scope(scope_dict):
    result = {}
    for k, v in scope_dict.items():
        if k.startswith("__") or k in ['sys', 'json', 'trace_output', 'MAX_REPR_LEN', 'MAX_STEPS', 'step_count', 'heap_objects', 'get_obj_id', 'get_type_name', 'serialize_value', 'serialize_scope', 'serialize_heap_objects', 'get_call_stack', 'trace_calls', 'run_traced']:
            continue
        result[k] = serialize_value(v)
    return result

def serialize_heap_objects():
    serialized_heap = {}
    for obj_id, obj in list(heap_objects.items()):
        val_type = get_type_name(obj)
        try:
            if isinstance(obj, list) or val_type == 'deque':
                values, omitted = trim_collection(list(obj))
                serialized = [serialize_value(x) for x in values]
                payload = {"type": val_type, "id": obj_id, "value": serialized, "size_bytes": get_size_bytes(obj)}
                if omitted:
                    payload["omitted_items"] = omitted
                serialized_heap[obj_id] = payload
            elif isinstance(obj, dict) or val_type in ('Counter', 'defaultdict'):
                items, omitted = trim_mapping_items(list(obj.items()))
                value_map = {str(k): serialize_value(v) for k, v in items}
                payload = {"type": val_type, "id": obj_id, "value": value_map, "size_bytes": get_size_bytes(obj)}
                if omitted:
                    payload["omitted_items"] = omitted
                serialized_heap[obj_id] = payload
            elif isinstance(obj, tuple):
                values, omitted = trim_collection(list(obj))
                payload = {
                    "type": val_type,
                    "id": obj_id,
                    "value": [serialize_value(x) for x in values],
                    "size_bytes": get_size_bytes(obj),
                }
                if omitted:
                    payload["omitted_items"] = omitted
                serialized_heap[obj_id] = payload
            elif isinstance(obj, set):
                values, omitted = trim_collection(list(obj))
                payload = {
                    "type": val_type,
                    "id": obj_id,
                    "value": [serialize_value(x) for x in values],
                    "size_bytes": get_size_bytes(obj),
                }
                if omitted:
                    payload["omitted_items"] = omitted
                serialized_heap[obj_id] = payload
            elif val_type == 'ndarray':
                if hasattr(obj, 'size') and obj.size < 100 and hasattr(obj, 'tolist'):
                    serialized_heap[obj_id] = {
                        "type": "numpy.ndarray",
                        "id": obj_id,
                        "value": [serialize_value(x) for x in obj.tolist()],
                        "size_bytes": get_size_bytes(obj),
                    }
                else:
                    val = truncate_repr_text(repr(obj))
                    serialized_heap[obj_id] = {
                        "type": "numpy.ndarray",
                        "id": obj_id,
                        "value": val,
                        "size_bytes": get_size_bytes(obj),
                    }
            elif val_type == 'DataFrame':
                if hasattr(obj, 'shape') and obj.shape[0] * obj.shape[1] < 100 and hasattr(obj, 'to_dict'):
                    serialized_heap[obj_id] = {
                        "type": "pandas.DataFrame",
                        "id": obj_id,
                        "value": obj.to_dict('records'),
                        "size_bytes": get_size_bytes(obj),
                    }
                else:
                    val = truncate_repr_text(repr(obj))
                    serialized_heap[obj_id] = {
                        "type": "pandas.DataFrame",
                        "id": obj_id,
                        "value": val,
                        "size_bytes": get_size_bytes(obj),
                    }
            else:
                val = truncate_repr_text(repr(obj))
                serialized_heap[obj_id] = {
                    "type": val_type,
                    "id": obj_id,
                    "value": val,
                    "size_bytes": get_size_bytes(obj),
                }
        except Exception:
            serialized_heap[obj_id] = {
                "type": val_type,
                "id": obj_id,
                "value": "<unserializable>",
                "size_bytes": get_size_bytes(obj),
            }

    if len(heap_objects) >= MAX_HEAP_OBJECTS:
        serialized_heap["__meta__"] = {
            "type": "trace_meta",
            "message": "Heap object limit reached. Additional objects are omitted.",
            "max_heap_objects": MAX_HEAP_OBJECTS,
        }

    return serialized_heap

def get_call_stack(frame):
    stack = []
    curr = frame
    while curr is not None:
        if curr.f_code.co_filename != "<string>":
            curr = curr.f_back
            continue
            
        func_name = curr.f_code.co_name
        if func_name == "<module>":
            func_name = "Global"
            
        stack.insert(0, {
            "func_name": func_name,
            "line": curr.f_lineno,
            "locals": serialize_scope(curr.f_locals)
        })
        curr = curr.f_back
    return stack

def build_snapshot(frame, event, arg=None):
    stack = get_call_stack(frame)
    if not stack:
        return None

    active_func = stack[-1]["func_name"] if stack else "Global"

    snapshot = {
        "event": event,
        "line": frame.f_lineno,
        "func_name": active_func,
        "stack": stack,
        "heap": serialize_heap_objects(),
        "io": list(io_history)
    }

    if event in ('stdout', 'stdin') and io_history:
        snapshot["io_event"] = io_history[-1]

    if event == 'exception':
        snapshot["exception"] = repr(arg)
    elif event == 'return':
        snapshot["return_value"] = serialize_value(arg)

    return snapshot

def append_snapshot(frame, event, arg=None):
    global step_count, trace_bytes
    step_count += 1
    if step_count > MAX_STEPS:
        raise RuntimeError(f"Trace limit exceeded ({MAX_STEPS} steps). Potential infinite loop.")
        
    snapshot = build_snapshot(frame, event, arg)
    if snapshot is not None:
        encoded_len = len(json.dumps(snapshot, ensure_ascii=False))
        trace_bytes += encoded_len
        if trace_bytes > MAX_TRACE_BYTES:
            raise RuntimeError(
                f"Trace payload exceeded {MAX_TRACE_BYTES} bytes. "
                "Use smaller inputs or simplify large data structures."
            )
        trace_output.append(snapshot)

def traced_print(*args, **kwargs):
    sep = kwargs.get("sep", " ")
    end = kwargs.get("end", "\n")
    text = sep.join(str(arg) for arg in args) + end
    frame = sys._getframe(1)
    func_name = frame.f_code.co_name if frame.f_code.co_name != "<module>" else "Global"
    append_io("stdout", text, line=frame.f_lineno, func_name=func_name)
    append_snapshot(frame, 'stdout')
    
    sys.stdout.original_stdout.write(text)
    sys.stdout.original_stdout.flush()

def traced_input(prompt=""):
    frame = sys._getframe(1)
    func_name = frame.f_code.co_name if frame.f_code.co_name != "<module>" else "Global"
    
    if prompt:
        sys.stdout.original_stdout.write(str(prompt))
        sys.stdout.original_stdout.flush()
        
    val = sys.stdin.original_stdin.readline()
    clean_val = val[:-1] if val.endswith('\n') else val
    
    echoed = f"{prompt}{clean_val}\n"
    append_io("stdin", echoed, line=frame.f_lineno, func_name=func_name, prompt=prompt, value=clean_val)
    append_snapshot(frame, 'stdin')
    return clean_val

class TracedStdin:
    def __init__(self, original_stdin):
        self.original_stdin = original_stdin

    def readline(self):
        val = self.original_stdin.readline()
        frame = sys._getframe(1)
        func_name = frame.f_code.co_name if frame.f_code.co_name != "<module>" else "Global"
        
        clean_val = val[:-1] if val.endswith("\n") else val
        echoed = f"{clean_val}\n"
        
        append_io("stdin", echoed, line=frame.f_lineno, func_name=func_name, prompt="", value=clean_val)
        append_snapshot(frame, 'stdin')
        return val
    def read(self):
        return self.readline()

class TracedStdout:
    def __init__(self, original_stdout):
        self.original_stdout = original_stdout

    def write(self, s):
        frame = sys._getframe(1)
        func_name = frame.f_code.co_name if frame.f_code.co_name != "<module>" else "Global"
        append_io("stdout", str(s), line=frame.f_lineno, func_name=func_name)
        append_snapshot(frame, 'stdout')
        self.original_stdout.write(s)
        return len(s)
    def flush(self):
        self.original_stdout.flush()

def trace_calls(frame, event, arg):
    if frame.f_code.co_filename != "<string>":
        return trace_calls

    append_snapshot(frame, event, arg)
    return trace_calls

def run_traced(code_str):
    global trace_output, heap_objects, io_history, step_count, trace_bytes, io_overflowed
    trace_output = []
    heap_objects = {}
    io_history = []
    step_count = 0
    trace_bytes = 0
    io_overflowed = False
    
    try:
        compiled_code = compile(code_str, "<string>", "exec")
        env = {
            "print": traced_print,
            "input": traced_input,
            "__name__": "__main__"
        }
        
        original_stdin = sys.stdin
        while hasattr(original_stdin, 'original_stdin'):
            original_stdin = original_stdin.original_stdin
            
        original_stdout = sys.stdout
        while hasattr(original_stdout, 'original_stdout'):
            original_stdout = original_stdout.original_stdout
            
        sys.stdin = TracedStdin(original_stdin)
        sys.stdout = TracedStdout(original_stdout)
        
        try:
            sys.settrace(trace_calls)
            exec(compiled_code, env)
        finally:
            sys.settrace(None)
            sys.stdin = original_stdin
            sys.stdout = original_stdout
            
    except SyntaxError as e:
        trace_output.append({
            "event": "compile_error",
            "line": e.lineno or 0,
            "offset": e.offset,
            "text": e.text,
            "error_type": type(e).__name__,
            "error_message": str(e),
            "exception": repr(e),
            "io": list(io_history)
        })
    except Exception as e:
        trace_output.append({
            "event": "uncaught_exception",
            "line": getattr(e, 'lineno', 0) or 0,
            "error_type": type(e).__name__,
            "error_message": str(e),
            "exception": repr(e),
            "io": list(io_history)
        })
        
    try:
        return json.dumps(trace_output)
    except MemoryError:
        fallback = [{
            "event": "uncaught_exception",
            "line": 0,
            "error_type": "MemoryError",
            "error_message": "실행 추적 데이터가 너무 커서 직렬화할 수 없습니다. 입력 크기를 줄이거나 큰 자료구조를 단순화해 주세요.",
            "exception": "MemoryError('Trace serialization exceeded memory budget')",
            "io": list(io_history)
        }]
        return json.dumps(fallback)
