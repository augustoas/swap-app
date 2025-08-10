<template>
  <div class="navbar" ref="navbarRef">
    <nav v-if="isMobile">
      <ul class="navbar-list">
        <li class="hamburger-menu">
          <HamburgerMenu />
        </li>
        <li class="messages">
          <div class="messages-icons" v-if="userStore.isLoggedIn()">
            <div class="notification-wrapper">
              <v-dialog 
                scrollable 
                :fullscreen="notificationFullScreen"
                persistent
                transition="dialog-transition"
                content-class="notification-dialog"
              >
                <template v-slot:activator="{ props: activatorProps }">
                  <v-btn stacked variant="text" density="compact" v-bind="activatorProps" class="notification-btn">
                    <v-badge
                      :content="notificationCount"
                      :model-value="notificationCount > 0"
                      color="error"
                      bordered
                      dot-color="error"
                      location="top end"
                      offset-x="3"
                      offset-y="3"
                      class="notification-badge"
                    >
                      <v-icon color="var(--base-dark-blue)" icon="mdi-bell-outline" size="22"></v-icon>
                    </v-badge>
                  </v-btn>
                </template>
                <template v-slot:default="{ isActive }">
                  <NotificationContent 
                    v-if="isActive" 
                    @close="isActive.value = false" 
                    @toggleFullScreen="toggleFullScreen()" 
                    :is-fullscreen="notificationFullScreen"
                  />
                </template>
              </v-dialog>
            </div>
            <NuxtLink to="/chats" @click="handleBottomTabUpdate(4)" class="message-btn">
              <v-badge
                :content="unreadMessagesCount"
                :model-value="unreadMessagesCount > 0"
                color="error"
                bordered
                dot-color="error"
                location="top end"
                offset-x="3"
                offset-y="3"
                class="message-badge"
              >
                <v-icon color="var(--base-dark-blue)" icon="mdi-chat-outline" size="22"></v-icon>
              </v-badge>
            </NuxtLink>
          </div>
          <!-- Mobile login button -->
          <div v-if="!userStore.isLoggedIn()" class="mobile-login">
            <NuxtLink to="/login" class="mobile-login-btn">
              Iniciar sesión
            </NuxtLink>
          </div>
        </li>
      </ul>
    </nav>
    <nav v-else>
      <ul class="navbar-list desktop-navbar">
        <li class="logo">
          <NuxtLink to="/" @click="handleBottomTabUpdate(0)">
            <img
              src="~/assets/logos/swap-logo-brand.png"
              alt="Logo"
              class="logo-img"
            />
          </NuxtLink>
        </li>
        <div class="nav-items">
          <li class="nav-item">
            <NuxtLink to="/jobs" @click="handleBottomTabUpdate(1)" class="nav-link">Explorar</NuxtLink>
          </li>
          <li class="nav-item">
            <a @click="handlePublicarClick" class="nav-link" style="cursor: pointer;">Publicar</a>
          </li>
          <li class="nav-item" v-if="userStore.isLoggedIn()">
            <NuxtLink to="/schedule" @click="handleBottomTabUpdate(3)" class="nav-link">Mi Agenda</NuxtLink>
          </li>
          <li class="nav-item" v-if="userStore.isLoggedIn()">
            <NuxtLink to="/profile" @click="handleBottomTabUpdate(5)" class="nav-link">Mi Perfil</NuxtLink>
          </li>
        </div>
        <div class="right-items">
          <li class="nav-item icons-group" v-if="userStore.isLoggedIn()">
            <div class="notification-wrapper">
              <v-dialog 
                scrollable 
                :fullscreen="notificationFullScreen"
                persistent
                transition="dialog-transition"
                content-class="notification-dialog"
              >
                <template v-slot:activator="{ props: activatorProps }">
                  <v-btn stacked variant="text" density="compact" v-bind="activatorProps" class="notification-btn">
                    <v-badge
                      :content="notificationCount"
                      :model-value="notificationCount > 0"
                      color="error"
                      bordered
                      dot-color="error"
                      location="top end"
                      offset-x="3"
                      offset-y="3"
                      class="notification-badge"
                    >
                      <v-icon color="var(--base-dark-blue)" icon="mdi-bell-outline" size="22"></v-icon>
                    </v-badge>
                  </v-btn>
                </template>
                <template v-slot:default="{ isActive }">
                  <NotificationContent 
                    v-if="isActive" 
                    @close="isActive.value = false" 
                    @toggleFullScreen="toggleFullScreen()" 
                    :is-fullscreen="notificationFullScreen"
                  />
                </template>
              </v-dialog>
            </div>
            <NuxtLink to="/chats" @click="handleBottomTabUpdate(4)" class="message-btn">
              <v-badge
                :content="unreadMessagesCount"
                :model-value="unreadMessagesCount > 0"
                color="error"
                bordered
                dot-color="error"
                location="top end"
                offset-x="3"
                offset-y="3"
                class="message-badge"
              >
                <v-icon color="var(--base-dark-blue)" icon="mdi-message-text-outline" size="22"></v-icon>
              </v-badge>
            </NuxtLink>
          </li>
          <div class="auth-buttons" v-if="!userStore.isLoggedIn()">
            <NuxtLink to="/login" class="login-btn nav-link">
              Iniciar sesión
            </NuxtLink>
          </div>
        </div>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, nextTick } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HamburgerMenu from '~/components/navigation/HamburgerMenu.vue';
