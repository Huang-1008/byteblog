<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

defineProps<{ collapsed: boolean }>()

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const menuItems = [
  { path: '/admin', title: '仪表盘', icon: 'Odometer' },
  { path: '/admin/articles', title: '文章管理', icon: 'Document' },
  { path: '/admin/articles/new', title: '写文章', icon: 'EditPen' },
]

const adminItems = [
  { path: '/admin/review', title: '审核中心', icon: 'Checked' },
  { path: '/admin/comments', title: '评论管理', icon: 'ChatLineSquare' },
]

function isActive(path: string) {
  if (path === '/admin') return route.path === '/admin'
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="sidebar">
    <div class="sidebar-logo" @click="router.push('/')">
      <el-icon :size="collapsed ? 22 : 24"><EditPen /></el-icon>
      <span v-if="!collapsed" class="logo-text">ByteBlog</span>
    </div>

    <el-menu
      :default-active="route.path"
      :collapse="collapsed"
      background-color="#1a1a2e"
      text-color="rgba(255,255,255,0.65)"
      active-text-color="#ffffff"
      router
      class="sidebar-menu"
    >
      <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
        <el-icon><component :is="item.icon" /></el-icon>
        <span>{{ item.title }}</span>
      </el-menu-item>

      <template v-if="auth.isAdmin">
        <el-menu-item-group title="管理">
          <el-menu-item v-for="item in adminItems" :key="item.path" :index="item.path">
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </el-menu-item>
        </el-menu-item-group>
      </template>

      <el-menu-item index="/admin/settings">
        <el-icon><Setting /></el-icon>
        <span>设置</span>
      </el-menu-item>

      <el-menu-item @click="router.push('/')">
        <el-icon><HomeFilled /></el-icon>
        <span>返回前台</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<style scoped lang="scss">
.sidebar {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  color: #fff;
  cursor: pointer;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  .logo-text {
    font-weight: 700;
    font-size: 18px;
    white-space: nowrap;
  }
}
.sidebar-menu {
  flex: 1;
  border-right: none !important;
  overflow-y: auto;
}
.sidebar-menu .el-menu-item.is-active {
  background: #0f3460 !important;
}
</style>
