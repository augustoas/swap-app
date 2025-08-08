<template>
  <div>
    <!-- Hamburger Menu Button -->
    <v-btn
      variant="text"
      density="compact"
      icon="mdi-menu"
      @click="toggleDrawer"
      class="hamburger-btn"
    >
      <v-icon color="var(--base-dark-blue)" size="24">mdi-menu</v-icon>
    </v-btn>

    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      temporary
      location="left"
      width="320"
      class="hamburger-drawer"
      :scrim="false"
    >
      <div class="drawer-content">
        <!-- Header with Logo -->
        <div class="drawer-header">
          <img
            src="~/assets/logos/swap-logo-brand.png"
            alt="Swap Logo"
            class="drawer-logo"
          />
          <v-btn
            variant="text"
            density="compact"
            icon="mdi-close"
            @click="closeDrawer"
            class="close-btn"
          >
            <v-icon size="20">mdi-close</v-icon>
          </v-btn>
        </div>

        <!-- Navigation Items -->
        <div class="drawer-nav">
          <!-- Main Navigation -->
          <div class="nav-section">
            <div class="nav-item" @click="navigateToHome">
              <v-icon class="nav-icon">mdi-home</v-icon>
              <span class="nav-text">Inicio</span>
            </div>
            
            <div class="nav-item" @click="navigateToJobs">
              <v-icon class="nav-icon">mdi-briefcase-search</v-icon>
              <span class="nav-text">Explorar</span>
            </div>
            
            <div class="nav-item" @click="navigateToPost">
              <v-icon class="nav-icon">mdi-plus-circle</v-icon>
              <span class="nav-text">Publicar</span>
            </div>
            
            <div v-if="userStore.isLoggedIn()" class="nav-item" @click="navigateToSchedule">
              <v-icon class="nav-icon">mdi-calendar</v-icon>
              <span class="nav-text">Mi Agenda</span>
            </div>
            
            <div v-if="userStore.isLoggedIn()" class="nav-item" @click="navigateToProfile">
              <v-icon class="nav-icon">mdi-account</v-icon>
              <span class="nav-text">Mi Perfil</span>
            </div>
            
            <div v-if="userStore.isLoggedIn()" class="nav-item" @click="navigateToChats">
              <v-icon class="nav-icon">mdi-message</v-icon>
              <span class="nav-text">Mensajes</span>
            </div>
          </div>

          <!-- Swapper Switch Section -->
          <div v-if="userStore.isLoggedIn()" class="swapper-section">
            <div class="section-divider"></div>
            <div class="swapper-switch-wrapper">
              <NavigationSwapperSwitch />
            </div>
          </div>

          <!-- Logout Section -->
          <div v-if="userStore.isLoggedIn()" class="logout-section">
            <div class="section-divider"></div>
            <div class="nav-item logout-item" @click="logout">
              <v-icon class="nav-icon">mdi-logout</v-icon>
              <span class="nav-text">Cerrar sesión</span>
            </div>
          </div>
        </div>
      </div>
    </v-navigation-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '~/stores/userStore';
import { useNavigationStore } from '~/stores/navigationStore';

const router = useRouter();
const userStore = useUserStore();
const navigationStore = useNavigationStore();

const drawer = ref(false);

const toggleDrawer = () => {
  drawer.value = !drawer.value;
};

const closeDrawer = () => {
  drawer.value = false;
};

// Handle scroll when drawer is open
const handleScroll = () => {
  if (drawer.value) {
    closeDrawer();
  }
};

// Watch drawer state to add/remove scroll listener
watch(drawer, (isOpen) => {
  if (isOpen) {
    // Add scroll listener when drawer opens
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });
  } else {
    // Remove scroll listener when drawer closes
    window.removeEventListener('scroll', handleScroll);
    document.removeEventListener('scroll', handleScroll);
  }
});

// Cleanup on component unmount
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  document.removeEventListener('scroll', handleScroll);
});

const navigateToHome = () => {
  router.push('/');
  navigationStore.setSelectedItem(0);
  closeDrawer();
};

const navigateToJobs = () => {
  router.push('/jobs');
  navigationStore.setSelectedItem(1);
  closeDrawer();
};

const navigateToPost = () => {
  router.push('/post');
  navigationStore.setSelectedItem(2);
  closeDrawer();
};

const navigateToSchedule = () => {
  router.push('/schedule');
  navigationStore.setSelectedItem(3);
  closeDrawer();
};

const navigateToProfile = () => {
  router.push('/profile');
  navigationStore.setSelectedItem(4);
  closeDrawer();
};

const navigateToChats = () => {
  router.push('/chats');
  navigationStore.setSelectedItem(5);
  closeDrawer();
};

const logout = () => {
  userStore.removeUser();
  router.push('/login');
  closeDrawer();
};
</script>

<style lang="scss" scoped>
.hamburger-btn {
  min-width: 40px !important;
  width: 40px !important;
  height: 40px !important;
  border-radius: 50% !important;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05) !important;
    transform: scale(1.1);
  }
}

.hamburger-drawer {
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
  position: fixed !important;
  z-index: 99999 !important;
}

/* Global override for navigation drawer */
:global(.v-navigation-drawer) {
  z-index: 99999 !important;
  position: fixed !important;
}

:global(.v-overlay-container .v-navigation-drawer) {
  z-index: 99999 !important;
  position: fixed !important;
}

:global(.v-overlay) {
  z-index: 99998 !important;
}

/* Deep selectors for Vuetify components */
:deep(.v-navigation-drawer) {
  position: fixed !important;
  z-index: 99999 !important;
}

:deep(.v-overlay-container) {
  z-index: 99999 !important;
}

.drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: white;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background-color: #fafafa;
  border-bottom: 1px solid #e0e0e0;
  position: relative;
}

.drawer-logo {
  height: 40px;
  width: auto;
  object-fit: contain;
}

.close-btn {
  min-width: 36px !important;
  width: 36px !important;
  height: 36px !important;
  border-radius: 50% !important;
  background-color: rgba(0, 0, 0, 0.05) !important;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.1) !important;
    transform: rotate(90deg);
  }
  
  :deep(.v-icon) {
    color: var(--base-dark-blue);
  }
}

.drawer-nav {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 16px 0;
}

.nav-section {
  flex-grow: 1;
  padding: 0 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  margin: 4px 0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--base-dark-blue);
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    transform: translateX(8px);
    color: var(--button-light-blue);
  }
  
  &:active {
    transform: translateX(4px) scale(0.98);
  }
}

.nav-icon {
  margin-right: 16px;
  font-size: 24px;
  width: 24px;
  transition: all 0.2s ease;
}

.nav-text {
  font-size: 16px;
  font-weight: 500;
  flex-grow: 1;
}

.swapper-section {
  margin-top: auto;
  padding: 0 8px;
}

.swapper-switch-wrapper {
  padding: 16px 20px;
  margin: 8px 0;
  border-radius: 12px;
  background-color: rgba(0, 0, 0, 0.02);
}

.logout-section {
  padding: 0 8px;
  margin-top: 8px;
}

.logout-item {
  color: #e53e3e;
  
  &:hover {
    background-color: rgba(229, 62, 62, 0.1);
    color: #c53030;
  }
}

.section-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent);
  margin: 16px 20px;
}

// Responsive adjustments
@media (max-width: 768px) {
  .hamburger-drawer {
    width: 280px !important;
  }
  
  .drawer-header {
    padding: 16px 20px;
  }
  
  .drawer-logo {
    height: 32px;
  }
  
  .nav-item {
    padding: 14px 16px;
  }
}
</style> 