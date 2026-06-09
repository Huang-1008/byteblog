<script setup lang="ts">
import FrontNav from '@/components/front/FrontNav.vue'
</script>

<template>
  <div class="front-layout">
    <FrontNav />
    <main class="front-main">
      <router-view />
    </main>
    <footer class="front-footer">
      <div class="footer-inner">
        <span>© 2026 ByteBlog · Powered by Vue 3 + FastAPI + DeepSeek</span>
      </div>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.front-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}
.front-main {
  flex: 1;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  padding: 32px 24px;
}
.front-footer {
  border-top: 1px solid #e2e8f0;
  padding: 20px 0;
  text-align: center;
  .footer-inner {
    max-width: 1100px;
    margin: 0 auto;
    font-size: 13px;
    color: #b2bec3;
  }
}
</style>
