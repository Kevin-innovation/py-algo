import sys
import json
import builtins

trace_output = []
MAX_REPR_LEN = 100
heap_objects = {}
io_history = []

def get_obj_id(obj):
    return id(obj)

def get_type_name(obj):
    return type(obj).__name__

def serialize_value(val):
    val_type = get_type_name(val)
    obj_id = get_obj_id(val)
    
    if val is None or isinstance(val, (int, float, bool, str)):
        return {"type": val_type, "value": val, "id": obj_id}
    else:
        # Complex object -> add to heap tracking
        if obj_id not in heap_objects:
            heap_objects[obj_id] = val
        return {"type": val_type, "id": obj_id, "ref": True}

def serialize_scope(scope_dict):
    result = {}
    for k, v in scope_dict.items():
        if k.startswith("__") or k in ['sys', 'json', 'trace_output', 'MAX_REPR_LEN', 'heap_objects', 'get_obj_id', 'get_type_name', 'serialize_value', 'serialize_scope', 'serialize_heap_objects', 'get_call_stack', 'trace_calls', 'run_traced']:
            continue
        result[k] = serialize_value(v)
    return result

def serialize_heap_objects():
    serialized_heap = {}
    # Use list to allow dictionary size changes if new nested objects are discovered
    for obj_id, obj in list(heap_objects.items()):
        val_type = get_type_name(obj)
        try:
            if isinstance(obj, list):
                serialized_heap[obj_id] = {"type": val_type, "id": obj_id, "value": [serialize_value(x) for x in obj]}
            elif isinstance(obj, dict):
                serialized_heap[obj_id] = {"type": val_type, "id": obj_id, "value": {str(k): serialize_value(v) for k, v in obj.items()}}
            elif isinstance(obj, tuple):
                serialized_heap[obj_id] = {"type": val_type, "id": obj_id, "value": [serialize_value(x) for x in obj]}
            elif isinstance(obj, set):
                serialized_heap[obj_id] = {"type": val_type, "id": obj_id, "value": [serialize_value(x) for x in obj]}
            else:
                rep = repr(obj)
                val = rep[:MAX_REPR_LEN] + "..." if len(rep) > MAX_REPR_LEN else rep
                serialized_heap[obj_id] = {"type": val_type, "id": obj_id, "value": val}
        except Exception:
            serialized_heap[obj_id] = {"type": val_type, "id": obj_id, "value": "<unserializable>"}
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

    snapshot = {
        "event": event,
        "line": frame.f_lineno,
        "stack": stack,
        "heap": serialize_heap_objects(),
        "io": list(io_history)
    }

    if event == 'exception':
        snapshot["exception"] = repr(arg)
    elif event == 'return':
        snapshot["return_value"] = serialize_value(arg)

    return snapshot

def append_snapshot(frame, event, arg=None):
    snapshot = build_snapshot(frame, event, arg)
    if snapshot is not None:
        trace_output.append(snapshot)

def traced_print(*args, **kwargs):
    sep = kwargs.get("sep", " ")
    end = kwargs.get("end", "\n")
    text = sep.join(str(arg) for arg in args) + end
    io_history.append(text)
    frame = sys._getframe(1)
    append_snapshot(frame, 'stdout')
    return builtins.print(*args, **kwargs)

def traced_input(prompt=""):
    value = builtins.input(prompt)
    echoed = f"{prompt}{value}\n"
    io_history.append(echoed)
    frame = sys._getframe(1)
    append_snapshot(frame, 'stdin')
    return value

def trace_calls(frame, event, arg):
    if frame.f_code.co_filename != "<string>":
        return trace_calls

    append_snapshot(frame, event, arg)
    return trace_calls

def run_traced(code_str):
    global trace_output, heap_objects, io_history
    trace_output = []
    heap_objects = {}
    io_history = []
    
    try:
        compiled_code = compile(code_str, "<string>", "exec")
        env = {
            "print": traced_print,
            "input": traced_input,
            "__name__": "__main__"
        }
        sys.settrace(trace_calls)
        exec(compiled_code, env)
    except Exception as e:
        trace_output.append({"event": "uncaught_exception", "exception": repr(e), "io": list(io_history)})
    finally:
        sys.settrace(None)
        
    return json.dumps(trace_output)
