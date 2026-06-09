import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ===== 前台 =====
    {
      path: '/',
      component: () => import('@/layouts/FrontLayout.vue'),
      children: [
        { path: '', name: 'home', component: () => import('@/pages/front/HomePage.vue') },
        { path: 'article/:id', name: 'article-detail', component: () => import('@/pages/front/ArticleDetailPage.vue') },
        { path: 'login', name: 'login', component: () => import('@/pages/front/LoginPage.vue'), meta: { guest: true } },
        { path: 'register', name: 'register', component: () => import('@/pages/front/RegisterPage.vue'), meta: { guest: true } },
      ],
    },
    // ===== 后台管理 =====
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'dashboard', component: () => import('@/pages/admin/DashboardPage.vue') },
        { path: 'articles', name: 'article-list', component: () => import('@/pages/admin/ArticleListPage.vue') },
        { path: 'articles/new', name: 'article-new', component: () => import('@/pages/admin/ArticleEditorPage.vue') },
        { path: 'articles/:id/edit', name: 'article-edit', component: () => import('@/pages/admin/ArticleEditorPage.vue') },
        { path: 'review', name: 'review', component: () => import('@/pages/admin/ReviewPage.vue'), meta: { adminOnly: true } },
        { path: 'comments', name: 'comment-manage', component: () => import('@/pages/admin/CommentManagePage.vue'), meta: { adminOnly: true } },
        { path: 'settings', name: 'settings', component: () => import('@/pages/admin/SettingsPage.vue') },
      ],
    },
    // ===== 404 =====
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  auth.loadFromStorage()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return next('/login')
  }
  if (to.meta.adminOnly && !auth.isAdmin) {
    return next('/admin')
  }
  if (to.meta.guest && auth.isLoggedIn) {
    return next('/admin')
  }

  next()
})

export default router
