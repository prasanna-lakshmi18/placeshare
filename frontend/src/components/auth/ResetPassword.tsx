import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { KeyRound, Loader2, CheckCircle2, Check, ShieldCheck } from 'lucide-react';
import api from '../../api/client';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Password requirement checks
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber;

  const strengthScore = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber].filter(Boolean).length;
  const strengthColor =
    strengthScore <= 1
      ? 'bg-rose-500'
      : strengthScore <= 3
      ? 'bg-amber-500'
      : 'bg-emerald-500';
  const strengthText =
    strengthScore <= 1
      ? 'Weak'
      : strengthScore <= 3
      ? 'Moderate'
      : 'Strong';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setStatus('error');
      setErrorMessage('Invalid or missing reset token.');
      return;
    }

    if (password !== confirmPassword) {
      setStatus('error');
      setErrorMessage('Passwords do not match.');
      return;
    }
    
    if (!isPasswordValid) {
      setStatus('error');
      setErrorMessage('Password must be at least 8 characters and contain uppercase, lowercase, and a number.');
      return;
    }

    setStatus('loading');
    try {
      await api.post('/auth/reset-password', { token, new_password: password });
      setStatus('success');
      setTimeout(() => navigate('/'), 3000);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.response?.data?.detail || 'An error occurred. The token may be expired or invalid.');
    }
  };

  if (!token) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-8 text-center shadow-sm border border-gray-200 dark:border-gray-800">
           <p className="text-rose-500 font-medium mb-4">Invalid or missing reset token.</p>
           <Link to="/" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">Return to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/50 rounded-2xl flex items-center justify-center mb-6">
          <KeyRound className="text-brand-600 dark:text-brand-400" size={24} />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create new password</h2>
        
        {status === 'success' ? (
          <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl flex flex-col items-center text-center">
            <CheckCircle2 className="text-emerald-500 mb-3" size={32} />
            <p className="text-emerald-700 dark:text-emerald-400 font-medium">Password reset successfully!</p>
            <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80 mt-1 mb-4">
              You will be redirected home shortly.
            </p>
            <Link to="/" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">Return to Home</Link>
          </div>
        ) : (
          <>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
              Your new password must be at least 8 characters and include uppercase, lowercase, and a number.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all text-sm"
                  required
                />
              </div>

              {password.length > 0 && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200/60 dark:border-gray-700/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <ShieldCheck size={14} className="text-brand-500" /> Password Security
                    </span>
                    <span className={strengthScore === 4 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-gray-600 dark:text-gray-300'}>
                      {strengthText}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strengthColor}`}
                      style={{ width: `${(strengthScore / 4) * 100}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[11px] pt-1">
                    <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                      <Check size={12} className={hasMinLength ? 'opacity-100' : 'opacity-30'} /> 8+ Characters
                    </span>
                    <span className={`flex items-center gap-1 ${hasUpperCase ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                      <Check size={12} className={hasUpperCase ? 'opacity-100' : 'opacity-30'} /> Uppercase (A-Z)
                    </span>
                    <span className={`flex items-center gap-1 ${hasLowerCase ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                      <Check size={12} className={hasLowerCase ? 'opacity-100' : 'opacity-30'} /> Lowercase (a-z)
                    </span>
                    <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                      <Check size={12} className={hasNumber ? 'opacity-100' : 'opacity-30'} /> Number (0-9)
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm new password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all text-sm"
                  required
                />
              </div>

              {status === 'error' && (
                <p className="text-rose-500 text-sm font-medium">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={status === 'loading' || !isPasswordValid || password !== confirmPassword}
                className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-medium shadow-sm hover:shadow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4 text-sm"
              >
                {status === 'loading' ? <Loader2 size={18} className="animate-spin" /> : 'Reset password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
