import type { Algorithm, AlgorithmCategory } from '../algorithms';
import { DATA_STRUCTURE_ALGORITHMS } from './data-structures';
import { DP_ALGORITHMS } from './dp';
import { GRAPH_ALGORITHMS } from './graph';
import { SEARCHING_ALGORITHMS } from './searching';
import { SORTING_ALGORITHMS } from './sorting';
import { STRING_ALGORITHMS } from './strings';

export const ALGORITHMS_BY_CATEGORY: Record<AlgorithmCategory, Algorithm[]> = {
  sorting: SORTING_ALGORITHMS,
  searching: SEARCHING_ALGORITHMS,
  graph: GRAPH_ALGORITHMS,
  dp: DP_ALGORITHMS,
  strings: STRING_ALGORITHMS,
  'data-structures': DATA_STRUCTURE_ALGORITHMS,
};

export const ALL_ALGORITHMS: Algorithm[] = Object.values(ALGORITHMS_BY_CATEGORY).flat();

export const getAlgorithmsByCategory = (category: AlgorithmCategory): Algorithm[] => (
  ALGORITHMS_BY_CATEGORY[category] ?? []
);

export const getAlgorithmById = (algorithmId: string): Algorithm | undefined => (
  ALL_ALGORITHMS.find((algorithm) => algorithm.id === algorithmId)
);
