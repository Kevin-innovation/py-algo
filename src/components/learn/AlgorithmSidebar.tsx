import { CATEGORIES } from '../../data/categories';
import type { AlgorithmCategory } from '../../data/algorithms';

interface AlgorithmSidebarProps {
  selectedCategory: AlgorithmCategory | null;
  onSelectCategory: (category: AlgorithmCategory) => void;
}

export default function AlgorithmSidebar({
  selectedCategory,
  onSelectCategory,
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
              <button
                key={category.id}
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
                {category.name}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
