import { UserProfile } from '../components/profile/UserProfile';

interface ProfilePageProps {
  onOpenAuthModal: (mode: 'login' | 'register') => void;
}

export function ProfilePage({ onOpenAuthModal: _onOpenAuthModal }: ProfilePageProps) {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-gray-950 transition-colors duration-300">
      <UserProfile />
    </main>
  );
}
