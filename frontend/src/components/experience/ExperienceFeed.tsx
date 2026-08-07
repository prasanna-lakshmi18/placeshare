import { useEffect, useRef, useCallback } from 'react';
import { useExperiences } from '../../hooks/useExperiences';
import { ExperienceCard } from './ExperienceCard';
import { ExperienceCardSkeleton } from '../ui/SkeletonLoader';
import { Inbox } from 'lucide-react';

import type { ExperienceFilters as FilterType } from '../../hooks/useExperiences';

interface ExperienceFeedProps {
  filters: FilterType;
}

export function ExperienceFeed({ filters }: ExperienceFeedProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useExperiences(filters);

  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  // Cleanup
  useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full">
        {Array.from({ length: 3 }).map((_, i) => (
          <ExperienceCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-100 dark:border-rose-500/20">
        <p className="font-medium">Failed to load experiences: {(error as Error).message}</p>
      </div>
    );
  }

  const experiences = data?.pages.flatMap((page) => page.items) ?? [];

  if (experiences.length === 0) {
    const hasFilters = Object.values(filters).some(v => v);
    return (
      <div className="py-16 flex flex-col items-center justify-center text-center bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 mb-4">
          <Inbox size={32} />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No experiences found</h3>
        <p className="text-gray-500 dark:text-gray-400">
          {hasFilters ? "We couldn't find anything matching your filters." : "Be the first to share your placement journey!"}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {experiences.map((exp, index) => (
        <div
          key={exp.id}
          ref={index === experiences.length - 1 ? lastElementRef : undefined}
        >
          <ExperienceCard experience={exp} />
        </div>
      ))}

      {isFetchingNextPage && (
        <div className="mt-6">
          <ExperienceCardSkeleton />
        </div>
      )}
    </div>
  );
}
