<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/api'
import type { Article, Tag } from '@/types'
import ArticleCard from '@/components/front/ArticleCard.vue'
import { debounce } from '@/utils'

const route = useRoute()
const articles = ref<Article[]>([])
const tags = ref<Tag[]>([])
const loading = ref(true)
const page = ref(1)
const total = ref(0)
const searchQuery = ref('')
const activeTag = ref('')

onMounted(async () => {
  if (route.query.search) searchQuery.value = String(route.query.search)
  await Promise.all([fetchArticles(), fetchTags()])
})

async function fetchArticles() {
  loading.value = true
  try {
    const params: any = { page: page.value, size: 9 }
    if (activeTag.value) params.tag = activeTag.value
    if (searchQuery.value) params.search = searchQuery.value
    const res = await api.getPublicArticles(params)
    articles.value = res.data
  } catch { /* ignore */ }
  loading.value = false
}

async function fetchTags() {
  try {
    const res = await api.getTags()
    tags.value = res.data
  } catch { /* ignore */ }
}

const debouncedSearch = debounce(() => {
  page.value = 1
  fetchArticles()
}, 400)

watch(searchQuery, debouncedSearch)
watch(activeTag, () => { page.value = 1; fetchArticles() })
watch(page, () => fetchArticles())
</script>

<template>
  <div class="home-page">
    <!-- Hero -->
    <section class="hero">
      <h1 class="hero-title">ByteBlog</h1>
      <p class="hero-subtitle">AI 增强的个人博客平台</p>
      <p class="hero-desc">创作、管理、发布 —— 借助 AI 智能摘要与标签推荐，让每一篇文章都更出色</p>
    </section>

    <!-- Filters -->
    <section class="filters">
      <el-input v-model="searchQuery" placeholder="搜索文章..." :prefix-icon="Search" size="large" clearable class="search-input" />
      <div class="tag-filters">
        <el-tag :type="activeTag === '' ? '' : 'info'" effect="plain" class="filter-tag" @click="activeTag = ''"
          :style="activeTag === '' ? 'border-color:#0f3460;color:#0f3460' : ''">
          全部
        </el-tag>
        <el-tag v-for="tag in tags" :key="tag.id" effect="plain" class="filter-tag" @click="activeTag = tag.slug"
          :style="activeTag === tag.slug ? 'border-color:#0f3460;color:#0f3460' : ''">
          {{ tag.name }}
        </el-tag>
      </div>
    </section>

    <!-- Grid -->
    <section class="article-grid" v-loading="loading">
      <template v-if="!loading && articles.length">
        <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
      </template>
      <template v-if="!loading && !articles.length">
        <el-empty description="暂无文章" class="empty-state" />
      </template>
      <template v-if="loading">
        <div v-for="i in 6" :key="i" class="skeleton-card">
          <div class="skeleton skeleton-img"></div>
          <div style="padding:20px">
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text short"></div>
          </div>
        </div>
      </template>
    </section>

    <div v-if="total > 9" class="pagination-wrap">
      <el-pagination v-model:current-page="page" :page-size="9" :total="total" layout="prev, pager, next" background />
    </div>
  </div>
</template>

<style scoped lang="scss">
.home-page {
  max-width: 1000px;
  margin: 0 auto;
}
.hero {
  text-align: center;
  padding: 48px 0 36px;
}
.hero-title {
  font-size: 40px;
  font-weight: 800;
  background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 60%, #e94560 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}
.hero-subtitle {
  font-size: 18px;
  color: #636e72;
  margin-bottom: 12px;
}
.hero-desc {
  font-size: 14px;
  color: #b2bec3;
  max-width: 500px;
  margin: 0 auto;
}
.filters {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}
.search-input {
  max-width: 400px;
}
.tag-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.filter-tag {
  cursor: pointer;
  transition: all 0.15s;
  &:hover { border-color: #0f3460; color: #0f3460; }
}
.article-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.skeleton-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}
.skeleton-img { width: 100%; height: 180px; }
.skeleton-title { width: 80%; height: 20px; margin-bottom: 12px; }
.skeleton-text { width: 100%; height: 14px; margin-bottom: 8px; }
.skeleton-text.short { width: 60%; }
.empty-state { grid-column: 1 / -1; }
.pagination-wrap { display: flex; justify-content: center; margin-top: 36px; }

@media (max-width: 768px) {
  .article-grid { grid-template-columns: 1fr; }
}
@media (max-width: 1024px) and (min-width: 769px) {
  .article-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
