<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import { onMounted } from 'vue';

// Only run on client-side
const isClient = process.client;

onMounted(() => {
  // Skip if not running on client
  if (!isClient) return;
  
  const navigationStore = useNavigationStore();
  const userStore = useUserStore();
  
  // Initialize view mode settings on app load
  navigationStore.initializeViewMode();
  
  // Default to client mode if user is not a swapper
  if (userStore.isLoggedIn() && !userStore.user.isSwapper) {
    navigationStore.setViewMode('client');
  }
});
</script>
