import { type ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function Layout({ children, activeFilter, onFilterChange }: LayoutProps) {
  const { user, requestVerification } = useAuth();
  const [verificationSent, setVerificationSent] = useState(false);

  const handleVerify = async () => {
    try {
      if (requestVerification) {
        await requestVerification();
        setVerificationSent(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 py-8 items-start relative flex-1">
      <Sidebar activeFilter={activeFilter} onFilterChange={onFilterChange} />
      <main className="flex-1 w-full min-w-0 flex flex-col gap-6">
        {user && !user.is_verified && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-amber-500 shrink-0" size={24} />
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-500 text-sm sm:text-base">Please verify your email address</h3>
                <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-400">
                  {verificationSent 
                    ? "Verification email sent! Please check your inbox." 
                    : "You won't be able to create experiences or comments until your email is verified."}
                </p>
              </div>
            </div>
            {!verificationSent && (
              <button 
                onClick={handleVerify}
                className="shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors text-xs sm:text-sm whitespace-nowrap"
              >
                Resend Email
              </button>
            )}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
