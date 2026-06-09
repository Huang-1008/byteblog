<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { api } from '@/api'

const props = defineProps<{ articleContent: string }>()
const emit = defineEmits<{ summaryGenerated: [summary: string]; tagsSuggested: [tags: string] }>()

const summaryLoading = ref(false)
const tagsLoading = ref(false)

async function handleGenerateSummary() {
  if (!props.articleContent.trim()) {
    ElMessage.warning('请先输入文章内容')
    return
  }
  summaryLoading.value = true
  try {
    const res = await api.generateSummary(props.articleContent)
    emit('summaryGenerated', res.data.result)
    ElMessage.success('摘要生成成功')
  } catch {
    ElMessage.error('AI 摘要生成失败，请重试')
  } finally {
    summaryLoading.value = false
  }
}

async function handleSuggestTags() {
  if (!props.articleContent.trim()) {
    ElMessage.warning('请先输入文章内容')
    return
  }
  tagsLoading.value = true
  try {
    const res = await api.suggestTags(props.articleContent)
    emit('tagsSuggested', res.data.result)
    ElMessage.success('标签推荐完成')
  } catch {
    ElMessage.error('标签推荐失败，请重试')
  } finally {
    tagsLoading.value = false
  }
}
</script>

<template>
  <div class="ai-toolbar">
    <div class="ai-toolbar-title">
      <el-icon><MagicStick /></el-icon>
      <span>AI 助手</span>
    </div>
    <p class="ai-toolbar-desc">基于文章内容，智能生成摘要和推荐标签</p>
    <el-button :loading="summaryLoading" @click="handleGenerateSummary" class="ai-btn" :class="{ 'ai-pulse': summaryLoading }">
      <el-icon v-if="!summaryLoading"><Document /></el-icon>
      AI 生成摘要
    </el-button>
    <el-button :loading="tagsLoading" @click="handleSuggestTags" class="ai-btn" :class="{ 'ai-pulse': tagsLoading }">
      <el-icon v-if="!tagsLoading"><CollectionTag /></el-icon>
      AI 推荐标签
    </el-button>
  </div>
</template>

<style scoped lang="scss">
.ai-toolbar {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
}
.ai-toolbar-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  color: #e94560;
  margin-bottom: 6px;
}
.ai-toolbar-desc {
  font-size: 12px;
  color: #b2bec3;
  margin-bottom: 14px;
}
.ai-btn {
  width: 100%;
  margin-bottom: 8px;
  border: 1px solid #e2e8f0;
  &:last-child { margin-bottom: 0; }
}
</style>
