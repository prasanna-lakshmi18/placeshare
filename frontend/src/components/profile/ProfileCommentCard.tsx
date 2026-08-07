import { MessageSquare, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { UserComment } from '../../types';

interface ProfileCommentCardProps {
  comment: UserComment;
}

export function ProfileCommentCard({ comment }: ProfileCommentCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-2 mb-3 text-sm text-gray-500 dark:text-gray-400">
        <MessageSquare size={16} className="text-brand-500" />
        <span>
          Commented {formatDistanceToNow(new Date(comment.created_at))} ago on
        </span>
        <span className="font-medium text-gray-900 dark:text-gray-200">
          {comment.experience_company} - {comment.experience_role}
        </span>
      </div>
      
      <p className="text-gray-800 dark:text-gray-200 mb-4 whitespace-pre-wrap">
        {comment.content}
      </p>

      {/* Since we don't have a single experience view page yet, we can't link to the post directly. 
          If we did, we'd use <Link to={`/experience/${comment.experience_id}`}> */}
      <div className="flex items-center text-sm font-medium text-brand-600 dark:text-brand-400 opacity-75 cursor-not-allowed">
        View Experience <ArrowRight size={16} className="ml-1" />
      </div>
    </div>
  );
}
