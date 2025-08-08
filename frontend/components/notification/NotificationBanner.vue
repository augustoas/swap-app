<template>
  <div class="notification-banner">
    <div class="notification-banner__header" :class="`bg-${getColor}`">
      <div class="notification-banner__icon">
        <v-icon :icon="getNotificationIcon(props.notification)" color="white" size="small"></v-icon>
      </div>
      <div class="notification-banner__title-wrapper">
        <h3 class="notification-banner__title">{{ props.notification.title }}</h3>
        <p class="notification-banner__subtitle">{{ props.notification.subtitle }}</p>
      </div>
      <div class="notification-banner__close">
        <v-btn 
          icon="mdi-close" 
          density="compact" 
          variant="text" 
          size="small" 
          color="white" 
          @click="$emit('deleteNotification', props.notification)"
        ></v-btn>
      </div>
    </div>
    
    <div class="notification-banner__content">
      <p class="notification-banner__message">{{ props.notification.message }}</p>
      
      <div class="notification-banner__actions">
        <v-btn 
          variant="outlined" 
          size="small"
          class="action-btn" 
          @click="$emit('checkResource', props.notification)"
        >
          <v-icon start size="small">mdi-eye</v-icon>
          Ver detalles
        </v-btn>
        <div class="notification-banner__timestamp">
          {{ getFormattedDate(props.notification.createdDate) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type Notification } from '@/types/resource';

const props = defineProps<{
  notification: Notification;
  color: string;
}>();

// Get appropriate color based on notification type
const getColor = computed(() => {
  // Always use the app's dark blue color for consistency
  return 'var(--base-dark-blue)';
});

// Get icon based on notification content
const getNotificationIcon = (notification: Notification) => {
  if (notification.title.toLowerCase().includes('tarea')) {
    return 'mdi-clipboard-check';
  } else if (notification.title.toLowerCase().includes('mensaje')) {
    return 'mdi-message';
  } else if (notification.title.toLowerCase().includes('pago')) {
    return 'mdi-cash';
  }
  return 'mdi-bell';
};

// Format the date for display
const getFormattedDate = (dateValue: Date | string | undefined) => {
  if (!dateValue) return '';
  
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (isNaN(date.getTime())) return '';
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) {
    return 'hace un momento';
  } else if (diffMins < 60) {
    return `hace ${diffMins} min${diffMins > 1 ? 's' : ''}`;
  } else if (diffHours < 24) {
    return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  } else if (diffDays < 7) {
    return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  } else {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
};
</script>

<style lang="scss" scoped>
.notification-banner {
  width: 100%;
  margin: 0.5rem 0 0.75rem 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(42, 43, 71, 0.08);
  transition: all 0.2s ease-in-out;
  background-color: white;
  border: 1px solid rgba(42, 43, 71, 0.08);
  
  &:first-child {
    margin-top: 0;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(42, 43, 71, 0.12);
    border-color: rgba(42, 43, 71, 0.12);
  }
  
  &__header {
    display: flex;
    align-items: center;
    padding: 1rem 1.25rem;
    background-color: var(--base-dark-blue) !important;
    position: relative;
  }
  
  &__icon {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background-color: var(--button-light-blue);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 1rem;
    flex-shrink: 0;
  }
  
  &__title-wrapper {
    flex-grow: 1;
    padding-right: 2.5rem;
  }
  
  &__title {
    color: white;
    font-size: 15px;
    font-weight: 600;
    margin: 0;
    line-height: 1.3;
  }
  
  &__subtitle {
    color: rgba(255, 255, 255, 0.85);
    font-size: 13px;
    margin: 3px 0 0;
    line-height: 1.3;
  }
  
  &__close {
    position: absolute;
    right: 0.5rem;
    top: 0.5rem;
    
    :deep(.v-btn) {
      background-color: rgba(255, 255, 255, 0.1) !important;
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.2) !important;
      }
    }
  }
  
  &__content {
    padding: 1.25rem;
    background-color: white;
  }
  
  &__message {
    font-size: 14px;
    color: var(--base-dark-blue);
    margin: 0 0 1.25rem;
    line-height: 1.5;
    font-weight: 400;
  }
  
  &__actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 0.75rem;
    
    .action-btn {
      border-color: var(--base-dark-blue) !important;
      color: var(--base-dark-blue) !important;
      font-size: 13px;
      font-weight: 500;
      
      &:hover {
        background-color: var(--base-dark-blue) !important;
        color: white !important;
      }
      
      :deep(.v-icon) {
        color: inherit !important;
      }
    }
  }
  
  &__timestamp {
    font-size: 12px;
    color: var(--base-grey);
    text-align: right;
    font-weight: 500;
  }
  
  // All notification types use the app's consistent dark blue color
  .bg-primary,
  .bg-warning,
  .bg-error,
  .bg-success,
  .bg-info,
  .bg-dark-blue {
    background-color: var(--base-dark-blue) !important;
  }
}
</style>