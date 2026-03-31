export type AlgorithmCategory =
  | 'sorting'
  | 'searching'
  | 'graph'
  | 'dp'
  | 'strings'
  | 'data-structures';

export interface Algorithm {
  id: string;
  name: string;
  category: AlgorithmCategory;
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
  howItWorks: string[];
  code: string;
}

export interface Category {
  id: AlgorithmCategory;
  name: string;
  icon: string;
}
