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
  analogy: '마치 카드를 정렬하는 것과 같습니다.',
  prosCons: {
    pros: ['이해하기 쉬움', '구현이 간단함'],
    cons: ['큰 배열에서 느림', '메모리를 많이 사용'],
  },
  examples: [
    '작은 배열 정렬에 적합합니다',
    '교육용 예제로 자주 사용됩니다',
  ],
  practiceProblems: [
    '역순으로 정렬해보세요',
    '최적화 방법을 생각해보세요',
  ],
  caveats: [
    '큰 데이터셋에서는 피하세요',
    '안정 정렬이 필요한 경우 주의하세요',
  ],
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

  it('renders analogy section when provided', () => {
    render(<AlgorithmDetail algorithm={mockAlgorithm} />);
    
    expect(screen.getByTestId('algo-analogy').textContent).toContain('마치 카드를 정렬하는 것과 같습니다');
  });

  it('renders pros and cons section when provided', () => {
    render(<AlgorithmDetail algorithm={mockAlgorithm} />);
    
    const prosSection = screen.getByTestId('algo-pros');
    const consSection = screen.getByTestId('algo-cons');
    
    expect(prosSection.textContent).toContain('이해하기 쉬움');
    expect(prosSection.textContent).toContain('구현이 간단함');
    expect(consSection.textContent).toContain('큰 배열에서 느림');
    expect(consSection.textContent).toContain('메모리를 많이 사용');
  });

  it('renders examples section when provided', () => {
    render(<AlgorithmDetail algorithm={mockAlgorithm} />);
    
    const examplesSection = screen.getByTestId('algo-examples');
    
    expect(examplesSection.textContent).toContain('작은 배열 정렬에 적합합니다');
    expect(examplesSection.textContent).toContain('교육용 예제로 자주 사용됩니다');
  });

  it('renders practice problems section when provided', () => {
    render(<AlgorithmDetail algorithm={mockAlgorithm} />);
    
    const problemsSection = screen.getByTestId('algo-practice-problems');
    
    expect(problemsSection.textContent).toContain('역순으로 정렬해보세요');
    expect(problemsSection.textContent).toContain('최적화 방법을 생각해보세요');
  });

  it('renders caveats section when provided', () => {
    render(<AlgorithmDetail algorithm={mockAlgorithm} />);
    
    const caveatsSection = screen.getByTestId('algo-caveats');
    
    expect(caveatsSection.textContent).toContain('큰 데이터셋에서는 피하세요');
    expect(caveatsSection.textContent).toContain('안정 정렬이 필요한 경우 주의하세요');
  });

  it('does not render optional sections when not provided', () => {
    const minimalAlgorithm: Algorithm = {
      id: 'minimal',
      name: 'Minimal',
      category: 'sorting',
      description: 'Minimal description',
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
      howItWorks: ['Step 1'],
      code: 'pass',
    };
    
    render(<AlgorithmDetail algorithm={minimalAlgorithm} />);
    
    expect(screen.queryByTestId('algo-analogy')).toBeNull();
    expect(screen.queryByTestId('algo-pros')).toBeNull();
    expect(screen.queryByTestId('algo-cons')).toBeNull();
    expect(screen.queryByTestId('algo-examples')).toBeNull();
    expect(screen.queryByTestId('algo-practice-problems')).toBeNull();
    expect(screen.queryByTestId('algo-caveats')).toBeNull();
  });
});
