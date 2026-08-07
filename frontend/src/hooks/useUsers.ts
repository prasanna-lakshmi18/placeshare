import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import api from '../api/client';
import type { ExperienceListResponse, User, UserCommentListResponse } from '../types';

export function useUserProfile(userId: number) {
  return useQuery<User>({
    queryKey: ['user', userId],
    queryFn: async () => {
      const res = await api.get(`/users/${userId}`);
      return res.data;
    },
    enabled: !!userId,
  });
}

export function useUserExperiences(userId: number) {
  return useInfiniteQuery<ExperienceListResponse>({
    queryKey: ['user', userId, 'experiences'],
    queryFn: async ({ pageParam }) => {
      const params: Record<string, string> = {};
      if (pageParam) params.cursor = pageParam as string;
      const res = await api.get(`/users/${userId}/experiences`, { params });
      return res.data;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.has_more ? lastPage.next_cursor : undefined,
    enabled: !!userId,
  });
}

export function useUserComments(userId: number) {
  return useInfiniteQuery<UserCommentListResponse>({
    queryKey: ['user', userId, 'comments'],
    queryFn: async ({ pageParam }) => {
      const params: Record<string, string> = {};
      if (pageParam) params.cursor = pageParam as string;
      const res = await api.get(`/users/${userId}/comments`, { params });
      return res.data;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.has_more ? lastPage.next_cursor : undefined,
    enabled: !!userId,
  });
}

export function useUserLikes(userId: number) {
  return useInfiniteQuery<ExperienceListResponse>({
    queryKey: ['user', userId, 'likes'],
    queryFn: async ({ pageParam }) => {
      const params: Record<string, string> = {};
      if (pageParam) params.cursor = pageParam as string;
      const res = await api.get(`/users/${userId}/likes`, { params });
      return res.data;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.has_more ? lastPage.next_cursor : undefined,
    enabled: !!userId,
  });
}