import { useChat } from '@/composables/useChat';
import type { ChatRoomPreview } from '@/repositories/chatRepository';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const navigationStore = useNavigationStore();
const userStore = useUserStore();
const notificationStore = useNotificationStore();
const router = useRouter();
const { isSwapper } = useSwapperView();

const isMobile = computed(() => navigationStore.getIsMobile);
const navbarRef = ref<HTMLElement | null>(null);

// Notification state
const notificationFullScreen = ref(false);
const toggleFullScreen = () => notificationFullScreen.value = !notificationFullScreen.value;

// Get notification count
const notifications = computed(() => notificationStore.getAllNotification);
const notificationCount = computed(() => notifications.value.length);

// Get real unread messages count from chat system
const chat = ref<any>(null);
const unreadMessagesCount = computed(() => {
  if (!chat.value) return 0;
  
  try {
    const chatRoomsList = chat.value.chatRoomsList?.value;
    if (!chatRoomsList || !Array.isArray(chatRoomsList)) {
      return 0;
    }
    
    return chatRoomsList.reduce((total: number, room: ChatRoomPreview) => {
      const roomState = chat.value.getChatRoomState(room.id);
      return total + (roomState?.unreadCount || 0);
    }, 0);
  } catch (error) {
    console.error('Error calculating unread messages count:', error);
    return 0;
  }
});

// Initialize animations and scroll effects
const initAnimations = () => {
  if (!navbarRef.value) return;

  // Simple scroll effect for navbar
  try {
    ScrollTrigger.create({
      trigger: 'body',
      start: 'top -50px',
      end: '+=100',
      onToggle: (self) => {
        if (navbarRef.value) {
          if (self.isActive) {
            navbarRef.value.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            navbarRef.value.style.backdropFilter = 'blur(10px)';
            navbarRef.value.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
          } else {
            navbarRef.value.style.backgroundColor = '#fff';
            navbarRef.value.style.backdropFilter = 'none';
            navbarRef.value.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
          }
        }
      }
    });
  } catch (error) {
    console.error('Error creating ScrollTrigger:', error);
  }

  // Simple fade in for icons
  try {
    const icons = navbarRef.value.querySelectorAll('.notification-btn, .message-btn');
    icons.forEach((icon, index) => {
      gsap.set(icon, { opacity: 0, scale: 0.8 });
      gsap.to(icon, { 
        opacity: 1, 
        scale: 1, 
        duration: 0.3, 
        delay: index * 0.1,
        ease: 'power2.out'
      });
    });
  } catch (error) {
    console.error('Error animating icons:', error);
  }
};

// Initialize chat when logged in
onMounted(() => {
  if (userStore.isLoggedIn()) {
    try {
      chat.value = useChat();
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  }

  // Initialize the view mode
  navigationStore.initializeViewMode();

  // Initialize animations
  nextTick(() => {
    try {
      initAnimations();
    } catch (error) {
      console.error('Error initializing animations:', error);
    }
  });
});

onUnmounted(() => {
  // Clean up ScrollTrigger instances
  try {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  } catch (error) {
    console.error('Error cleaning up ScrollTrigger:', error);
  }
});

const handleBottomTabUpdate = (index : number) => {
  navigationStore.setSelectedItem(index);
};

const handlePublicarClick = () => {
  if (!userStore.isLoggedIn()) {
    navigateTo('/login');
    return;
  }
  handleBottomTabUpdate(2);
  navigateTo('/post');
};


</script>

<style lang="scss" scoped>
.navbar {
  background-color: #fff;
  position: fixed;
  top: 0;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  height: 64px;
  z-index: 100;
  transition: all 0.3s ease;
  
  &.scrolled {
    background-color: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.15);
  }
}

