<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Article } from '@/types'
import { formatDate } from '@/utils'

const props = defineProps<{ article: Article }>()
const router = useRouter()

function goDetail() {
  router.push(`/article/${props.article.id}`)
}
</script>

<template>
  <article class="article-card card-line" @click="goDetail">
    <div v-if="article.cover_url" class="card-cover">
      <img :src="article.cover_url" :alt="article.title" />
    </div>
    <div v-else class="card-cover-placeholder">
      <el-icon :size="40"><Notebook /></el-icon>
    </div>
    <div class="card-body">
      <h3 class="card-title">{{ article.title }}</h3>
      <p v-if="article.summary" class="card-summary">{{ article.summary }}</p>
      <div class="card-meta">
        <span class="meta-author">{{ article.author_name }}</span>
        <span class="meta-date">{{ formatDate(article.published_at || article.created_at) }}</span>
      </div>
      <div v-if="article.tags.length" class="card-tags">
        <el-tag v-for="tag in article.tags" :key="tag.id" size="small" effect="plain" class="tag-item">
          {{ tag.name }}
        </el-tag>
      </div>
    </div>
  </article>
</template>

<style scoped lang="scss">
.article-card {
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  }
}
.card-cover {
  width: 100%;
  height: 180px;
  overflow: hidden;
  img { width: 100%; height: 100%; object-fit: cover; }
}
.card-cover-placeholder {
  width: 100%;
  height: 180px;
  background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.4);
}
.card-body {
  padding: 20px;
}
.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-summary {
  font-size: 14px;
  color: #636e72;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #b2bec3;
  margin-bottom: 10px;
}
.card-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  .tag-item {
    border-color: #e2e8f0;
  }
}
</style>
