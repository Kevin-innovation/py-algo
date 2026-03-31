import { describe, it, expect, vi, afterEach } from 'vitest';
import { fireEvent, render, screen, cleanup, waitFor } from '@testing-library/react';
import EditorPanel from './EditorPanel';
import { useStore } from '../store/useStore';

// Mock useStore
vi.mock('../store/useStore', () => ({
  useStore: vi.fn(),
  buildCurrentStepMetadata: vi.fn(),
}));

// Mock Editor
vi.mock('@monaco-editor/react', () => ({
  default: vi.fn((props: { theme: string }) => <div data-testid="mock-editor" data-theme={props.theme}>Editor</div>),
}));

vi.mock('./PasswordModal', () => ({
  default: ({ isOpen, onSuccess }: { isOpen: boolean; onSuccess: () => void }) => (
    isOpen ? <button data-testid="mock-password-success" type="button" onClick={onSuccess}>auth</button> : null
  ),
}));

const makeBaseState = () => {
  const state = {
    code: 'print(1)',
    setCode: vi.fn(),
    status: 'READY',
    timeline: [],
    currentStepIndex: 0,
    breakpoints: [],
    toggleBreakpoint: vi.fn(),
    errorLine: null,
    errorColumn: null,
    isAuthenticated: true,
    setAuthenticated: vi.fn((value: boolean) => {
      state.isAuthenticated = value;
    }),
    aiAnalysis: null,
    setAiAnalysis: vi.fn(),
    theme: 'dark',
  };
  return state;
};

describe('EditorPanel', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('passes vs-dark theme when store theme is dark', () => {
    const state = makeBaseState();
    state.code = '';
    (useStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (store: typeof state) => unknown) => selector(state));

    render(<EditorPanel />);
    const editor = screen.getByTestId('mock-editor');
    expect(editor.getAttribute('data-theme')).toBe('vs-dark');
  });

  it('passes vs theme when store theme is light', () => {
    const state = makeBaseState();
    state.theme = 'light';
    state.code = '';
    (useStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (store: typeof state) => unknown) => selector(state));

    render(<EditorPanel />);
    const editor = screen.getByTestId('mock-editor');
    expect(editor.getAttribute('data-theme')).toBe('vs');
  });

  it('starts analysis after successful modal authentication', async () => {
    const state = makeBaseState();
    state.isAuthenticated = false;
    (useStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (store: typeof state) => unknown) => selector(state));

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: 'ok' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<EditorPanel />);
    fireEvent.click(screen.getByText('AI 분석'));
    fireEvent.click(screen.getByTestId('mock-password-success'));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/analyze', expect.objectContaining({ method: 'POST' }));
    });
  });

  it('reopens auth modal and resets auth state on analyze 401', async () => {
    const state = makeBaseState();
    state.isAuthenticated = true;
    (useStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (store: typeof state) => unknown) => selector(state));

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'AI 분석 인증이 필요합니다.' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<EditorPanel />);
    fireEvent.click(screen.getByText('AI 분석'));

    await waitFor(() => {
      expect(state.isAuthenticated).toBe(false);
      expect(screen.getByTestId('mock-password-success')).toBeDefined();
    });
  });
});
