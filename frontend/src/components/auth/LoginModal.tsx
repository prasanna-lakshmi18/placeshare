import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginModalProps {
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export function LoginModal({ onClose, onSwitchToRegister }: LoginModalProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-800 transition-colors animate-in fade-in zoom-in-95 duration-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        
        <div className="relative p-8 pb-6">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={20} />
          </button>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">Sign in to share your placement experiences</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-rose-600 bg-rose-50 dark:bg-rose-500/10 rounded-xl border border-rose-100 dark:border-rose-500/20">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
                />
              </div>
              <div className="flex justify-end mt-1">
                <Link to="/forgot-password" onClick={onClose} className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-medium">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 px-4 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Sign In'}
            </button>
          </form>
        </div>

        <div className="px-8 py-5 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{' '}
            <button onClick={onSwitchToRegister} className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 hover:underline transition-all">
              Sign up
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
