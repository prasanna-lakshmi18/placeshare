import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/layout/Layout';
import { LandingPage } from '../components/layout/LandingPage';
import { ExperienceFeed } from '../components/experience/ExperienceFeed';
import { ExperienceFilters } from '../components/experience/ExperienceFilters';
import type { ExperienceFilters as FilterType } from '../hooks/useExperiences';

interface HomePageProps {
  onOpenAuthModal: (mode: 'login' | 'register') => void;
}

export function HomePage({ onOpenAuthModal }: HomePageProps) {
  const { isAuthenticated } = useAuth();
  const [filters, setFilters] = useState<FilterType>({});
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  if (!isAuthenticated) {
    return <LandingPage onRegisterClick={() => onOpenAuthModal('register')} />;
  }

  return (
    <Layout activeFilter={activeFilter} onFilterChange={setActiveFilter}>
      {/* Search Bar & Filters Toggle */}
      <div className="flex gap-2 mb-4">
        <div className="relative group flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
            <Search size={20} className="text-gray-400 group-focus-within:text-brand-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search experiences by company, role..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="block w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 shadow-sm transition-all"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-4 rounded-2xl border transition-colors flex items-center justify-center ${
            showFilters
              ? 'bg-brand-50 border-brand-200 text-brand-600 dark:bg-brand-500/10 dark:border-brand-500/20 dark:text-brand-400'
              : 'bg-white border-gray-200 text-gray-700 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
          title="Toggle filters"
        >
          <Filter size={20} />
        </button>
      </div>

      <div className="mb-6">
        <ExperienceFilters
          filters={filters}
          onChange={setFilters}
          isOpen={showFilters}
          onToggle={() => setShowFilters(!showFilters)}
        />
      </div>

      {/* Experience Feed */}
      <ExperienceFeed filters={filters} />
    </Layout>
  );
}
