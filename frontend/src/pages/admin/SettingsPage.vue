<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { formatDate } from '@/utils'

const auth = useAuthStore()
const user = auth.user
</script>

<template>
  <div class="settings-page">
    <h2 class="page-title">个人设置</h2>
    <p class="page-desc">查看你的账号信息</p>

    <el-card v-if="user" shadow="never" class="profile-card">
      <div class="profile-header">
        <el-avatar :size="72" icon="UserFilled" />
        <div class="profile-info">
          <h3 class="profile-name">{{ user.username }}</h3>
          <p class="profile-email">{{ user.email }}</p>
          <div class="profile-meta">
            <el-tag :type="user.role === 'admin' ? 'danger' : ''" size="small" effect="plain">
              {{ user.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
            <span class="profile-date">注册于 {{ formatDate(user.created_at) }}</span>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.page-title { font-size: 22px; font-weight: 700; color: #1a1a2e; margin-bottom: 4px; }
.page-desc { color: #b2bec3; font-size: 14px; margin-bottom: 24px; }
.profile-card { border: 1px solid #e2e8f0 !important; max-width: 600px; }
.profile-header { display: flex; align-items: center; gap: 24px; }
.profile-name { font-size: 20px; font-weight: 600; color: #1a1a2e; margin-bottom: 4px; }
.profile-email { color: #636e72; font-size: 14px; margin-bottom: 8px; }
.profile-meta { display: flex; align-items: center; gap: 12px; }
.profile-date { font-size: 13px; color: #b2bec3; }
</style>
