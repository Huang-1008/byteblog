import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import type { TokenResponse, User, Article, Comment, Tag, DashboardStats } from '@/types'

const http = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

// 请求拦截：自动加 Token
http.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

// 响应拦截：401 时自动登出
http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const auth = useAuthStore()
      auth.logout()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

// ========== Auth ==========
export const api = {
  register: (data: { username: string; email: string; password: string }) =>
    http.post<TokenResponse>('/auth/register', data),
  login: (data: { username: string; password: string }) =>
    http.post<TokenResponse>('/auth/login', data),
  getMe: () => http.get<User>('/auth/me'),

  // ========== Articles (Public) ==========
  getPublicArticles: (params?: { page?: number; size?: number; tag?: string; search?: string }) =>
    http.get<Article[]>('/articles', { params }),
  getArticle: (id: number) => http.get<Article>(`/articles/${id}`),

  // ========== Articles (Auth) ==========
  createArticle: (data: { title: string; content_md?: string; summary?: string; cover_url?: string; tag_ids?: number[] }) =>
    http.post<Article>('/articles', data),
  updateArticle: (id: number, data: any) =>
    http.put<Article>(`/articles/${id}`, data),
  changeStatus: (id: number, data: { status: string; review_comment?: string }) =>
    http.patch<Article>(`/articles/${id}/status`, data),
  deleteArticle: (id: number) =>
    http.delete(`/articles/${id}`),
  getMyArticles: (status?: string) =>
    http.get<Article[]>('/articles/my/articles', { params: { status_filter: status || '' } }),

  // ========== Comments ==========
  getComments: (articleId: number) =>
    http.get<Comment[]>(`/comments/articles/${articleId}/comments`),
  createComment: (articleId: number, content: string) =>
    http.post<Comment>(`/comments/articles/${articleId}/comments`, { content }),
  deleteComment: (id: number) =>
    http.delete(`/comments/${id}`),

  // ========== Tags ==========
  getTags: () => http.get<Tag[]>('/tags'),

  // ========== AI ==========
  generateSummary: (content: string) =>
    http.post<{ result: string }>('/ai/generate-summary', { content }),
  suggestTags: (content: string) =>
    http.post<{ result: string }>('/ai/suggest-tags', { content }),

  // ========== Admin ==========
  getDashboard: () => http.get<DashboardStats>('/admin/dashboard'),
  getMyDashboard: () => http.get<any>('/admin/my-dashboard'),
  getPendingArticles: () => http.get<Article[]>('/admin/review/pending'),
  getAllComments: (page = 1) =>
    http.get<any[]>('/admin/comments/all', { params: { page } }),
}
