import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/layout/Layout';
import { LandingPage } from '../components/layout/LandingPage';
import { UserProfile } from '../components/profile/UserProfile';

interface ProfilePageProps {
  onOpenAuthModal: (mode: 'login' | 'register') => void;
}

export function ProfilePage({ onOpenAuthModal }: ProfilePageProps) {
  const { isAuthenticated } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');

  if (!isAuthenticated) {
    return <LandingPage onRegisterClick={() => onOpenAuthModal('register')} />;
  }

  return (
    <Layout activeFilter={activeFilter} onFilterChange={setActiveFilter}>
      <UserProfile />
    </Layout>
  );
}
