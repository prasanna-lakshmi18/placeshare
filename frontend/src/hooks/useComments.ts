import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import type { Comment, CommentForm } from '../types';
import { useAuth } from '../context/AuthContext';

export function useComments(experienceId: number) {
  return useQuery<Comment[]>({
    queryKey: ['comments', experienceId],
    queryFn: async () => {
      const res = await api.get(`/experiences/${experienceId}/comments`);
      return res.data;
    },
  });
}

export function useCreateComment(experienceId: number) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CommentForm) => {
      const res = await api.post(`/experiences/${experienceId}/comments`, data);
      return res.data;
    },
    // Optimistic update for instant feel
    onMutate: async (newComment) => {
      await queryClient.cancelQueries({ queryKey: ['comments', experienceId] });
      const previous = queryClient.getQueryData<Comment[]>(['comments', experienceId]);

      const optimistic: Comment = {
        id: Date.now(), // temp id
        content: newComment.content,
        is_edited: false,
        author: {
          id: user?.id ?? 0,
          username: user?.username ?? 'Anonymous',
          avatar_url: user?.avatar_url ?? null,
        },
        parent_id: newComment.parent_id ?? null,
        experience_id: experienceId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        children: [],
      };

      queryClient.setQueryData<Comment[]>(['comments', experienceId], (old) => {
        if (!old) return [optimistic];
        if (newComment.parent_id) {
          // Add as child — rebuild tree
          return addChildToTree(old, newComment.parent_id, optimistic);
        }
        return [...old, { ...optimistic, children: [] }];
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['comments', experienceId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', experienceId] });
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
}

export function useUpdateComment(experienceId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ commentId, content }: { commentId: number; content: string }) => {
      const res = await api.put(`/experiences/${experienceId}/comments/${commentId}`, { content });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', experienceId] });
    },
  });
}

export function useDeleteComment(experienceId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (commentId: number) => {
      await api.delete(`/experiences/${experienceId}/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', experienceId] });
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
}

// Helper: recursively add a child comment into the tree
function addChildToTree(comments: Comment[], parentId: number, child: Comment): Comment[] {
  return comments.map((c) => {
    if (c.id === parentId) {
      return { ...c, children: [...(c.children || []), child] };
    }
    if (c.children?.length) {
      return { ...c, children: addChildToTree(c.children, parentId, child) };
    }
    return c;
  });
}
