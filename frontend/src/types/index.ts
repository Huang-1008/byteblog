// 用户
export interface User {
  id: number
  username: string
  email: string
  avatar: string
  role: 'user' | 'admin'
  created_at: string
}

// 文章
export type ArticleStatus = 'draft' | 'pending' | 'published' | 'archived'

export interface Tag {
  id: number
  name: string
  slug: string
  article_count?: number
}

export interface Article {
  id: number
  title: string
  content_md: string
  content_html: string
  summary: string
  cover_url: string
  status: ArticleStatus
  author_id: number
  author_name: string
  reviewer_id: number | null
  review_comment: string
  published_at: string | null
  created_at: string
  updated_at: string
  tags: Tag[]
}

// 评论
export interface Comment {
  id: number
  content: string
  article_id: number
  user_id: number
  username: string
  created_at: string
}

// 仪表盘
export interface DashboardStats {
  total_articles: number
  draft_count: number
  pending_count: number
  published_count: number
  total_comments: number
  total_users: number
}

// API 响应
export interface TokenResponse {
  access_token: string
  token_type: string
  user: User
}

export interface ApiResponse<T> {
  access_token: string
  token_type: string
  user: User
}
