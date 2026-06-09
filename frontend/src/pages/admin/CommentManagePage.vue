<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { api } from '@/api'
import { formatDate } from '@/utils'

const comments = ref<any[]>([])
const loading = ref(true)
const page = ref(1)

onMounted(() => fetchComments())

async function fetchComments() {
  loading.value = true
  try { comments.value = (await api.getAllComments(page.value)).data }
  catch { /* ignore */ }
  loading.value = false
}

async function deleteComment(id: number) {
  try {
    await ElMessageBox.confirm('确定删除这条评论？', '确认', { type: 'warning' })
    await api.deleteComment(id)
    ElMessage.success('已删除')
    fetchComments()
  } catch { /* cancel */ }
}
</script>

<template>
  <div class="comment-manage">
    <h2 class="page-title">评论管理</h2>
    <p class="page-desc">管理所有文章的评论</p>

    <el-table :data="comments" v-loading="loading" style="width:100%">
      <el-table-column prop="content" label="评论内容" min-width="260">
        <template #default="{ row }"><span style="color:#2d3436">{{ row.content }}</span></template>
      </el-table-column>
      <el-table-column prop="article_title" label="文章" width="160">
        <template #default="{ row }"><span style="color:#0f3460">{{ row.article_title }}</span></template>
      </el-table-column>
      <el-table-column prop="username" label="用户" width="100" />
      <el-table-column label="时间" width="110">
        <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="80">
        <template #default="{ row }">
          <el-button text type="danger" size="small" @click="deleteComment(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-empty v-if="!loading && !comments.length" description="暂无评论" />
  </div>
</template>

<style scoped lang="scss">
.page-title { font-size: 22px; font-weight: 700; color: #1a1a2e; margin-bottom: 4px; }
.page-desc { color: #b2bec3; font-size: 14px; margin-bottom: 24px; }
</style>
