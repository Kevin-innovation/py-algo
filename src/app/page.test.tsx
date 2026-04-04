import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Home from './page';
import { useStore } from '../store/useStore';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock('../components/EditorPanel', () => ({ default: () => <div data-testid="mock-editor-panel" /> }));
vi.mock('../components/ControlBar', () => ({ default: () => <div data-testid="mock-control-bar" /> }));
vi.mock('../components/Visualizer', () => ({ default: () => <div data-testid="mock-visualizer" /> }));
vi.mock('../components/AuthButton', () => ({ default: () => <div data-testid="mock-auth-button" /> }));
vi.mock('../components/Terminal', () => ({
  default: ({ onInputSubmit }: { onInputSubmit: (text: string) => void }) => (
    <button data-testid="mock-terminal" onClick={() => onInputSubmit('input')} type="button">terminal</button>
  ),
}));

describe('Home header integration', () => {
  let workerInstances: Array<{ postMessage: ReturnType<typeof vi.fn>; terminate: ReturnType<typeof vi.fn> }>;

  beforeEach(() => {
    workerInstances = [];

    class MockWorker {
      onmessage: ((event: MessageEvent) => void) | null = null;
      postMessage = vi.fn();
      terminate = vi.fn();

      constructor() {
        workerInstances.push(this);
      }
    }
    Object.defineProperty(globalThis, 'Worker', {
      value: MockWorker,
      writable: true,
      configurable: true,
    });
    useStore.setState({ theme: 'light' });
    useStore.setState({ status: 'READY', error: null, timeline: [], output: [] });
    document.documentElement.setAttribute('data-theme', 'light');
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('places theme toggle in header and toggles theme on click', () => {
    render(<Home />);

    const header = screen.getByTestId('app-header');
    expect(screen.getByTestId('nav-editor').getAttribute('href')).toBe('/');
    expect(screen.getByTestId('nav-learn').getAttribute('href')).toBe('/learn');
    const toggle = screen.getByTestId('theme-toggle');
    expect(header.contains(toggle)).toBe(true);

    fireEvent.click(toggle);
    expect(useStore.getState().theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('stops runaway execution after timeout', () => {
    vi.useFakeTimers();
    render(<Home />);

    const runButton = screen.getAllByRole('button', { name: '코드 실행' })[0];
    fireEvent.click(runButton);

    expect(workerInstances.length).toBeGreaterThan(0);
    const worker = workerInstances[0];
    expect(worker.postMessage).toHaveBeenCalledWith(expect.objectContaining({ type: 'RUN' }));

    act(() => {
      vi.advanceTimersByTime(8_100);
    });

    expect(worker.terminate).toHaveBeenCalledTimes(1);
    expect(useStore.getState().status).toBe('ERROR');
    expect(useStore.getState().error).toContain('실행 시간이 8초를 초과해 중단했습니다');

    vi.useRealTimers();
  });
});