/* Ensure topbar dialogs don't interfere with sidebar */
.navbar :deep(.v-dialog),
.navbar :deep(.v-overlay) {
  z-index: 1000 !important;
}

.navbar a {
  text-decoration: none;
}

.navbar-list {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  list-style: none;
  height: 64px;
  margin: 0;
  position: relative;
  
  @media (max-width: 1200px) {
    padding: 0 1rem;
  }
  
  @media (max-width: 1024px) {
    padding: 0 0.75rem;
  }
}

.desktop-navbar {
  @media (max-width: 1024px) {
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    
    &::-webkit-scrollbar {
      display: none;
    }
  }
}

.logo {
  flex: 0 0 auto;
}

.logo-img {
  height: 38px;
  object-fit: cover;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.03);
  }
}

.messages {
  flex: 0 0 auto;
  
  a {
    text-decoration: none;
  }
}

.messages-icons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.nav-items {
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  gap: 24px;
  
  @media (max-width: 1200px) {
    gap: 16px;
  }
  
  @media (max-width: 1024px) {
    gap: 12px;
  }
}

.right-items {
  display: flex;
  flex: 0 0 auto;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
}

.nav-item {
  margin: 0;
  display: flex;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: var(--base-dark-blue);
  font-weight: 500;
  font-size: 15px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: var(--base-dark-blue);
  }
  
  @media (max-width: 1200px) {
    font-size: 14px;
    padding: 6px 10px;
  }
  
  @media (max-width: 1024px) {
    font-size: 13px;
    padding: 6px 8px;
  }
}



.hamburger-menu {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  
  :deep(.hamburger-btn) {
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.05);
      background-color: rgba(0, 0, 0, 0.05) !important;
    }
    
    &:active {
      transform: scale(0.98);
    }
  }
}

.notification-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.icons-group {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 4px;
  
  a {
    text-decoration: none;
  }
}

@media (max-width: 768px) {
  .navbar {
    height: 56px;
  }
  
  .navbar-list {
    height: 56px;
    padding: 0 1rem;
  }
  
  .logo-img {
    height: 32px;
  }
  
  .messages-icons {
    margin-right: -4px;
  }
}

:deep(.v-btn--stacked) {
  padding: 0;
  min-width: 40px;
  width: 40px;
  height: 40px;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  position: relative;
}

:deep(.v-btn--stacked:hover) {
  background-color: rgba(0, 0, 0, 0.04);
}

:deep(.v-badge__badge) {
  font-size: 12px;
    min-width: 20px;
    height: 20px;
    border-radius: 15px;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transform: translate(0, 0);
    animation: pulse-0fe5869d 2s infinite;
    line-height: 0px;
    display: flex;
    align-items: center;
    justify-content: center;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Define a common style for icon buttons */
@mixin icon-button {
  width: 40px;
  height: 40px;
  min-width: 40px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
  text-decoration: none;
  position: relative;
  margin: 0;
  padding: 0;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
}

/* Apply the mixin to notification, message and profile buttons */
.notification-btn {
  @include icon-button;
}

.message-btn {
  @include icon-button;
}

:deep(.notification-badge), :deep(.message-badge) {
  position: relative;
}

// Notification dialog centering
:deep(.notification-dialog) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

:deep(.v-overlay__content) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.auth-buttons {
  display: flex;
  align-items: center;
  
  @media (max-width: 1024px) {
    display: none; // Ocultar en mobile
  }
}

.login-btn {
  // Usar mismo estilo que otros nav-links
  text-decoration: none;
  color: var(--base-dark-blue);
  font-weight: 500;
  font-size: 15px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: var(--base-dark-blue);
  }
  
  @media (max-width: 1200px) {
    font-size: 14px;
    padding: 6px 10px;
  }
}

.mobile-login {
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-login-btn {
  text-decoration: none;
  color: var(--base-dark-blue);
  font-weight: 500;
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: var(--base-dark-blue);
  }
}
</style>
