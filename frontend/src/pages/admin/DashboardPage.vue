<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'
import type { DashboardStats } from '@/types'
import { formatDate } from '@/utils'

const router = useRouter()
const auth = useAuthStore()
const stats = ref<DashboardStats | null>(null)
const myStats = ref<any>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    if (auth.isAdmin) {
      stats.value = (await api.getDashboard()).data
    } else {
      myStats.value = (await api.getMyDashboard()).data
    }
  } catch { /* ignore */ }
  loading.value = false
})
</script>

<template>
  <div class="dashboard" v-loading="loading">
    <h2 class="page-title">仪表盘</h2>
    <p class="page-desc">欢迎回来，{{ auth.user?.username }}</p>

    <!-- 管理员视图 -->
    <template v-if="auth.isAdmin && stats">
      <el-row :gutter="16" class="stats-row">
        <el-col :span="6"><el-card class="stat-card" shadow="never"><div class="stat" style="border-top-color:#0f3460"><p class="stat-num">{{ stats.total_articles }}</p><p class="stat-label">文章总数</p></div></el-card></el-col>
        <el-col :span="6"><el-card class="stat-card" shadow="never"><div class="stat" style="border-top-color:#fdcb6e"><p class="stat-num">{{ stats.pending_count }}</p><p class="stat-label">待审核</p></div></el-card></el-col>
        <el-col :span="6"><el-card class="stat-card" shadow="never"><div class="stat" style="border-top-color:#00b894"><p class="stat-num">{{ stats.published_count }}</p><p class="stat-label">已发布</p></div></el-card></el-col>
        <el-col :span="6"><el-card class="stat-card" shadow="never"><div class="stat" style="border-top-color:#e94560"><p class="stat-num">{{ stats.total_comments }}</p><p class="stat-label">评论总数</p></div></el-card></el-col>
      </el-row>
    </template>

    <!-- 普通用户视图 -->
    <template v-if="!auth.isAdmin && myStats">
      <el-row :gutter="16" class="stats-row">
        <el-col :span="8"><el-card class="stat-card" shadow="never"><div class="stat" style="border-top-color:#0f3460"><p class="stat-num">{{ myStats.total_articles }}</p><p class="stat-label">我的文章</p></div></el-card></el-col>
        <el-col :span="8"><el-card class="stat-card" shadow="never"><div class="stat" style="border-top-color:#00b894"><p class="stat-num">{{ myStats.published_count }}</p><p class="stat-label">已发布</p></div></el-card></el-col>
        <el-col :span="8"><el-card class="stat-card" shadow="never"><div class="stat" style="border-top-color:#fdcb6e"><p class="stat-num">{{ myStats.draft_count }}</p><p class="stat-label">草稿</p></div></el-card></el-col>
      </el-row>

      <!-- 评论通知 -->
      <el-card v-if="myStats.recent_comments && myStats.recent_comments.length" shadow="never" class="comment-notify">
        <template #header><h3><el-icon><Bell /></el-icon> 最新评论通知</h3></template>
        <div v-for="c in myStats.recent_comments" :key="c.id" class="notify-item">
          <span class="notify-user">{{ c.username }}</span>
          评论了你的文章
          <span class="notify-article">《{{ c.article_title }}》</span>：
          <span class="notify-content">"{{ c.content }}"</span>
          <span class="notify-time">{{ formatDate(c.created_at) }}</span>
        </div>
      </el-card>
      <el-empty v-else description="暂无新评论" :image-size="60" />
    </template>

    <!-- 快捷操作 -->
    <el-row :gutter="16" style="margin-top:24px">
      <el-col :span="24">
        <el-card shadow="never" class="actions-card">
          <h3>快捷操作</h3>
          <div class="actions">
            <el-button type="primary" @click="router.push('/admin/articles/new')"><el-icon><EditPen /></el-icon>写文章</el-button>
            <el-button v-if="auth.isAdmin" @click="router.push('/admin/review')"><el-icon><Checked /></el-icon>审核中心</el-button>
            <el-button @click="router.push('/admin/articles')"><el-icon><Document /></el-icon>文章管理</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.page-title { font-size: 22px; font-weight: 700; color: #1a1a2e; margin-bottom: 4px; }
.page-desc { color: #b2bec3; font-size: 14px; margin-bottom: 24px; }
.stat-card { border: 1px solid #e2e8f0 !important; border-radius: 8px !important; }
.stat { text-align: center; padding: 8px 0; border-top: 3px solid; border-radius: 8px 8px 0 0; }
.stat-num { font-size: 32px; font-weight: 700; color: #1a1a2e; margin-bottom: 4px; }
.stat-label { font-size: 13px; color: #b2bec3; }
.actions-card { border: 1px solid #e2e8f0 !important; h3 { margin-bottom: 16px; font-size: 16px; color: #1a1a2e; } }
.actions { display: flex; gap: 12px; flex-wrap: wrap; }
.comment-notify { margin-top: 24px; border: 1px solid #e2e8f0 !important; h3 { display: flex; align-items: center; gap: 6px; font-size: 15px; color: #e94560; } }
.notify-item { padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #2d3436; line-height: 1.8; &:last-child { border-bottom: none; } }
.notify-user { font-weight: 600; color: #0f3460; }
.notify-article { font-weight: 500; }
.notify-content { color: #636e72; }
.notify-time { float: right; font-size: 12px; color: #b2bec3; }
</style>
