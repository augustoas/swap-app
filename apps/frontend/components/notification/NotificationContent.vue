<template>
  <div class="notification-panel" :class="{ 'fullscreen': props.isFullscreen }">
    <div class="notification-panel__header">
      <div class="notification-panel__header-content">
        <div class="notification-panel__title">
          <v-icon icon="mdi-bell-outline" color="white" class="bell-icon" />
          <span class="title-text">Notificaciones</span>
          <div class="count-badge" v-if="notifications.length > 0">
            {{ notifications.length }}
          </div>
        </div>
        <div class="notification-panel__actions">
          <v-btn 
            variant="text" 
            icon="mdi-refresh" 
            color="white" 
            density="comfortable" 
            size="small" 
            class="action-btn"
            :disabled="notifications.length === 0"
          >
            <v-tooltip activator="parent" location="bottom">Refrescar</v-tooltip>
          </v-btn>
          <v-btn 
            variant="text" 
            :icon="props.isFullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'" 
            color="white" 
            density="comfortable" 
            size="small" 
            class="action-btn"
            @click="$emit('toggleFullScreen')"
          >
            <v-tooltip activator="parent" location="bottom">{{ props.isFullscreen ? 'Minimizar' : 'Maximizar' }}</v-tooltip>
          </v-btn>
          <v-btn 
            variant="text" 
            icon="mdi-close" 
            color="white" 
            density="comfortable" 
            size="small" 
            class="action-btn"
            @click="$emit('close')"
          >
            <v-tooltip activator="parent" location="bottom">Cerrar</v-tooltip>
          </v-btn>
        </div>
      </div>
    </div>
    
    <div class="notification-panel__content">
      <div v-if="notifications.length > 0" class="notification-panel__list">
        <NotificationBanner 
          v-for="notification in notifications"
          :key="notification.id"
          :notification="notification"
          color="dark-blue"
          @checkResource="handleCheckResource"
          @deleteNotification="handleDeleteNotification"
        />
      </div>
      <div v-else class="notification-panel__empty">
        <div class="empty-icon-container">
          <v-icon icon="mdi-bell-off-outline" size="x-large" color="var(--base-light-blue)" />
        </div>
        <p class="empty-text">No tienes notificaciones</p>
        <p class="empty-subtext">Aquí aparecerán mensajes importantes sobre tus tareas</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type Notification } from '@/types/resource';
import NotificationRepository from '@/repositories/notificationRepository';

const { $api } = useNuxtApp();
const notificationResource = new NotificationRepository($api);

const notificationStore = useNotificationStore();
const notifications = computed(() => notificationStore.getAllNotification);

const props = defineProps<{
  isFullscreen: boolean;
}>();

const handleCheckResource = (notification: Notification) => {
  console.log('Checking resource for notification:', notification);
};

const handleDeleteNotification = async (notification: Notification) => {
  try {
    const response = await notificationResource.delete(notification.id.toString());
    notificationStore.removeNotificationById(notification.id);
  } catch (error) {
    console.error('Error deleting notification:', error);
  }
};
</script>

<style lang="scss" scoped>
.notification-panel {
  display: flex;
  flex-direction: column;
  width: 400px;
  max-width: 90vw;
  max-height: 80vh;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.08);
  
  &.fullscreen {
    width: 100%;
    height: 100%;
    max-width: 100vw;
    max-height: 100vh;
    border-radius: 0;
  }
  
  &__header {
    background: var(--base-dark-blue);
    padding: 1rem 1.5rem;
    position: relative;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  &__header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  &__title {
    display: flex;
    align-items: center;
    color: white;
    font-size: 18px;
    font-weight: 600;
    gap: 12px;
    
    .bell-icon {
      font-size: 20px;
    }
    
    .title-text {
      flex: 1;
    }
    
    .count-badge {
      background: var(--button-light-blue);
      color: white;
      border-radius: 12px;
      padding: 4px 8px;
      font-size: 12px;
      font-weight: 700;
      min-width: 20px;
      text-align: center;
      line-height: 1;
    }
  }
  
  &__actions {
    display: flex;
    align-items: center;
    
    .action-btn {
      margin-left: 4px;
    }
  }
  
  &__content {
    background-color: #fafafa;
    flex-grow: 1;
    overflow-y: auto;
    padding: 1rem;
    height: 400px;
    
    .fullscreen & {
      height: calc(100vh - 80px);
    }
  }
  
  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 3rem 2rem;
    text-align: center;
    
    .empty-icon-container {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background-color: rgba(37, 206, 245, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
    }
    
    .empty-text {
      font-size: 16px;
      font-weight: 600;
      color: var(--base-dark-blue);
      margin: 0 0 0.5rem;
    }
    
    .empty-subtext {
      font-size: 14px;
      color: var(--base-grey);
      margin: 0;
      max-width: 280px;
      line-height: 1.4;
    }
  }
}

// Responsive adjustments
@media (max-width: 600px) {
  .notification-panel {
    width: 100%;
    max-width: 100vw;
    height: 100%;
    max-height: 100vh;
    border-radius: 0;
  }
}
</style>
