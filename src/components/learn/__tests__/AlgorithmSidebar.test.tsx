import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import AlgorithmSidebar from '../AlgorithmSidebar';
import { CATEGORIES } from '../../../data/categories';
import { getAlgorithmsByCategory } from '../../../data/algorithms/index';

describe('AlgorithmSidebar', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders all six categories', () => {
    render(
        <AlgorithmSidebar
          selectedCategory={null}
          selectedAlgorithmId={null}
          algorithmsInCategory={[]}
          onSelectCategory={() => {}}
          onSelectAlgorithm={() => {}}
        />
    );

    expect(screen.getByTestId('algorithm-sidebar')).toBeDefined();

    const items = screen.getAllByTestId('category-item');
    expect(items.length).toBe(6);
    
    CATEGORIES.forEach((category) => {
      const button = items.find(item => item.getAttribute('data-category') === category.id);
      expect(button).toBeDefined();
      expect(button!.textContent).toContain(category.name);
      expect(button!.textContent).toContain(category.icon);
    });
  });

  it('highlights the selected category', () => {
    const selectedId = CATEGORIES[0].id;
    render(
        <AlgorithmSidebar
          selectedCategory={selectedId}
          selectedAlgorithmId={null}
          algorithmsInCategory={getAlgorithmsByCategory(selectedId)}
          onSelectCategory={() => {}}
          onSelectAlgorithm={() => {}}
        />
    );

    const items = screen.getAllByTestId('category-item');
    const selectedButton = items.find(item => item.getAttribute('data-category') === selectedId);
    expect(selectedButton!.className).toContain('bg-blue-50');
    expect(selectedButton!.getAttribute('aria-current')).toBe('page');

    const unselectedButton = items.find(item => item.getAttribute('data-category') === CATEGORIES[1].id);
    expect(unselectedButton!.className).not.toContain('bg-blue-50');
    expect(unselectedButton!.getAttribute('aria-current')).toBeNull();
  });

  it('emits selection changes on click', () => {
    const handleSelect = vi.fn();
    render(
        <AlgorithmSidebar
          selectedCategory={null}
          selectedAlgorithmId={null}
          algorithmsInCategory={[]}
          onSelectCategory={handleSelect}
          onSelectAlgorithm={() => {}}
        />
    );

    const targetCategory = CATEGORIES[2];
    const items = screen.getAllByTestId('category-item');
    const button = items.find(item => item.getAttribute('data-category') === targetCategory.id);
    
    fireEvent.click(button!);
    
    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(targetCategory.id);
  });

  it('renders and emits algorithm selection in selected category', () => {
    const handleSelectAlgorithm = vi.fn();
    const selectedId = 'sorting';
    const sortingAlgorithms = getAlgorithmsByCategory(selectedId);

    render(
      <AlgorithmSidebar
        selectedCategory={selectedId}
        selectedAlgorithmId={sortingAlgorithms[0]?.id ?? null}
        algorithmsInCategory={sortingAlgorithms}
        onSelectCategory={() => {}}
        onSelectAlgorithm={handleSelectAlgorithm}
      />
    );

    const algorithmItems = screen.getAllByTestId('algorithm-item');
    expect(algorithmItems.length).toBe(sortingAlgorithms.length);

    fireEvent.click(algorithmItems[1]);
    expect(handleSelectAlgorithm).toHaveBeenCalledWith(sortingAlgorithms[1].id);
  });
});
