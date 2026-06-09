<script setup lang="ts">
import type { ArticleStatus } from '@/types'

defineProps<{ status: ArticleStatus }>()

const labelMap: Record<ArticleStatus, { text: string; type: '' | 'success' | 'warning' | 'info' }> = {
  draft: { text: '草稿', type: 'info' },
  pending: { text: '待审核', type: 'warning' },
  published: { text: '已发布', type: 'success' },
  archived: { text: '已归档', type: 'info' },
}
</script>

<template>
  <el-tag :type="labelMap[status].type" size="small" effect="plain">
    {{ labelMap[status].text }}
  </el-tag>
</template>
