import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, LogIn, LogOut, Plus, UserCircle, ShieldAlert } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../ui/ThemeToggle';

interface NavbarProps {
  onCreateClick: () => void;
  onLoginClick: () => void;
}

export function Navbar({ onCreateClick, onLoginClick }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    try {
      setResending(true);
      await axios.post('/api/auth/request-verification');
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch (err) {
      console.error('Failed to resend verification:', err);
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-brand-100 text-brand-600 dark:bg-brand-900 dark:text-brand-300 rounded-xl group-hover:scale-105 transition-transform duration-300">
              <GraduationCap size={24} />
            </div>
            <span className="font-semibold text-xl tracking-tight text-gray-900 dark:text-white">PlaceShare</span>
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                <button
                  onClick={onCreateClick}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-full shadow-sm hover:shadow transition-all duration-300"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">Share</span>
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-800">
                  <Link to={`/profile/${user?.id}`} className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors relative">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/50 dark:text-brand-300 flex items-center justify-center border border-brand-200 dark:border-brand-800">
                        <UserCircle size={18} />
                      </div>
                    )}
                    <span className="hidden sm:inline">{user?.username}</span>
                    {user && !user.is_verified && (
                      <span className="absolute -top-1 -left-1 w-3 h-3 bg-amber-500 border-2 border-white dark:border-gray-950 rounded-full" title="Email not verified" />
                    )}
                  </Link>
                  <button
                    onClick={logout}
                    className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-full transition-colors duration-300"
                    title="Sign out"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={onLoginClick}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-medium rounded-full shadow-sm hover:shadow transition-all duration-300"
              >
                <LogIn size={18} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {isAuthenticated && user && !user.is_verified && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-900/30 py-2">
          <div className="flex items-center justify-center gap-4 text-sm text-amber-800 dark:text-amber-400 font-medium">
            <ShieldAlert size={16} className="text-amber-600 dark:text-amber-400" />
            <span>Please verify your email to unlock all features.</span>
            <button 
              onClick={handleResend}
              disabled={resending || resent}
              className="font-bold underline hover:text-amber-900 dark:hover:text-amber-200 disabled:opacity-50 disabled:no-underline transition-colors"
            >
              {resent ? 'Verification Sent!' : resending ? 'Sending...' : 'Resend link'}
            </button>
          </div>
        </div>
      )}

    </>
  );
}
