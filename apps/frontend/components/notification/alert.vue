<template>
  <v-snackbar
    v-model="isVisible"
    :color="backgroundColor"
    :timeout="timeout"
    :location="props.location"
    class="custom-alert"
    rounded="lg"
    elevation="4"
    transition="slide-y-transition"
  >
    <div class="alert-content">
      <div class="alert-icon-wrapper">
        <v-icon :icon="getIcon" :color="iconColor" size="small"></v-icon>
      </div>
      <div class="alert-text">
        <p class="alert-title">{{ getTitle }}</p>
        <div class="alert-message">
          <ul v-if="Array.isArray(props.message)">
            <li v-for="(msg, index) in props.message" :key="index">{{ msg }}</li>
          </ul>
          <p v-else>{{ props.message }}</p>
        </div>
      </div>
      <div class="alert-close">
        <v-btn
          variant="text"
          density="compact"
          icon="mdi-close"
          size="x-small"
          @click="isVisible = false"
          color="white"
        ></v-btn>
      </div>
    </div>
  </v-snackbar>
</template>

<script lang="ts" setup>
defineOptions({
  name: 'NotificationAlert'
});

interface AlertProps {
  type: string,
  message: string | string[],
  color: string,
  icon: string,
  title: string,
  location: "top" | "bottom" | "center",
  modelValue?: boolean
}

const props = withDefaults(defineProps<AlertProps>(), {
  modelValue: undefined
});

const emit = defineEmits(['update:modelValue']);

// Control visibility with v-model
const isVisible = computed({
  get: () => props.modelValue !== undefined ? props.modelValue : true,
  set: (value) => emit('update:modelValue', value)
});

// Set a timeout for the alert
const timeout = 5000;

// Compute the background color
const backgroundColor = computed(() => {
  if (props.color) return props.color;
  
  switch (props.type) {
    case 'success': return 'var(--button-light-blue)';
    case 'error': return '#FF5252';
    case 'warning': return '#FB8C00';
    case 'info': return '#2196F3';
    default: return 'var(--base-dark-blue)';
  }
});

// Compute the icon color
const iconColor = computed(() => 'white');

// Get appropriate icon
const getIcon = computed(() => {
  switch (props.type) {
    case 'success': return 'mdi-check-circle';
    case 'error': return 'mdi-alert-circle';
    case 'warning': return 'mdi-alert';
    case 'info': return 'mdi-information';
    default: return 'mdi-bell';
  }
});

// Get appropriate title
const getTitle = computed(() => {
  if (props.title) return props.title;
  
  switch (props.type) {
    case 'success': return 'Éxito';
    case 'error': return 'Error';
    case 'warning': return 'Advertencia';
    case 'info': return 'Información';
    default: return 'Notificación';
  }
});
</script>

<style lang="scss" scoped>
.custom-alert {
  max-width: 400px;
  min-width: 320px;
  
  :deep(.v-snackbar__wrapper) {
    border-radius: 8px;
    padding: 0;
    position: fixed !important;
    left: 50% !important;
    right: auto !important;
    transform: translateX(-50%) !important;
    margin: 0 !important;
  }
  
  :deep(.v-snackbar__content) {
    padding: 0;
    min-height: auto;
  }
}

.alert-content {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  position: relative;
}

.alert-icon-wrapper {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.alert-text {
  flex-grow: 1;
  padding-right: 20px;
}

.alert-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px;
  color: white;
  line-height: 1.2;
}

.alert-message {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
  
  p, ul {
    margin: 0;
    padding: 0;
  }
  
  ul {
    list-style-position: inside;
    padding-left: 4px;
  }
  
  li {
    margin-bottom: 2px;
  }
}

.alert-close {
  position: absolute;
  top: 8px;
  right: 8px;
}

@media (max-width: 600px) {
  .custom-alert {
    max-width: 90%;
    min-width: 280px;
    
    :deep(.v-snackbar__wrapper) {
      position: fixed !important;
      left: 50% !important;
      right: auto !important;
      transform: translateX(-50%) !important;
      margin: 0 !important;
    }
  }
}

/* Global override for this specific snackbar */
:global(.v-overlay-container .v-snackbar.custom-alert .v-snackbar__wrapper) {
  left: 50% !important;
  right: auto !important;
  transform: translateX(-50%) !important;
  margin: 0 !important;
}
</style>