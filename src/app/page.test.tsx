import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Home from './page';
import { useStore } from '../store/useStore';

vi.mock('../components/EditorPanel', () => ({ default: () => <div data-testid="mock-editor-panel" /> }));
vi.mock('../components/ControlBar', () => ({ default: () => <div data-testid="mock-control-bar" /> }));
vi.mock('../components/Visualizer', () => ({ default: () => <div data-testid="mock-visualizer" /> }));
vi.mock('../components/Terminal', () => ({
  default: ({ onInputSubmit }: { onInputSubmit: (text: string) => void }) => (
    <button data-testid="mock-terminal" onClick={() => onInputSubmit('input')} type="button">terminal</button>
  ),
}));

describe('Home header integration', () => {
  beforeEach(() => {
    class MockWorker {
      onmessage: ((event: MessageEvent) => void) | null = null;
      postMessage = vi.fn();
      terminate = vi.fn();
    }
    Object.defineProperty(globalThis, 'Worker', {
      value: MockWorker,
      writable: true,
      configurable: true,
    });
    useStore.setState({ theme: 'light' });
    document.documentElement.setAttribute('data-theme', 'light');
  });

  afterEach(() => {
    vi.clearAllMocks();
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
});
