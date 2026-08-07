import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Layout } from './components/layout/Layout';
import { ExperienceFeed } from './components/experience/ExperienceFeed';
import { CreateExperience } from './components/experience/CreateExperience';
import { LandingPage } from './components/layout/LandingPage';
import { LoginModal } from './components/auth/LoginModal';
import { RegisterModal } from './components/auth/RegisterModal';
import { Search, Filter } from 'lucide-react';
import { ExperienceFilters } from './components/experience/ExperienceFilters';
import type { ExperienceFilters as FilterType } from './hooks/useExperiences';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProfile } from './components/profile/UserProfile';
import { ForgotPassword } from './components/auth/ForgotPassword';
import { ResetPassword } from './components/auth/ResetPassword';
import { VerifyEmail } from './components/auth/VerifyEmail';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);
  const [filters, setFilters] = useState<FilterType>({});
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <BrowserRouter>
      <Navbar 
        onCreateClick={() => setShowCreate(true)} 
        onLoginClick={() => setAuthModal('login')} 
      />

      <Routes>
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        <Route path="/" element={
          !isAuthenticated ? (
            <LandingPage onRegisterClick={() => setAuthModal('register')} />
          ) : (
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
                  className={`px-4 py-4 rounded-2xl border transition-colors flex items-center justify-center ${showFilters ? 'bg-brand-50 border-brand-200 text-brand-600 dark:bg-brand-500/10 dark:border-brand-500/20 dark:text-brand-400' : 'bg-white border-gray-200 text-gray-700 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
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
          )
        } />

        <Route path="/profile/:id" element={
          isAuthenticated ? (
            <Layout activeFilter={activeFilter} onFilterChange={setActiveFilter}>
              <UserProfile />
            </Layout>
          ) : (
            <LandingPage onRegisterClick={() => setAuthModal('register')} />
          )
        } />
      </Routes>

      {/* Modals */}
      {showCreate && <CreateExperience onClose={() => setShowCreate(false)} />}
      
      {authModal === 'login' && (
        <LoginModal
          onClose={() => setAuthModal(null)}
          onSwitchToRegister={() => setAuthModal('register')}
        />
      )}
      
      {authModal === 'register' && (
        <RegisterModal
          onClose={() => setAuthModal(null)}
          onSwitchToLogin={() => setAuthModal('login')}
        />
      )}
    </BrowserRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
