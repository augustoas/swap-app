<template>
  <div>
    <div class="mode-switch-container">
      <span class="mode-label" :class="{ 'active': !localSwapperMode }">Cliente</span>
      <v-switch
        v-model="localSwapperMode"
        base-color="var(--base-dark-blue)"
        color="var(--base-light-blue)"
        hide-details
        density="compact"
      ></v-switch>
      <span class="mode-label" :class="{ 'active': localSwapperMode }">Swapper</span>
    </div>

    <!-- Modal for non-swappers -->
    <v-dialog v-model="showModal" width="auto" persistent>
      <BaseModal
        title="Acceso Swapper"
        message="Para activar el modo Swapper, primero debes validarte como swapper"
        accept-text="Postulación"
        decline-text="No, gracias"
        @accept="goToSwapperApplication"
        @decline="cancelSwapperMode"
      />
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import BaseModal from '~/components/base/modal.vue';

const router = useRouter();
const navigationStore = useNavigationStore();
const { isSwapper, isSwapperMode } = useSwapperView();

// Local state for the switch that can be manipulated temporarily
const localSwapperMode = ref(isSwapperMode.value);
const showModal = ref(false);

// Watch for changes from the store
watch(isSwapperMode, (newValue) => {
  localSwapperMode.value = newValue;
});

// Watch local switch changes and handle non-swapper case
watch(localSwapperMode, (newValue) => {
  if (newValue && !isSwapper.value) {
    // If trying to switch to swapper mode but not a swapper, show modal
    showModal.value = true;
    // Wait a moment before reverting the switch back to make it look like it tried to toggle
    setTimeout(() => {
      localSwapperMode.value = false;
    }, 700);
  } else if (isSwapper.value) {
    // If is a swapper, update the real mode
    navigationStore.setViewMode(newValue ? 'swapper' : 'client');
  }
});

// Function to cancel and close the modal
const cancelSwapperMode = () => {
  showModal.value = false;
  localSwapperMode.value = false;
};

// Function to navigate to swapper application
const goToSwapperApplication = () => {
  showModal.value = false;
  router.push('/profile/newswapper');
};
</script>

<style lang="scss" scoped>
.mode-switch-container {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  border-radius: 20px;
  padding: 2px 10px;
  gap: 8px;
  transition: all 0.2s ease;
  border: 1px solid #f0f0f0;
  
  &:hover {
    background-color: #f9f9f9;
  }
}

.mode-label {
  font-size: 12px;
  color: var(--base-dark-blue);
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s ease;
  
  &.active {
    color: var(--base-dark-blue);
    font-weight: 600;
  }
}

:deep(.v-switch) {
  margin: 0;
}

:deep(.v-switch__track) {
  opacity: 1 !important;
}

:deep(.v-switch__thumb) {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}

@media (max-width: 768px) {
  .mode-switch-container {
    padding: 2px 8px;
  }
}
</style> 