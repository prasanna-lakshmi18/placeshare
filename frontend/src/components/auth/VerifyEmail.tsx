import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Missing verification token.');
        return;
      }

      try {
        await api.post(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage('Your email has been successfully verified! You can now access all features.');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.detail || 'Verification failed. The link may be expired or invalid.');
      }
    };

    const timer = setTimeout(verifyToken, 1500); // Add a small delay for a smoother loading experience
    return () => clearTimeout(timer);
  }, [token]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 text-center overflow-hidden relative">
        {/* Background glow effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center">
          {status === 'loading' && (
            <>
              <div className="w-20 h-20 bg-brand-50 dark:bg-brand-500/10 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
                <Loader2 className="w-10 h-10 text-brand-600 dark:text-brand-400 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verifying...</h2>
              <p className="text-gray-500 dark:text-gray-400">Please wait while we process your request.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-20 h-20 bg-green-50 dark:bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 animate-bounce-short">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Success!</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">{message}</p>
              <button
                onClick={() => navigate('/')}
                className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-semibold shadow-lg shadow-brand-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Go to Dashboard <ArrowRight size={18} />
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mb-6">
                <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verification Failed</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">{message}</p>
              <button
                onClick={() => navigate('/')}
                className="w-full py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-2xl font-semibold transition-all"
              >
                Back to Home
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
