import { TrendingUp, Clock, Award, BarChart3, Lightbulb, Info } from 'lucide-react';
import { cn } from '../ui/ThemeToggle';

interface SidebarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const filters = [
  { key: 'all', label: 'All Experiences', icon: BarChart3 },
  { key: 'recent', label: 'Most Recent', icon: Clock },
  { key: 'popular', label: 'Most Popular', icon: TrendingUp },
  { key: 'selected', label: 'Got Selected', icon: Award },
];

export function Sidebar({ activeFilter, onFilterChange }: SidebarProps) {
  return (
    <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-8 sticky top-24">
      
      {/* Navigation */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 px-3">
          Browse
        </h3>
        <nav className="space-y-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => onFilterChange(f.key)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300",
                activeFilter === f.key
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200"
              )}
            >
              <f.icon size={18} className={activeFilter === f.key ? "text-brand-500" : "text-gray-400"} />
              {f.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Quick Tips */}
      <div className="hidden lg:block">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 px-3">
          Quick Tips
        </h3>
        <div className="space-y-3">
          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-xl p-4 transition-colors duration-300">
            <div className="flex items-start gap-2 text-amber-800 dark:text-amber-200">
              <Lightbulb size={18} className="shrink-0 mt-0.5" />
              <p className="text-sm">Share your placement journey to help fellow students prepare better!</p>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl p-4 transition-colors duration-300">
            <div className="flex items-start gap-2 text-blue-800 dark:text-blue-200">
              <Info size={18} className="shrink-0 mt-0.5" />
              <p className="text-sm">Include company name, role, and difficulty to make your post more helpful.</p>
            </div>
          </div>
        </div>
      </div>
      
    </aside>
  );
}
