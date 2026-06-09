<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { api } from '@/api'
import type { Article } from '@/types'
import { formatDate } from '@/utils'

const articles = ref<Article[]>([])
const loading = ref(true)
const rejectVisible = ref(false)
const rejectComment = ref('')
const rejectId = ref<number | null>(null)

onMounted(async () => {
  try { articles.value = (await api.getPendingArticles()).data }
  catch { /* ignore */ }
  loading.value = false
})

async function approve(id: number) {
  try {
    await ElMessageBox.confirm('确认通过这篇审核？', '审核通过', { type: 'success' })
    await api.changeStatus(id, { status: 'published' })
    articles.value = articles.value.filter(a => a.id !== id)
    ElMessage.success('文章已发布')
  } catch { /* cancel */ }
}

function openReject(id: number) { rejectId.value = id; rejectComment.value = ''; rejectVisible.value = true }

async function confirmReject() {
  if (!rejectId.value) return
  try {
    await api.changeStatus(rejectId.value, { status: 'draft', review_comment: rejectComment.value })
    articles.value = articles.value.filter(a => a.id !== rejectId.value)
    ElMessage.success('已驳回')
  } catch (err: any) { ElMessage.error(err.response?.data?.detail || '操作失败') }
  rejectVisible.value = false
}
</script>

<template>
  <div class="review-page" v-loading="loading">
    <h2 class="page-title">审核中心</h2>
    <p class="page-desc">审核用户提交的文章</p>

    <div v-if="!loading && !articles.length" class="empty-wrap"><el-empty description="暂无待审核文章" /></div>

    <div class="review-list">
      <div v-for="art in articles" :key="art.id" class="review-card card-line">
        <div class="review-content">
          <h3 class="review-title">{{ art.title }}</h3>
          <div class="review-meta">
            <span>作者：{{ art.author_name }}</span>
            <span>提交时间：{{ formatDate(art.updated_at) }}</span>
          </div>
          <p v-if="art.summary" class="review-summary">{{ art.summary }}</p>
        </div>
        <div class="review-actions">
          <el-button type="success" @click="approve(art.id)" plain>
            <el-icon><Check /></el-icon>通过
          </el-button>
          <el-button type="danger" @click="openReject(art.id)" plain>
            <el-icon><Close /></el-icon>驳回
          </el-button>
        </div>
      </div>
    </div>

    <el-dialog v-model="rejectVisible" title="驳回理由" width="440px">
      <el-input v-model="rejectComment" type="textarea" :rows="4" placeholder="请输入驳回理由（可选）" />
      <template #footer>
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmReject">确认驳回</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.page-title { font-size: 22px; font-weight: 700; color: #1a1a2e; margin-bottom: 4px; }
.page-desc { color: #b2bec3; font-size: 14px; margin-bottom: 24px; }
.empty-wrap { padding: 60px 0; }
.review-list { display: flex; flex-direction: column; gap: 16px; }
.review-card { padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; gap: 24px; }
.review-content { flex: 1; min-width: 0; }
.review-title { font-size: 16px; font-weight: 600; color: #1a1a2e; margin-bottom: 8px; }
.review-meta { display: flex; gap: 20px; font-size: 13px; color: #b2bec3; margin-bottom: 8px; }
.review-summary { font-size: 14px; color: #636e72; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.review-actions { display: flex; gap: 10px; flex-shrink: 0; }
</style>
