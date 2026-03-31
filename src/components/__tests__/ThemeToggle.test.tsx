import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import ThemeToggle from '../ThemeToggle';
import { useStore } from '../../store/useStore';

vi.mock('../../store/useStore', () => {
  return {
    useStore: vi.fn(),
  };
});

type ThemeMode = 'light' | 'dark';

interface MockThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const setupStore = (state: MockThemeState) => {
  vi.mocked(useStore).mockImplementation((selector) => selector(state as never));
};

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('shows dark-mode target when current theme is light', () => {
    setupStore({ theme: 'light', setTheme: vi.fn() });

    render(<ThemeToggle />);
    const button = screen.getByTestId('theme-toggle');
    expect(button.getAttribute('title')).toBe('Switch to dark mode');
  });

  it('calls setTheme with dark when clicked in light mode', () => {
    const setTheme = vi.fn();
    setupStore({ theme: 'light', setTheme });

    render(<ThemeToggle />);
    fireEvent.click(screen.getByTestId('theme-toggle'));
    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('calls setTheme with light when clicked in dark mode', () => {
    const setTheme = vi.fn();
    setupStore({ theme: 'dark', setTheme });

    render(<ThemeToggle />);
    fireEvent.click(screen.getByTestId('theme-toggle'));
    expect(setTheme).toHaveBeenCalledWith('light');
  });
});
