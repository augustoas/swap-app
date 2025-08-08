<template>
  <v-card class="modal-card" max-width="600">
    <h1 class="modal-title">{{ title }}</h1>
    <p class="modal-message">{{ message }}</p>

    <!-- Optional message input slot -->
    <div class="message-input-container">
      <slot name="message-input"></slot>
    </div>

    <!-- Optional terms link slot -->
    <div class="terms-link-container">
      <slot name="terms-link"></slot>
    </div>
    
    <v-card-text>
      <div class="modal-buttons">
        <div v-if="isLoading" class="loading-spinner">
          <v-progress-circular indeterminate color="var(--base-light-blue)"></v-progress-circular>
        </div>
        <div v-else class="button-container">
          <BaseButton
            v-if="showDecline" 
            color="var(--base-dark-blue)"
            text-color="white"
            :text="declineText"
            secondary
            @click="handleDecline"
          />
          <BaseButton
            v-if="showAccept"
            color="var(--base-dark-blue)"
            text-color="white"
            :text="acceptText"
            @click="handleAccept"
          />
        </div>
      </div>
      
    </v-card-text>

    
  </v-card>
</template>

<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  showAccept: {
    type: Boolean,
    default: true
  },
  showDecline: {
    type: Boolean,
    default: true
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  acceptText: {
    type: String,
    default: 'Aceptar'
  },
  declineText: {
    type: String,
    default: 'Cancelar'
  }
});

const emit = defineEmits(['accept', 'decline']);

const handleAccept = () => {
  emit('accept');
};

const handleDecline = () => {
  emit('decline');
};
</script>

<style scoped>
.modal-card {
  padding: 20px;
  background-color: white;
}

.modal-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: var(--base-dark-blue);
  text-align: center;
}

.modal-message {
  font-size: 16px;
  color: var(--base-dark-blue);
  text-align: left;
}

.message-input-container {
  margin-top: 20px;
}

.terms-link-container {
  margin-top: 20px;
  font-size: 12px;
  color: var(--base-dark-blue);
}

.terms-link-container :deep(a) {
  color: var(--base-light-blue);
  text-decoration: underline;
}

.modal-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
}

.button-container {
  display: flex;
  gap: 10px;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50px;
}
</style>
