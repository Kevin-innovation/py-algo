import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LearnPageClient from './LearnPageClient';
import { useStore } from '../../store/useStore';

const pushMock = vi.fn();
const replaceMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
  usePathname: () => '/learn',
  useSearchParams: () => new URLSearchParams('algo=binary-search'),
}));

describe('/learn page', () => {
  beforeEach(() => {
    pushMock.mockReset();
    replaceMock.mockReset();
    useStore.setState({ theme: 'light', code: '' });
    document.documentElement.setAttribute('data-theme', 'light');
  });

  afterEach(() => {
    cleanup();
  });

  it('renders sidebar and detail panel from query parameter', () => {
    render(<LearnPageClient />);

    expect(screen.getByTestId('nav-editor').getAttribute('href')).toBe('/');
    expect(screen.getByTestId('nav-learn').getAttribute('href')).toBe('/learn');
    expect(screen.getByTestId('algorithm-sidebar')).toBeDefined();
    expect(screen.getByTestId('algorithm-detail')).toBeDefined();
    expect(screen.getByTestId('algo-name').textContent).toBe('이진 탐색');
  });

  it('changes query when selecting category item', () => {
    render(<LearnPageClient />);
    const dpButton = screen
      .getAllByTestId('category-item')
      .find((el) => el.getAttribute('data-category') === 'dp');

    if (!dpButton) throw new Error('dp category button missing');
    fireEvent.click(dpButton);

    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock.mock.calls[0][0]).toContain('/learn?algo=');
  });

  it('navigates to editor and writes code when run-in-editor clicked', () => {
    render(<LearnPageClient />);
    fireEvent.click(screen.getAllByTestId('run-in-editor-btn')[0]);

    expect(pushMock).toHaveBeenCalledWith('/');
    expect(useStore.getState().code.length).toBeGreaterThan(0);
  });
});
