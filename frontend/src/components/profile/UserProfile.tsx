import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUserProfile, useUserExperiences, useUserComments, useUserLikes } from '../../hooks/useUsers';
import { ExperienceCard } from '../experience/ExperienceCard';
import { ProfileCommentCard } from './ProfileCommentCard';
import { ExperienceCardSkeleton } from '../ui/SkeletonLoader';
import { User, Mail, Calendar, ArrowLeft, PenTool, MessageSquare, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type TabType = 'posts' | 'comments' | 'likes';

export function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const userId = id ? parseInt(id, 10) : 0;
  
  const [activeTab, setActiveTab] = useState<TabType>('posts');

  const { data: user, isLoading: isUserLoading, isError: isUserError } = useUserProfile(userId);
  
  const { 
    data: experiences, 
    isLoading: isExperiencesLoading, 
    fetchNextPage: fetchExperiences, 
    hasNextPage: hasMoreExperiences, 
    isFetchingNextPage: fetchingMoreExperiences
  } = useUserExperiences(userId);

  const { 
    data: comments, 
    isLoading: isCommentsLoading, 
    fetchNextPage: fetchComments, 
    hasNextPage: hasMoreComments, 
    isFetchingNextPage: fetchingMoreComments
  } = useUserComments(userId);

  const { 
    data: likes, 
    isLoading: isLikesLoading, 
    fetchNextPage: fetchLikes, 
    hasNextPage: hasMoreLikes, 
    isFetchingNextPage: fetchingMoreLikes
  } = useUserLikes(userId);

  if (isUserLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 animate-pulse">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 mb-8 border border-gray-200 dark:border-gray-800 flex items-center gap-6">
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
          <div className="space-y-4 flex-1">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isUserError || !user) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-rose-500">
        <p>User not found.</p>
      </div>
    );
  }

  const userExps = experiences?.pages.flatMap((page) => page.items) ?? [];
  const userComms = comments?.pages.flatMap((page) => page.items) ?? [];
  const userLks = likes?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Link to="/" className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-medium mb-6 transition-colors">
        <ArrowLeft size={20} /> Back to Feed
      </Link>

      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 mb-8 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        <div className="w-24 h-24 bg-gradient-to-br from-brand-100 to-purple-100 dark:from-brand-900/40 dark:to-purple-900/40 rounded-full flex items-center justify-center text-brand-600 dark:text-brand-400 flex-shrink-0 ring-4 ring-white dark:ring-gray-900 shadow-lg">
          {user.avatar_url ? (
             <img src={user.avatar_url} alt={user.username} className="w-full h-full rounded-full object-cover" />
          ) : (
            <User size={40} strokeWidth={1.5} />
          )}
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{user.username}</h1>
          <div className="flex flex-col md:flex-row gap-3 md:gap-6 text-gray-500 dark:text-gray-400 items-center md:items-start text-sm">
            <span className="flex items-center gap-1.5"><Mail size={16} /> {user.email}</span>
            <span className="flex items-center gap-1.5"><Calendar size={16} /> Joined {formatDistanceToNow(new Date(user.created_at))} ago</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200 dark:border-gray-800 pb-px">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'posts' 
              ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <PenTool size={18} /> Posts
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'comments' 
              ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <MessageSquare size={18} /> Comments
        </button>
        <button
          onClick={() => setActiveTab('likes')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'likes' 
              ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Heart size={18} /> Likes
        </button>
      </div>
      
      <div className="space-y-6">
        {/* Posts Tab */}
        {activeTab === 'posts' && (
          isExperiencesLoading ? (
            <><ExperienceCardSkeleton /><ExperienceCardSkeleton /></>
          ) : userExps.length > 0 ? (
            <>
              {userExps.map((exp) => (
                <ExperienceCard key={`post-${exp.id}`} experience={exp} />
              ))}
              {hasMoreExperiences && (
                <button onClick={() => fetchExperiences()} disabled={fetchingMoreExperiences} className="w-full py-4 text-brand-600 dark:text-brand-400 font-medium hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-2xl transition-colors">
                  {fetchingMoreExperiences ? 'Loading more...' : 'Load More'}
                </button>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 text-gray-500">
              This user hasn't shared any experiences yet.
            </div>
          )
        )}

        {/* Comments Tab */}
        {activeTab === 'comments' && (
          isCommentsLoading ? (
            <><ExperienceCardSkeleton /><ExperienceCardSkeleton /></>
          ) : userComms.length > 0 ? (
            <>
              {userComms.map((comm) => (
                <ProfileCommentCard key={`comm-${comm.id}`} comment={comm} />
              ))}
              {hasMoreComments && (
                <button onClick={() => fetchComments()} disabled={fetchingMoreComments} className="w-full py-4 text-brand-600 dark:text-brand-400 font-medium hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-2xl transition-colors">
                  {fetchingMoreComments ? 'Loading more...' : 'Load More'}
                </button>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 text-gray-500">
              This user hasn't made any comments yet.
            </div>
          )
        )}

        {/* Likes Tab */}
        {activeTab === 'likes' && (
          isLikesLoading ? (
            <><ExperienceCardSkeleton /><ExperienceCardSkeleton /></>
          ) : userLks.length > 0 ? (
            <>
              {userLks.map((exp) => (
                <ExperienceCard key={`like-${exp.id}`} experience={exp} />
              ))}
              {hasMoreLikes && (
                <button onClick={() => fetchLikes()} disabled={fetchingMoreLikes} className="w-full py-4 text-brand-600 dark:text-brand-400 font-medium hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-2xl transition-colors">
                  {fetchingMoreLikes ? 'Loading more...' : 'Load More'}
                </button>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 text-gray-500">
              This user hasn't liked any experiences yet.
            </div>
          )
        )}
      </div>
    </div>
  );
}
