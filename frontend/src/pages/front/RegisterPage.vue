<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const loading = ref(false)
const form = reactive({ username: '', email: '', password: '', confirmPassword: '' })

async function handleRegister() {
  if (!form.username || !form.email || !form.password) {
    ElMessage.warning('请填写完整信息')
    return
  }
  if (form.password !== form.confirmPassword) {
    ElMessage.warning('两次密码不一致')
    return
  }
  loading.value = true
  try {
    await auth.register({ username: form.username, email: form.email, password: form.password })
    ElMessage.success('注册成功')
    router.push('/admin')
  } catch (err: any) {
    ElMessage.error(err.response?.data?.detail || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-page">
    <div class="register-card card-line">
      <h2 class="register-title">注册 ByteBlog</h2>
      <p class="register-subtitle">开启你的 AI 增强博客之旅</p>
      <el-form @submit.prevent="handleRegister" label-position="top">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" :prefix-icon="User" size="large" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="请输入邮箱" :prefix-icon="Message" size="large" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" :prefix-icon="Lock" show-password size="large" />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入密码" :prefix-icon="Lock" show-password size="large" />
        </el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading" size="large" class="submit-btn">
          注册
        </el-button>
      </el-form>
      <p class="register-footer">
        已有账号？<router-link to="/login">立即登录</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.register-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 140px);
}
.register-card {
  width: 100%;
  max-width: 440px;
  padding: 40px;
}
.register-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
  text-align: center;
  margin-bottom: 6px;
}
.register-subtitle {
  text-align: center;
  color: #b2bec3;
  font-size: 14px;
  margin-bottom: 28px;
}
.submit-btn {
  width: 100%;
  margin-top: 8px;
}
.register-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #636e72;
  a { color: #0f3460; font-weight: 500; }
}
</style>
