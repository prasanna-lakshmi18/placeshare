import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../ui/ThemeToggle';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  autoFocus?: boolean;
  onCancel?: () => void;
  className?: string;
  isReply?: boolean;
}

export function CommentForm({ onSubmit, placeholder, autoFocus = false, onCancel, className, isReply = false }: CommentFormProps) {
  const { user, isAuthenticated } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className={cn("p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 text-center", className)}>
        <p className="text-sm text-gray-500 dark:text-gray-400">Sign in to join the conversation</p>
      </div>
    );
  }

  const defaultPlaceholder = placeholder || (isReply 
    ? `Reply as ${user?.username || 'user'}...` 
    : `Comment as ${user?.username || 'user'}...`);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      await onSubmit(content.trim());
      setContent('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={cn("flex items-start gap-2.5", className)} onSubmit={handleSubmit}>
      {/* Current User Avatar */}
      <div className="shrink-0 pt-1">
        {user?.avatar_url ? (
          <img src={user.avatar_url} alt="" className="w-7 h-7 rounded-full border border-gray-200 dark:border-gray-700" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/50 dark:text-brand-300 flex items-center justify-center font-semibold text-xs border border-brand-200 dark:border-brand-800">
            {user?.username ? user.username[0].toUpperCase() : 'U'}
          </div>
        )}
      </div>

      <div className="relative flex-1">
        <textarea
          className="block w-full min-h-[42px] max-h-32 py-2 pl-3.5 pr-12 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900 transition-all resize-y"
          placeholder={defaultPlaceholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          autoFocus={autoFocus}
          maxLength={2000}
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <div className="absolute right-1.5 bottom-1.5 flex items-center">
          {onCancel && (
            <button 
              type="button" 
              className="px-2 py-1 mr-1 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors" 
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="p-1.5 text-white bg-brand-600 rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:bg-gray-400 dark:disabled:bg-gray-700 transition-colors flex items-center justify-center"
            disabled={loading || !content.trim()}
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        </div>
      </div>
    </form>
  );
}
