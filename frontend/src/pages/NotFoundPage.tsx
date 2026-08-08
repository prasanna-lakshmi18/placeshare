import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="w-16 h-16 bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
          <Compass size={32} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">404 - Page Not Found</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
        >
          <Home size={16} /> Back to Home
        </Link>
      </div>
    </div>
  );
}
