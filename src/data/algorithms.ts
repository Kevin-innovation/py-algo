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
  // 새로운 선택적 필드들 (optional)
  analogy?: string;
  prosCons?: {
    pros: string[];
    cons: string[];
  };
  examples?: string[];
  practiceProblems?: string[];
  caveats?: string[];
}

export interface Category {
  id: AlgorithmCategory;
  name: string;
  icon: string;
}
