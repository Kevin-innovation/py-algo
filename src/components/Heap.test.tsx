import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

import Heap from './Heap';
import { useStore, buildCurrentStepMetadata } from '../store/useStore';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      layout: _layout,
      initial: _initial,
      animate: _animate,
      exit: _exit,
      ...props
    }: {
      children: React.ReactNode;
      layout?: unknown;
      initial?: unknown;
      animate?: unknown;
      exit?: unknown;
    }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../store/useStore', () => ({
  useStore: vi.fn(),
  buildCurrentStepMetadata: vi.fn(),
}));

describe('Heap', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders deque values without [object Object]', () => {
    const state = {
      timeline: [
        {
          event: 'line',
          line: 1,
          stack: [{ func_name: 'Global', line: 1, locals: {} }],
          heap: {
            '14143216': {
              type: 'deque',
              id: 14143216,
              value: [
                { type: 'int', value: 101, id: 1 },
                { type: 'int', value: 202, id: 2 },
              ],
            },
          },
        },
      ],
      currentStepIndex: 0,
      breakpoints: [],
    };

    vi.mocked(buildCurrentStepMetadata).mockReturnValue({
      changedHeapIds: ['14143216'],
    } as never);

    (useStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (store: typeof state) => unknown) => selector(state));

    render(<Heap />);

    expect(screen.getByText('deque')).toBeTruthy();
    expect(screen.getByText('101')).toBeTruthy();
    expect(screen.getByText('202')).toBeTruthy();
    expect(screen.queryByText('[object Object],[object Object]')).toBeNull();
  });
});
