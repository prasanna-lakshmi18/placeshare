import { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../../api/client';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    try {
      await api.post('/auth/forgot-password', { email });
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.response?.data?.detail || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-200 dark:border-gray-800">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Back
        </Link>

        <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/50 rounded-2xl flex items-center justify-center mb-6">
          <KeyRound className="text-brand-600 dark:text-brand-400" size={24} />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Reset password</h2>
        
        {status === 'success' ? (
          <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl flex flex-col items-center text-center">
            <CheckCircle2 className="text-emerald-500 mb-3" size={32} />
            <p className="text-emerald-700 dark:text-emerald-400 font-medium">Reset link sent!</p>
            <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80 mt-1">
              Check your email ({email}) for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
            </p>
          </div>
        ) : (
          <>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Enter the email address associated with your account and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all"
                  required
                />
              </div>

              {status === 'error' && (
                <p className="text-rose-500 text-sm font-medium">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={status === 'loading' || !email}
                className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-medium shadow-sm hover:shadow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {status === 'loading' ? <Loader2 size={18} className="animate-spin" /> : 'Send reset link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
