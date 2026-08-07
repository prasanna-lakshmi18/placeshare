import { useComments, useCreateComment } from '../../hooks/useComments';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';
import { CommentSkeleton } from '../ui/SkeletonLoader';

interface CommentThreadProps {
  experienceId: number;
}

export function CommentThread({ experienceId }: CommentThreadProps) {
  const { data: comments, isLoading, isError } = useComments(experienceId);
  const createComment = useCreateComment(experienceId);

  const handleCreate = async (content: string) => {
    await createComment.mutateAsync({ content });
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <CommentForm onSubmit={handleCreate} placeholder="Add a comment..." />
      </div>

      {isLoading && (
        <div className="space-y-4">
          <CommentSkeleton />
          <CommentSkeleton />
        </div>
      )}

      {isError && (
        <p className="text-sm text-rose-500 py-2">Failed to load comments</p>
      )}

      {comments && comments.length > 0 && (
        <div className="space-y-1">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              experienceId={experienceId}
            />
          ))}
        </div>
      )}

      {comments && comments.length === 0 && (
        <div className="text-center py-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet. Start the conversation!</p>
        </div>
      )}
    </div>
  );
}
