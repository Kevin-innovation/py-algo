import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import DynamicPointers from './DynamicPointers';
import { useStore } from '../store/useStore';

vi.mock('../store/useStore', () => ({
  useStore: vi.fn(),
}));

vi.mock('react-xarrows', () => ({
  default: ({ start, end }: { start: string; end: string }) => (
    <div data-testid="arrow">{`${start}->${end}`}</div>
  ),
}));

describe('DynamicPointers', () => {
  const baseState = {
    timeline: [
      {
        stack: [
          {
            func_name: 'Global',
            line: 1,
            locals: {
              a: { type: 'list', id: '1', ref: true },
              b: { type: 'dict', id: '2', ref: true },
            },
          },
          {
            func_name: 'foo',
            line: 2,
            locals: {
              c: { type: 'dict', id: '2', ref: true },
            },
          },
        ],
        heap: {
          '1': {
            type: 'list',
            id: '1',
            value: [{ type: 'dict', id: '2', ref: true }],
          },
          '2': {
            type: 'dict',
            id: '2',
            value: {},
          },
        },
      },
    ],
    currentStepIndex: 0,
  };

  it('shows only selected global pointers in filtered mode', () => {
    (useStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: typeof baseState) => unknown) => selector(baseState));

    render(<DynamicPointers showAllPointers={false} enabledGlobalPointerVars={['a']} />);

    const arrows = screen.getAllByTestId('arrow');
    expect(arrows).toHaveLength(1);
    expect(arrows[0].textContent).toBe('var-Global-0-a->heap-1');
  });

  it('shows all pointer arrows when global toggle is on', () => {
    (useStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: typeof baseState) => unknown) => selector(baseState));

    render(<DynamicPointers showAllPointers enabledGlobalPointerVars={[]} />);

    const arrowLabels = screen.getAllByTestId('arrow').map((el) => el.textContent);
    expect(arrowLabels).toContain('var-Global-0-a->heap-1');
    expect(arrowLabels).toContain('var-Global-0-b->heap-2');
    expect(arrowLabels).toContain('var-foo-1-c->heap-2');
    expect(arrowLabels).toContain('heap-1-item-0->heap-2');
  });
});
