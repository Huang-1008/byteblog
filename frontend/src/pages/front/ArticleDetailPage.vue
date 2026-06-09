<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'
import type { Article, Comment } from '@/types'
import { formatDate } from '@/utils'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const article = ref<Article | null>(null)
const comments = ref<Comment[]>([])
const loading = ref(true)
const newComment = ref('')
const commentLoading = ref(false)

onMounted(async () => {
  try {
    const id = Number(route.params.id)
    const [artRes, comRes] = await Promise.all([api.getArticle(id), api.getComments(id)])
    article.value = artRes.data
    comments.value = comRes.data
  } catch { ElMessage.error('文章不存在'); router.push('/') }
  loading.value = false
})

async function handleComment() {
  if (!newComment.value.trim()) return
  commentLoading.value = true
  try {
    const res = await api.createComment(article.value!.id, newComment.value)
    comments.value.push(res.data)
    newComment.value = ''
    ElMessage.success('评论成功')
  } catch (err: any) {
    ElMessage.error(err.response?.data?.detail || '评论失败')
  }
  commentLoading.value = false
}
</script>

<template>
  <div class="article-page" v-loading="loading">
    <template v-if="article">
      <el-button text @click="router.push('/')" class="back-btn">
        <el-icon><ArrowLeft /></el-icon>返回首页
      </el-button>

      <article class="article-main">
        <header class="article-header">
          <h1 class="article-title">{{ article.title }}</h1>
          <div class="article-meta">
            <span>{{ article.author_name }}</span>
            <span>·</span>
            <span>{{ formatDate(article.published_at || article.created_at) }}</span>
          </div>
          <div class="article-tags" v-if="article.tags.length">
            <el-tag v-for="tag in article.tags" :key="tag.id" size="small" effect="plain">{{ tag.name }}</el-tag>
          </div>
          <div v-if="article.summary" class="article-summary">
            {{ article.summary }}
          </div>
        </header>

        <div class="markdown-body" v-html="article.content_html"></div>
      </article>

      <!-- Comments -->
      <section class="comments-section">
        <h3 class="comments-title">评论 ({{ comments.length }})</h3>
        <div v-if="auth.isLoggedIn" class="comment-form">
          <el-input v-model="newComment" type="textarea" :rows="3" placeholder="写下你的评论..." />
          <el-button type="primary" size="small" :loading="commentLoading" @click="handleComment" class="comment-submit">
            发表评论
          </el-button>
        </div>
        <div v-else class="comment-login-hint">
          请先<router-link to="/login">登录</router-link>后再评论
        </div>
        <div v-if="comments.length" class="comment-list">
          <div v-for="c in comments" :key="c.id" class="comment-item">
            <div class="comment-header">
              <span class="comment-user">{{ c.username }}</span>
              <span class="comment-time">{{ formatDate(c.created_at) }}</span>
            </div>
            <p class="comment-content">{{ c.content }}</p>
          </div>
        </div>
        <el-empty v-else description="暂无评论" :image-size="60" />
      </section>
    </template>
  </div>
</template>

<style scoped lang="scss">
.article-page { max-width: 760px; margin: 0 auto; }
.back-btn { margin-bottom: 20px; }
.article-header { margin-bottom: 32px; }
.article-title { font-size: 32px; font-weight: 700; color: #1a1a2e; line-height: 1.3; margin-bottom: 12px; }
.article-meta { display: flex; gap: 8px; font-size: 14px; color: #b2bec3; margin-bottom: 12px; }
.article-tags { display: flex; gap: 6px; margin-bottom: 16px; }
.article-summary { padding: 16px 20px; background: rgba(15,52,96,0.04); border-left: 3px solid #0f3460; border-radius: 4px; color: #636e72; font-size: 14px; line-height: 1.6; }

.markdown-body {
  :deep(h1), :deep(h2), :deep(h3) { margin-top: 28px; margin-bottom: 16px; font-weight: 600; color: #1a1a2e; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; }
  :deep(h1) { font-size: 26px; }
  :deep(h2) { font-size: 22px; }
  :deep(h3) { font-size: 18px; }
  :deep(p) { margin-bottom: 16px; line-height: 1.8; }
  :deep(code) { background: #1a1a2e; color: #00b894; padding: 2px 6px; border-radius: 4px; font-size: 13px; font-family: 'JetBrains Mono', monospace; }
  :deep(pre) { background: #1a1a2e; color: #dfe6e9; padding: 20px; border-radius: 8px; overflow-x: auto; margin-bottom: 16px; }
  :deep(blockquote) { border-left: 3px solid #0f3460; padding: 8px 16px; margin: 16px 0; color: #636e72; background: rgba(15,52,96,0.03); }
  :deep(img) { max-width: 100%; border-radius: 8px; }
  :deep(table) { width: 100%; border-collapse: collapse; margin-bottom: 16px; th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; } th { background: #f8f9fa; } }
}

.comments-section { margin-top: 48px; padding-top: 32px; border-top: 1px solid #e2e8f0; }
.comments-title { font-size: 18px; font-weight: 600; margin-bottom: 20px; }
.comment-form { margin-bottom: 24px; .comment-submit { margin-top: 10px; } }
.comment-login-hint { text-align: center; padding: 20px; color: #b2bec3; font-size: 14px; a { color: #0f3460; } }
.comment-item { padding: 14px 0; border-bottom: 1px solid #e2e8f0; &:last-child { border-bottom: none; } }
.comment-header { display: flex; justify-content: space-between; margin-bottom: 6px; .comment-user { font-weight: 600; font-size: 14px; } .comment-time { font-size: 12px; color: #b2bec3; } }
.comment-content { font-size: 14px; color: #2d3436; line-height: 1.6; }
</style>
