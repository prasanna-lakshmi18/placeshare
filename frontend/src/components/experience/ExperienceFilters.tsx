import { Filter, X } from 'lucide-react';
import type { ExperienceFilters as FilterType } from '../../hooks/useExperiences';

interface ExperienceFiltersProps {
  filters: FilterType;
  onChange: (filters: FilterType) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function ExperienceFilters({ filters, onChange, isOpen }: ExperienceFiltersProps) {
  if (!isOpen) return null;

  const handleChange = (key: keyof FilterType, value: string) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  const clearFilters = () => {
    onChange({ search: filters.search }); // Preserve search
  };

  const activeFilterCount = Object.keys(filters).filter(k => k !== 'search' && filters[k as keyof FilterType]).length;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-medium">
          <Filter size={18} className="text-brand-500" />
          <h3>Advanced Filters</h3>
          {activeFilterCount > 0 && (
            <span className="bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400 text-xs font-bold px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1 transition-colors"
          >
            <X size={14} /> Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company</label>
          <input
            type="text"
            placeholder="e.g. Google"
            value={filters.company || ''}
            onChange={(e) => handleChange('company', e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
          <input
            type="text"
            placeholder="e.g. SDE"
            value={filters.role || ''}
            onChange={(e) => handleChange('role', e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty</label>
          <select
            value={filters.difficulty || ''}
            onChange={(e) => handleChange('difficulty', e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all appearance-none"
          >
            <option value="">Any</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Result</label>
          <select
            value={filters.result || ''}
            onChange={(e) => handleChange('result', e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all appearance-none"
          >
            <option value="">Any</option>
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>
    </div>
  );
}
