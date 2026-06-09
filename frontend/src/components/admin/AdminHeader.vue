<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

defineEmits<{ toggle: [] }>()
const auth = useAuthStore()
const router = useRouter()

function handleLogout() {
  auth.logout()
  ElMessage.success('已退出')
  router.push('/')
}
</script>

<template>
  <header class="admin-header">
    <div class="header-left">
      <el-button text @click="$emit('toggle')" class="collapse-btn">
        <el-icon :size="20"><Fold /></el-icon>
      </el-button>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/admin' }">控制台</el-breadcrumb-item>
        <el-breadcrumb-item v-if="$route.meta?.title">{{ $route.meta.title }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="header-right">
      <el-dropdown trigger="click">
        <span class="header-user">
          <el-avatar :size="32" icon="UserFilled" />
          <span>{{ auth.user?.username }}</span>
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="router.push('/')">
              <el-icon><HomeFilled /></el-icon>返回前台
            </el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<style scoped lang="scss">
.admin-header {
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 40;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.collapse-btn {
  padding: 4px;
}
.header-right {
  display: flex;
  align-items: center;
}
.header-user {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #2d3436;
}
</style>
