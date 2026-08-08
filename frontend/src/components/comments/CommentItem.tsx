import { useState } from 'react';
import { Reply, Trash2, Pencil } from 'lucide-react';
import type { Comment } from '../../types';
import { EditedLabel } from '../ui/EditedLabel';
import { CommentForm } from './CommentForm';
import { useAuth } from '../../context/AuthContext';
import { useCreateComment, useUpdateComment, useDeleteComment } from '../../hooks/useComments';
import { cn } from '../ui/ThemeToggle';
import { Link } from 'react-router-dom';
import { getCommentTimeAgo } from '../../utils/date';

interface CommentItemProps {
  comment: Comment;
  experienceId: number;
  depth?: number;
}

const MAX_DEPTH = 5;

export function CommentItem({ comment, experienceId, depth = 0 }: CommentItemProps) {
  const { user, isAuthenticated } = useAuth();
  const createComment = useCreateComment(experienceId);
  const updateComment = useUpdateComment(experienceId);
  const deleteComment = useDeleteComment(experienceId);

  const [showReply, setShowReply] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const isOwner = user?.id === comment.author.id;
  const canNest = depth < MAX_DEPTH;

  const handleReply = async (content: string) => {
    await createComment.mutateAsync({ content, parent_id: comment.id });
    setShowReply(false);
  };

  const handleEdit = async () => {
    if (editContent.trim() && editContent !== comment.content) {
      await updateComment.mutateAsync({ commentId: comment.id, content: editContent.trim() });
    }
    setEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Delete this comment?')) {
      deleteComment.mutate(comment.id);
    }
  };

  const timeAgo = getCommentTimeAgo(comment.created_at);

  return (
    <div className={cn("relative flex gap-3 group mt-4", depth > 0 ? "ml-4 sm:ml-8" : "")}>
      {/* Thread Line connecting nested comments */}
      {depth > 0 && (
        <div className="absolute -left-4 sm:-left-8 top-10 bottom-[-16px] w-[2px] bg-gray-100 dark:bg-gray-800 rounded-full" />
      )}
      {depth > 0 && (
        <div className="absolute -left-4 sm:-left-8 top-4 w-4 sm:w-8 h-[2px] bg-gray-100 dark:bg-gray-800 rounded-r-full" />
      )}

      {/* Avatar */}
      <div className="shrink-0 z-10">
        <Link to={`/profile/${comment.author.id}`} className="block transition-transform hover:scale-105">
          {comment.author.avatar_url ? (
            <img src={comment.author.avatar_url} alt="" className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/50 dark:text-brand-300 flex items-center justify-center font-semibold text-xs border border-brand-200 dark:border-brand-800">
              {comment.author.username ? comment.author.username[0].toUpperCase() : 'U'}
            </div>
          )}
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <Link to={`/profile/${comment.author.id}`} className="font-semibold text-sm text-gray-900 dark:text-gray-100 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            {comment.author.username}
          </Link>
          <span className="text-[11px] text-gray-500 dark:text-gray-400">{timeAgo}</span>
          {comment.is_edited && <EditedLabel />}
        </div>

        {editing ? (
          <div className="mt-2 mb-3">
            <textarea
              className="block w-full min-h-[44px] py-2 px-3 bg-white dark:bg-gray-900 border border-brand-500 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all resize-y"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              autoFocus
              maxLength={2000}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button 
                onClick={() => setEditing(false)}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleEdit}
                className="px-3 py-1.5 text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed break-words">{comment.content}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {isAuthenticated && canNest && (
            <button
              onClick={() => setShowReply(!showReply)}
              className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <Reply size={12} /> Reply
            </button>
          )}
          {isOwner && !editing && (
            <>
              <button 
                onClick={() => { setEditing(true); setEditContent(comment.content); }}
                className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 transition-colors"
              >
                <Pencil size={12} /> Edit
              </button>
              <button 
                onClick={handleDelete}
                className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 transition-colors"
              >
                <Trash2 size={12} /> Delete
              </button>
            </>
          )}
        </div>

        {/* Reply form */}
        {showReply && (
          <div className="mt-3 mb-2">
            <CommentForm
              onSubmit={handleReply}
              placeholder={`Reply to @${comment.author.username}...`}
              isReply
              autoFocus
              onCancel={() => setShowReply(false)}
            />
          </div>
        )}

        {/* Nested children */}
        {comment.children && comment.children.length > 0 && (
          <div className="mt-1">
            {comment.children.map((child) => (
              <CommentItem
                key={child.id}
                comment={child}
                experienceId={experienceId}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
