import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import type { ExperienceListResponse, ExperienceForm, LikeResponse, Experience } from '../types';

export interface ExperienceFilters {
  search?: string;
  company?: string;
  role?: string;
  difficulty?: string;
  result?: string;
}

export function useExperiences(filters: ExperienceFilters = {}) {
  return useInfiniteQuery<ExperienceListResponse>({
    queryKey: ['experiences', filters],
    queryFn: async ({ pageParam }) => {
      const params: Record<string, string> = {};
      if (pageParam) params.cursor = pageParam as string;
      if (filters.search) params.search = filters.search;
      if (filters.company) params.company = filters.company;
      if (filters.role) params.role = filters.role;
      if (filters.difficulty) params.difficulty = filters.difficulty;
      if (filters.result) params.result = filters.result;
      
      const res = await api.get('/experiences', { params });
      return res.data;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.has_more ? lastPage.next_cursor : undefined,
  });
}

export function useExperience(id: number) {
  return useInfiniteQuery<Experience>({
    queryKey: ['experience', id],
    queryFn: async () => {
      const res = await api.get(`/experiences/${id}`);
      return res.data;
    },
    initialPageParam: null,
    getNextPageParam: () => undefined,
  });
}

export function useCreateExperience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ExperienceForm) => {
      const res = await api.post('/experiences', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
}

export function useUpdateExperience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ExperienceForm> }) => {
      const res = await api.put(`/experiences/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
}

export function useDeleteExperience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/experiences/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (experienceId: number) => {
      const res = await api.post<LikeResponse>(`/experiences/${experienceId}/like`);
      return res.data;
    },
    // Optimistic update
    onMutate: async (experienceId) => {
      await queryClient.cancelQueries({ queryKey: ['experiences'] });

      const previousData = queryClient.getQueriesData({ queryKey: ['experiences'] });

      queryClient.setQueriesData<{ pages: ExperienceListResponse[] }>(
        { queryKey: ['experiences'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((exp) =>
                exp.id === experienceId
                  ? {
                      ...exp,
                      liked_by_me: !exp.liked_by_me,
                      likes_count: exp.liked_by_me
                        ? Math.max(0, exp.likes_count - 1)
                        : exp.likes_count + 1,
                    }
                  : exp
              ),
            })),
          };
        }
      );

      return { previousData };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
}
