<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'
import type { Article, ArticleStatus } from '@/types'
import { formatDate } from '@/utils'
import StatusBadge from '@/components/shared/StatusBadge.vue'

const router = useRouter()
const auth = useAuthStore()
const articles = ref<Article[]>([])
const loading = ref(true)
const statusFilter = ref('')

onMounted(() => fetchArticles())
watch(statusFilter, () => fetchArticles())

async function fetchArticles() {
  loading.value = true
  try { articles.value = (await api.getMyArticles(statusFilter.value || undefined)).data }
  catch { /* ignore */ }
  loading.value = false
}

async function submitReview(id: number) {
  try {
    await api.changeStatus(id, { status: 'pending' })
    ElMessage.success('已提交审核')
    fetchArticles()
  } catch (err: any) { ElMessage.error(err.response?.data?.detail || '操作失败') }
}

async function archiveArticle(id: number) {
  try {
    await api.changeStatus(id, { status: 'archived' })
    ElMessage.success('已归档')
    fetchArticles()
  } catch (err: any) { ElMessage.error(err.response?.data?.detail || '操作失败') }
}

async function deleteArticle(id: number) {
  try {
    await ElMessageBox.confirm('确定要删除这篇文章吗？', '确认删除', { type: 'warning' })
    await api.deleteArticle(id)
    ElMessage.success('已删除')
    fetchArticles()
  } catch { /* cancelled */ }
}
</script>

<template>
  <div class="article-list">
    <div class="page-header">
      <div><h2 class="page-title">文章管理</h2><p class="page-desc">管理你的所有文章</p></div>
      <el-button type="primary" @click="router.push('/admin/articles/new')"><el-icon><EditPen /></el-icon>写文章</el-button>
    </div>

    <el-radio-group v-model="statusFilter" class="status-filter" size="small">
      <el-radio-button value="">全部</el-radio-button>
      <el-radio-button value="draft">草稿</el-radio-button>
      <el-radio-button value="pending">待审核</el-radio-button>
      <el-radio-button value="published">已发布</el-radio-button>
      <el-radio-button value="archived">已归档</el-radio-button>
    </el-radio-group>

    <el-table :data="articles" v-loading="loading" style="width:100%" class="article-table">
      <el-table-column prop="title" label="标题" min-width="200">
        <template #default="{ row }"><span class="table-title" style="cursor:pointer;color:#0f3460" @click="router.push(`/article/${row.id}`)">{{ row.title }}</span></template>
      </el-table-column>
      <el-table-column v-if="auth.isAdmin" prop="author_name" label="作者" width="120" />
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-tooltip v-if="row.review_comment" :content="row.review_comment" placement="top">
            <StatusBadge :status="row.status" />
          </el-tooltip>
          <StatusBadge v-else :status="row.status" />
        </template>
      </el-table-column>
      <el-table-column label="标签" width="180">
        <template #default="{ row }">
          <el-tag v-for="tag in row.tags" :key="tag.id" size="small" effect="plain" style="margin-right:4px">{{ tag.name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="120">
        <template #default="{ row }">{{ formatDate(row.updated_at) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button text type="primary" size="small" @click="router.push(`/article/${row.id}`)">查看</el-button>
          <el-button v-if="row.status === 'draft' || row.status === 'published'" text type="primary" size="small" @click="router.push(`/admin/articles/${row.id}/edit`)">编辑</el-button>
          <el-button v-if="row.status === 'draft'" text type="warning" size="small" @click="submitReview(row.id)">提交审核</el-button>
          <el-button v-if="row.status === 'published'" text size="small" @click="archiveArticle(row.id)">归档</el-button>
          <el-button v-if="row.status === 'draft' || row.status === 'published'" text type="danger" size="small" @click="deleteArticle(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-empty v-if="!loading && !articles.length" description="暂无文章" />
  </div>
</template>

<style scoped lang="scss">
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.page-title { font-size: 22px; font-weight: 700; color: #1a1a2e; }
.page-desc { color: #b2bec3; font-size: 14px; }
.status-filter { margin-bottom: 20px; }
.table-title { font-weight: 500; color: #1a1a2e; }
</style>
