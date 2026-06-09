<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { api } from '@/api'
import type { Tag } from '@/types'
import { Editor } from '@bytemd/vue-next'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'
import zhHans from 'bytemd/locales/zh_Hans.json'
import 'bytemd/dist/index.css'
import AiToolbar from '@/components/shared/AiToolbar.vue'

const route = useRoute()
const router = useRouter()
const plugins = [gfm(), highlight()]
const tags = ref<Tag[]>([])
const saving = ref(false)
const submitting = ref(false)
const isEdit = ref(false)
const articleId = ref<number | null>(null)

const form = reactive({
  title: '',
  content_md: '',
  summary: '',
  cover_url: '',
  tag_ids: [] as number[],
})

onMounted(async () => {
  try { tags.value = (await api.getTags()).data } catch { /* ignore */ }
  const id = route.params.id
  if (id) {
    isEdit.value = true
    articleId.value = Number(id)
    try {
      const art = (await api.getArticle(Number(id))).data
      form.title = art.title; form.content_md = art.content_md; form.summary = art.summary
      form.cover_url = art.cover_url; form.tag_ids = art.tags.map(t => t.id)
    } catch { ElMessage.error('文章不存在'); router.push('/admin/articles') }
  }
})

function handleMdChange(v: string) { form.content_md = v }

function handleSummaryGenerated(s: string) { form.summary = s }

function handleTagsSuggested(s: string) {
  const names = s.split(',').map(t => t.trim()).filter(Boolean)
  const matched = tags.value.filter(t => names.some(n => t.name.includes(n) || n.includes(t.name)))
  if (matched.length) {
    form.tag_ids = [...new Set([...form.tag_ids, ...matched.map(t => t.id)])]
  } else {
    ElMessage.info('未匹配到现有标签，请手动选择')
  }
}

async function save(status: 'draft' | 'pending') {
  if (!form.title.trim()) { ElMessage.warning('请输入文章标题'); return }
  const loadingKey = status === 'draft' ? 'saving' : 'submitting'
  const setLoading = (v: boolean) => { if (loadingKey === 'saving') saving.value = v; else submitting.value = v }
  setLoading(true)
  try {
    const payload = { ...form, title: form.title.trim() }
    if (isEdit.value && articleId.value) {
      await api.updateArticle(articleId.value, payload)
      if (status === 'pending') await api.changeStatus(articleId.value, { status: 'pending' })
    } else {
      const res = await api.createArticle(payload)
      articleId.value = res.data.id
      isEdit.value = true
      if (status === 'pending') await api.changeStatus(res.data.id, { status: 'pending' })
    }
    ElMessage.success(status === 'draft' ? '草稿已保存' : '已提交审核')
    router.push('/admin/articles')
  } catch (err: any) { ElMessage.error(err.response?.data?.detail || '保存失败') }
  setLoading(false)
}
</script>

<template>
  <div class="editor-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">{{ isEdit ? '编辑文章' : '写文章' }}</h2>
        <p class="page-desc">使用 Markdown 写作，AI 辅助生成摘要和标签</p>
      </div>
      <div class="header-actions">
        <el-button @click="router.back()">取消</el-button>
        <el-button :loading="saving" @click="save('draft')" plain>保存草稿</el-button>
        <el-button :loading="submitting" type="primary" @click="save('pending')">提交审核</el-button>
      </div>
    </div>

    <div class="editor-layout">
      <div class="editor-main">
        <el-input v-model="form.title" placeholder="文章标题" size="large" class="title-input" />

        <div class="meta-row">
          <el-input v-model="form.summary" placeholder="文章摘要（可让 AI 生成）" />
          <el-input v-model="form.cover_url" placeholder="封面图片 URL（可选）" />
          <el-select v-model="form.tag_ids" multiple filterable placeholder="选择标签" style="width:100%">
            <el-option v-for="tag in tags" :key="tag.id" :label="tag.name" :value="tag.id" />
          </el-select>
        </div>

        <div class="md-editor-wrapper">
          <Editor :value="form.content_md" :plugins="plugins" @change="handleMdChange" :locale="zhHans" />
        </div>
      </div>

      <aside class="editor-sidebar">
        <AiToolbar :article-content="form.content_md" @summary-generated="handleSummaryGenerated" @tags-suggested="handleTagsSuggested" />
      </aside>
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 700; color: #1a1a2e; }
.page-desc { color: #b2bec3; font-size: 14px; }
.header-actions { display: flex; gap: 10px; }
.editor-layout { display: flex; gap: 24px; align-items: flex-start; }
.editor-main { flex: 1; min-width: 0; }
.editor-sidebar { width: 220px; flex-shrink: 0; position: sticky; top: 80px; }
.title-input { margin-bottom: 16px; :deep(.el-input__wrapper) { font-size: 20px; font-weight: 600; } }
.meta-row { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
.md-editor-wrapper { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; min-height: 500px; }
:deep(.bytemd) { height: 550px; border: none; }
</style>
