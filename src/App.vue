<script setup>
import NavBar from "@/components/NavBar.vue";
</script>

<template>
  <div class="app-container">
    <NavBar />
    <div class="view-container">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
}

.view-container {
  width: 100%;
  height: 100%;
  overflow: auto;
}
</style>
