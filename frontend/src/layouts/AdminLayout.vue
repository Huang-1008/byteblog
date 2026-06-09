<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'

const collapsed = ref(false)
const sidebarWidth = computed(() => (collapsed.value ? '64px' : '220px'))
</script>

<template>
  <div class="admin-layout">
    <aside class="admin-aside" :style="{ width: sidebarWidth }">
      <AdminSidebar :collapsed="collapsed" />
    </aside>
    <div class="admin-right">
      <AdminHeader @toggle="collapsed = !collapsed" />
      <main class="admin-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped lang="scss">
.admin-layout {
  display: flex;
  min-height: 100vh;
}
.admin-aside {
  background: #1a1a2e;
  transition: width 0.25s ease;
  overflow: hidden;
  flex-shrink: 0;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
}
.admin-right {
  flex: 1;
  margin-left: v-bind(sidebarWidth);
  transition: margin-left 0.25s ease;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.admin-main {
  flex: 1;
  padding: 24px;
  background: #f8f9fa;
  min-height: 0;
}
</style>
