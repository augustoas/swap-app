<template>
  <v-app v-if="isMounted">
    <NavigationTopbar v-if="!isMobile"/>
    <NotificationAlert class="notification-alert" v-model="alertStore.getAlert.status"
      :type="alertStore.getAlert.type"
      :message="alertStore.getAlert.message"
      :color="alertStore.getAlert.color"
      :icon="alertStore.getAlert.icon"
      :title="alertStore.getAlert.title"
      :location="alertStore.getAlert.location"
    />
    <div class="main-content">
      <slot />
    </div>
    <!-- <NavigationBottombar /> -->
  </v-app>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useNavigationStore } from '~/stores/navigationStore';
import { useAlertStore } from '~/stores/alertStore';
import { useUserStore } from '~/stores/userStore';

const alertStore = useAlertStore();
const userStore = useUserStore();
const navigationStore = useNavigationStore();

const isMounted = ref(false);

const isMobile = computed(() => navigationStore.getIsMobile);

if (process.client && userStore.isLoggedIn()) {
  userStore.setUserFromLocalStorage();
}

// onMounted se asegura de que solo corra en el cliente
onMounted(() => {
  isMounted.value = true;

  navigationStore.initializeSelectedItem();
  navigationStore.updateScreenSize();

  window.addEventListener('resize', navigationStore.updateScreenSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', navigationStore.updateScreenSize);
});
</script>


<style lang="scss" scoped>
.main-content {
  padding-top: 60px;
  padding-bottom: 20px;
  max-width: 1024px;
  width: 80%;
  margin: 0px auto;
}

@media screen and (max-width: 768px) {
  .main-content {
    padding-top: 0px;
  }
}

@media screen and (max-width: 1024px) {
  .main-content {
    width: 100%;
  }
}

.notification-alert {
  z-index: 9999;
}
</style>

<style lang="scss">
/* Global styles for centering notification alerts */
.v-overlay-container .v-snackbar.custom-alert {
  .v-snackbar__wrapper {
    left: 50% !important;
    right: auto !important;
    transform: translateX(-50%) !important;
    margin: 0 !important;
    position: fixed !important;
  }
}

/* Alternative approach - target all snackbars in overlay container */
.v-overlay-container .v-snackbar {
  .v-snackbar__wrapper {
    left: 50% !important;
    right: auto !important;
    transform: translateX(-50%) !important;
    margin: 0 !important;
  }
}
</style>
