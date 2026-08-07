// ─── API Types ───────────────────────────────────────────

export interface User {
  id: number;
  username: string;
  email: string;
  avatar_url: string | null;
  is_verified: boolean;
  created_at: string;
}

export interface Author {
  id: number;
  username: string;
  avatar_url: string | null;
}

export interface Experience {
  id: number;
  company: string;
  role: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  result: 'selected' | 'rejected' | 'pending';
  likes_count: number;
  is_edited: boolean;
  liked_by_me: boolean;
  comments_count: number;
  author: Author;
  created_at: string;
  updated_at: string;
}

export interface ExperienceListResponse {
  items: Experience[];
  next_cursor: string | null;
  has_more: boolean;
}

export interface Comment {
  id: number;
  content: string;
  is_edited: boolean;
  author: Author;
  parent_id: number | null;
  experience_id: number;
  created_at: string;
  updated_at: string;
  children: Comment[];
}

export interface LikeResponse {
  liked: boolean;
  likes_count: number;
}

export interface UserComment {
  id: number;
  content: string;
  is_edited: boolean;
  parent_id: number | null;
  experience_id: number;
  experience_company: string;
  experience_role: string;
  created_at: string;
  updated_at: string;
}

export interface UserCommentListResponse {
  items: UserComment[];
  next_cursor: string | null;
  has_more: boolean;
}

// ─── Form Types ───────────────────────────────────────────

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
}

export interface ExperienceForm {
  company: string;
  role: string;
  description: string;
  difficulty: string;
  result: string;
}

export interface CommentForm {
  content: string;
  parent_id?: number | null;
}
