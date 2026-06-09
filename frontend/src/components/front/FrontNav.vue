<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const auth = useAuthStore()
const searchText = ref('')

function handleLogout() {
  auth.logout()
  ElMessage.success('已退出登录')
  router.push('/')
}

function handleSearch() {
  if (searchText.value.trim()) {
    router.push({ path: '/', query: { search: searchText.value.trim() } })
  }
}
</script>

<template>
  <nav class="front-nav">
    <div class="nav-inner">
      <div class="nav-brand" @click="router.push('/')">
        <el-icon :size="24"><EditPen /></el-icon>
        <span class="brand-text">ByteBlog</span>
      </div>
      <div class="nav-links">
        <el-input
          v-model="searchText"
          placeholder="搜索文章..."
          :prefix-icon="Search"
          size="default"
          class="nav-search"
          @keyup.enter="handleSearch"
        />
        <template v-if="auth.isLoggedIn">
          <el-button text @click="router.push('/admin')">
            <el-icon><Monitor /></el-icon>
            <span style="margin-left:4px">控制台</span>
          </el-button>
          <el-dropdown trigger="click">
            <span class="user-info">
              <el-avatar :size="32" icon="UserFilled" />
              <span class="username">{{ auth.user?.username }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/admin/settings')">设置</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button text @click="router.push('/login')">登录</el-button>
          <el-button type="primary" size="small" @click="router.push('/register')">注册</el-button>
        </template>
      </div>
    </div>
  </nav>
</template>

<style scoped lang="scss">
.front-nav {
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 50;
}
.nav-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 60px;
}
.nav-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #1a1a2e;
  font-weight: 700;
  font-size: 20px;
  &:hover { color: #0f3460; }
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 12px;
}
.nav-search {
  width: 240px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  .username {
    font-size: 14px;
    color: #2d3436;
  }
}
</style>
