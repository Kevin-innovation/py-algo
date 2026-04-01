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
    <aside data-testid="algorithm-sidebar" className="w-[var(--spacing-sidebar)] border-r border-border h-full overflow-y-auto bg-sidebar flex flex-col">
      <div className="p-4">
        <h2 className="text-[var(--text-small)] font-semibold mb-3 text-foreground-secondary px-2 uppercase tracking-wider">
          알고리즘 카테고리
        </h2>
        <nav className="space-y-0.5">
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <div key={category.id}>
                <button
                  data-testid="category-item"
                  data-category={category.id}
                  onClick={() => onSelectCategory(category.id)}
                  className={`w-full flex items-center px-2 py-1.5 text-[var(--text-body)] rounded-[var(--radius-md)] transition-colors ${
                    isSelected
                      ? 'bg-panel-alt text-foreground font-medium'
                      : 'text-foreground-secondary hover:bg-panel-alt hover:text-foreground'
                  }`}
                  aria-current={isSelected ? 'page' : undefined}
                >
                  <span className="mr-2 text-base flex items-center justify-center w-5 h-5" aria-hidden="true">
                    {category.icon}
                  </span>
                  <span className="flex-1 text-left">{category.name}</span>
                  {isSelected ? (
                    <span className="text-[var(--text-small)] font-medium bg-background border border-border px-1.5 py-0.5 rounded-[var(--radius-sm)]">
                      {algorithmsInCategory.length}
                    </span>
                  ) : null}
                </button>

                {isSelected && algorithmsInCategory.length > 0 ? (
                  <div className="mt-1 mb-2 ml-4 border-l border-border pl-2 space-y-0.5" data-testid="algorithm-list">
                    {algorithmsInCategory.map((algorithm) => {
                      const isAlgorithmSelected = selectedAlgorithmId === algorithm.id;
                      return (
                        <button
                          key={algorithm.id}
                          data-testid="algorithm-item"
                          data-algorithm={algorithm.id}
                          onClick={() => onSelectAlgorithm(algorithm.id)}
                          className={`w-full text-left px-2 py-1.5 text-[var(--text-body)] rounded-[var(--radius-md)] transition-colors ${
                            isAlgorithmSelected
                              ? 'bg-panel-alt text-foreground font-medium'
                              : 'text-foreground-secondary hover:bg-panel-alt hover:text-foreground'
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
