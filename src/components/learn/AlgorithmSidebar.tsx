import { CATEGORIES } from '../../data/categories';
import type { Algorithm, AlgorithmCategory } from '../../data/algorithms';

interface AlgorithmSidebarProps {
  selectedCategory: AlgorithmCategory | null;
  selectedAlgorithmId?: string | null;
  algorithmsInCategory: Algorithm[];
  onSelectCategory: (category: AlgorithmCategory) => void;
  onSelectAlgorithm: (algorithmId: string) => void;
}

export default function AlgorithmSidebar({
  selectedCategory,
  selectedAlgorithmId,
  algorithmsInCategory,
  onSelectCategory,
  onSelectAlgorithm,
}: AlgorithmSidebarProps) {
  return (
    <aside data-testid="algorithm-sidebar" className="w-64 border-r border-gray-200 dark:border-gray-800 h-full overflow-y-auto bg-white dark:bg-gray-900">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          알고리즘 카테고리
        </h2>
        <nav className="space-y-1">
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <div key={category.id}>
                <button
                  data-testid="category-item"
                  data-category={category.id}
                  onClick={() => onSelectCategory(category.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                  aria-current={isSelected ? 'page' : undefined}
                >
                  <span className="mr-3 text-lg" aria-hidden="true">
                    {category.icon}
                  </span>
                  <span className="flex-1 text-left">{category.name}</span>
                  {isSelected ? (
                    <span className="text-xs font-semibold opacity-80">
                      {algorithmsInCategory.length}
                    </span>
                  ) : null}
                </button>

                {isSelected && algorithmsInCategory.length > 0 ? (
                  <div className="mt-1 ml-2 border-l border-gray-200 dark:border-gray-700 pl-2 space-y-1" data-testid="algorithm-list">
                    {algorithmsInCategory.map((algorithm) => {
                      const isAlgorithmSelected = selectedAlgorithmId === algorithm.id;
                      return (
                        <button
                          key={algorithm.id}
                          data-testid="algorithm-item"
                          data-algorithm={algorithm.id}
                          onClick={() => onSelectAlgorithm(algorithm.id)}
                          className={`w-full text-left px-2 py-1.5 text-xs rounded transition-colors ${
                            isAlgorithmSelected
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200'
                              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                          }`}
                          aria-current={isAlgorithmSelected ? 'true' : undefined}
                        >
                          {algorithm.name}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
