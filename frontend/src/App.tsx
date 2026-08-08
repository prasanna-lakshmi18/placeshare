import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { LoginModal } from './components/auth/LoginModal';
import { RegisterModal } from './components/auth/RegisterModal';
import { CreateExperience } from './components/experience/CreateExperience';
import { AppRoutes } from './routes';

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
  const { isLoading } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading PlaceShare...</span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* Top Navigation */}
      <Navbar 
        onCreateClick={() => setShowCreate(true)} 
        onLoginClick={() => setAuthModal('login')} 
      />

      {/* Modular Routes */}
      <AppRoutes onOpenAuthModal={(mode) => setAuthModal(mode)} />

      {/* Global Modals */}
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
