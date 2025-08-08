<template>
  <div class="notification-btn-wrapper">
    <v-btn 
      variant="text" 
      density="comfortable" 
      class="notification-btn"
    >
      <v-badge
        :content="notificationCount"
        :model-value="notificationCount > 0"
        color="error"
        dot-color="error"
        location="top end"
        offset-x="3"
        offset-y="3"
        class="notification-badge"
      >
        <v-icon 
          :color="notificationCount > 0 ? 'var(--button-light-blue)' : 'var(--base-dark-blue)'" 
          :icon="notificationCount > 0 ? 'mdi-bell-ring' : 'mdi-bell-outline'" 
          size="24"
          class="notification-icon"
          :class="{ 'has-notifications': notificationCount > 0 }"
        ></v-icon>
      </v-badge>
    </v-btn>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useNotificationStore } from '@/stores/notificationStore';

const notificationStore = useNotificationStore();

// Reactive properties from the store
const notifications = computed(() => notificationStore.getAllNotification);
const notificationCount = computed(() => notifications.value.length);
</script>

<style lang="scss" scoped>
.notification-btn-wrapper {
  position: relative;
}

.notification-btn {
  position: relative;
  transition: all 0.3s ease;
}

.notification-icon {
  transition: all 0.3s ease;
  
  &.has-notifications {
    animation: pulse 2s infinite;
  }
}

.notification-badge {
  font-size: 12px;
  font-weight: bold;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>
