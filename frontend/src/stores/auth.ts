import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { api } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string>('')

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  function setAuth(t: string, u: User) {
    token.value = t
    user.value = u
    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify(u))
  }

  function loadFromStorage() {
    const t = localStorage.getItem('token')
    const u = localStorage.getItem('user')
    if (t && u) {
      token.value = t
      try { user.value = JSON.parse(u) } catch { logout() }
    }
  }

  async function login(username: string, password: string) {
    const res = await api.login({ username, password })
    setAuth(res.data.access_token, res.data.user)
    return res.data.user
  }

  async function register(data: { username: string; email: string; password: string }) {
    const res = await api.register(data)
    setAuth(res.data.access_token, res.data.user)
    return res.data.user
  }

  function logout() {
    user.value = null
    token.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return { user, token, isLoggedIn, isAdmin, setAuth, loadFromStorage, login, register, logout }
})
