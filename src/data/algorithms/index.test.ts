import { describe, expect, it } from 'vitest';
import { ALL_ALGORITHMS, ALGORITHMS_BY_CATEGORY, getAlgorithmById, getAlgorithmsByCategory } from './index';

describe('algorithm datasets', () => {
  it('contains planned category counts', () => {
    expect(ALGORITHMS_BY_CATEGORY.sorting).toHaveLength(6);
    expect(ALGORITHMS_BY_CATEGORY.searching).toHaveLength(5);
    expect(ALGORITHMS_BY_CATEGORY.graph).toHaveLength(6);
    expect(ALGORITHMS_BY_CATEGORY.dp).toHaveLength(5);
    expect(ALGORITHMS_BY_CATEGORY.strings).toHaveLength(5);
    expect(ALGORITHMS_BY_CATEGORY['data-structures']).toHaveLength(6);
  });

  it('exposes category lookup helper', () => {
    const sorting = getAlgorithmsByCategory('sorting');
    expect(sorting[0]?.category).toBe('sorting');
    expect(sorting).toHaveLength(6);
  });

  it('finds algorithm by id from aggregated list', () => {
    expect(ALL_ALGORITHMS.length).toBe(33);
    const item = getAlgorithmById('binary-search');
    expect(item?.name).toBe('이진 탐색');
  });
});
