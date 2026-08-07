import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Clock, Building2, Briefcase, ChevronDown, ChevronUp, Trash2, Pencil } from 'lucide-react';
import type { Experience } from '../../types';
import { LikeButton } from '../ui/LikeButton';
import { EditedLabel } from '../ui/EditedLabel';
import { useAuth } from '../../context/AuthContext';
import { useToggleLike, useDeleteExperience } from '../../hooks/useExperiences';
import { CommentThread } from '../comments/CommentThread';
import { cn } from '../ui/ThemeToggle';

interface ExperienceCardProps {
  experience: Experience;
}

const difficultyStyles: Record<string, string> = {
  easy: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20',
  medium: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20',
  hard: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20',
};

const resultStyles: Record<string, string> = {
  selected: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20',
  rejected: 'bg-gray-100 text-gray-600 ring-gray-500/20 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700',
  pending: 'bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-500/10 dark:text-purple-400 dark:ring-purple-500/20',
};

export function ExperienceCard({ experience }: ExperienceCardProps) {
  const { isAuthenticated, user } = useAuth();
  const toggleLike = useToggleLike();
  const deleteExp = useDeleteExperience();
  const [showComments, setShowComments] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const isOwner = user?.id === experience.author.id;

  const timeAgo = getTimeAgo(experience.created_at);
  const isLong = experience.description.length > 300;

  return (
    <article className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-800 transition-colors duration-300 relative group">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-5">
        <Link to={`/profile/${experience.author.id}`} className="flex items-center gap-3 group/author">
          {experience.author.avatar_url ? (
            <img src={experience.author.avatar_url} alt="" className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 group-hover/author:ring-2 group-hover/author:ring-brand-500 transition-all" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/50 dark:text-brand-300 flex items-center justify-center font-bold text-lg border border-brand-200 dark:border-brand-800 group-hover/author:ring-2 group-hover/author:ring-brand-500 transition-all">
              {experience.author.username[0].toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-semibold text-gray-900 dark:text-gray-100 group-hover/author:text-brand-600 dark:group-hover/author:text-brand-400 transition-colors">
              {experience.author.username}
            </div>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Clock size={12} className="mr-1" /> {timeAgo}
              {experience.is_edited && <EditedLabel />}
            </div>
          </div>
        </Link>

        {isOwner && (
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="p-1.5 text-gray-400 hover:text-brand-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Pencil size={16} />
            </button>
            <button
              className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => {
                if (confirm('Delete this experience?')) {
                  deleteExp.mutate(experience.id);
                }
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <Building2 size={14} className="text-gray-500" />
            {experience.company}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <Briefcase size={14} className="text-gray-500" />
            {experience.role}
          </span>
          <span className={cn("inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium ring-1 ring-inset", difficultyStyles[experience.difficulty])}>
            {experience.difficulty.charAt(0).toUpperCase() + experience.difficulty.slice(1)}
          </span>
          <span className={cn("inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium ring-1 ring-inset", resultStyles[experience.result])}>
            {experience.result.charAt(0).toUpperCase() + experience.result.slice(1)}
          </span>
        </div>

        <div className={cn(
          "text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap transition-all duration-300",
          !expanded && isLong && "line-clamp-4 mask-image-bottom"
        )}>
          {experience.description}
        </div>
        
        {isLong && (
          <button
            className="mt-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-1 transition-colors"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>Show less <ChevronUp size={16} /></>
            ) : (
              <>Read more <ChevronDown size={16} /></>
            )}
          </button>
        )}
      </div>

      {/* Card Footer */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-800/50">
        <LikeButton
          liked={experience.liked_by_me}
          count={experience.likes_count}
          onToggle={() => toggleLike.mutate(experience.id)}
          disabled={!isAuthenticated}
        />
        <button
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium text-sm transition-all duration-300",
            showComments ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400" : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          )}
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle size={18} className={showComments ? "fill-current" : ""} />
          <span>{experience.comments_count}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800/50">
          <CommentThread experienceId={experience.id} />
        </div>
      )}
    </article>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}
