<template>
  <v-footer v-if="isMobile" class="bottombar" height="60">
    <v-row justify="space-around">
      <v-col cols="auto" v-for="(item, index) in items" :key="item.name">
        <NuxtLink :to="item.path" class="tab-item" @click="selectItem(index)">
          <v-icon :class="{ 'bottom-bar-icon': true, 'active': getFilled(index) }">
            {{ item.icon }}
          </v-icon>
          <span :class="{ 'bottom-bar-text': true, 'active': getFilled(index) }">{{ item.name }}</span>
        </NuxtLink>
      </v-col>
    </v-row>
  </v-footer>
</template>

<script setup>
import { computed } from 'vue';
import { useNavigationStore } from '~/stores/navigationStore';
import { useUserStore } from '~/stores/userStore';

const navigationStore = useNavigationStore();
const userStore = useUserStore();

const isMobile = computed(() => navigationStore.getIsMobile);

const items = computed(() => {
  const commonItems = [
    { path: '/', name: 'Inicio', icon: 'mdi-home' },
    { path: '/jobs', name: 'Explorar', icon: 'mdi-magnify' },
    { path: '/post', name: 'Publicar', icon: 'mdi-plus' },
  ];

  if (userStore.isLoggedIn()) {
    return [
      ...commonItems,
      { path: '/schedule', name: 'Agenda', icon: 'mdi-format-list-bulleted' },
      { path: '/profile', name: 'Perfil', icon: 'mdi-account-circle-outline' },
    ];
  } else {
    return [
      ...commonItems,
      { path: '/login', name: 'Iniciar Sesión', icon: 'mdi-login' },
    ];
  }
});

const getFilled = (index) => {
  return index === navigationStore.getSelectedItem;
};

const selectItem = (index) => {
  navigationStore.setSelectedItem(index);
};
</script>

<style scoped>
.bottombar {
  background-color: #fff;
  position: fixed;
  bottom: 0;
  width: 100%;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  display: block;
  align-content: center;
  z-index: 9999;
  padding-top: 0;
  margin-bottom: 0;
}

.v-footer {
  padding-top: 10px !important;
  margin: 0 !important;
}

.v-icon.bottom-bar-icon {
  font-size: 24px;
  color: var(--base-grey);
}

.tab-item {
  text-align: center;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 14px;
  color: var(--base-grey);
}

.tab-label {
  margin-top: 2px;
  font-size: 12px;
}

.active {
  color: var(--base-dark-blue) !important;
}

.bottom-bar-text {
  font-size: 11px;
}
</style>
