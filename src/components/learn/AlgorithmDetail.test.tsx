import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import AlgorithmDetail from './AlgorithmDetail';
import { Algorithm } from '../../data/algorithms';

const mockAlgorithm: Algorithm = {
  id: 'test-algo',
  name: 'Test Algorithm',
  category: 'sorting',
  description: 'This is a test algorithm description.',
  timeComplexity: 'O(N)',
  spaceComplexity: 'O(1)',
  howItWorks: [
    'Step 1: Do something',
    'Step 2: Do something else',
  ],
  code: 'def test_algo():\n    pass',
};

describe('AlgorithmDetail', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders all algorithm details correctly', () => {
    render(<AlgorithmDetail algorithm={mockAlgorithm} />);

    expect(screen.getByTestId('algo-name').textContent).toBe('Test Algorithm');
    expect(screen.getByTestId('algo-category').textContent).toBe('sorting');
    expect(screen.getByTestId('algo-description').textContent).toBe('This is a test algorithm description.');
    expect(screen.getByTestId('algo-time-complexity').textContent).toBe('O(N)');
    expect(screen.getByTestId('algo-space-complexity').textContent).toBe('O(1)');
    
    const howItWorksList = screen.getByTestId('algo-how-it-works');
    expect(howItWorksList.textContent).toContain('Step 1: Do something');
    expect(howItWorksList.textContent).toContain('Step 2: Do something else');
    
    expect(screen.getByTestId('algo-code').textContent).toContain('def test_algo():');
  });

  it('calls onRunInEditor when the run button is clicked', () => {
    const handleRunInEditor = vi.fn();
    render(<AlgorithmDetail algorithm={mockAlgorithm} onRunInEditor={handleRunInEditor} />);

    const runButton = screen.getByTestId('run-in-editor-btn');
    fireEvent.click(runButton);

    expect(handleRunInEditor).toHaveBeenCalledTimes(1);
    expect(handleRunInEditor).toHaveBeenCalledWith(mockAlgorithm);
  });
});
