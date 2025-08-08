<template>
  <div class="profile-page">
    <v-container class="pa-0">
      <h1>Perfil</h1>
      <!-- Profile header -->
      <div class="profile-header">
        <div class="profile-header-left">
          <v-avatar size="60">
            <v-img src="~/assets/logos/swap-logo4.png" alt="Profile" />
          </v-avatar>
          <div class="ml-3">
            <h3 class="mb-0">¡Hola! {{ useUserStore().getFirstname }}</h3>
            <span text class="profile-link text-none">Muestra el perfil</span>
          </div>
        </div>
        <v-icon class="list-icon">mdi-chevron-right</v-icon>
      </div>
      <v-divider :thickness="1" class="divider" color="var(--base-light-blue)"></v-divider>

      <!-- Swapper card -->
      <div class="swapper-card" @click="goTo('profile/newswapper')">
        <div class="swapper-card-col-left">
          <h3>Trabaja como Swapper</h3>
          <p>
            Empieza a trabajar y genera ingresos adicionales.
          </p>
        </div>
        <v-img class="swapper-card-img" src="~/assets/logos/swap-logo3.png" alt="Profile" />
      </div>

      <!-- Personal information and account -->
      <div class="list-item mt-2" @click="goTo('profile/personal')">
        <div class="list-item-col-left">
          <v-icon class="list-icon">mdi-account-circle-outline</v-icon>
          <span>Información personal</span>
        </div>
          <v-icon class="list-icon">mdi-chevron-right</v-icon>
      </div>

      <div class="list-item" @click="goTo('profile/account')">
        <div class="list-item-col-left">
          <v-icon class="list-icon">mdi-cog-outline</v-icon>
          <span>Cuenta</span>
        </div>
          <v-icon class="list-icon">mdi-chevron-right</v-icon>
      </div>

      <!-- Swapper options -->
      <h2 class="mt-8">Swapper</h2>
      <div class="list-item mt-2" @click="goTo('profile/newswapper')">
        <div class="list-item-col-left">
          <v-icon class="list-icon">mdi-swap-horizontal</v-icon>
          <span>Conviértete en Swapper</span>
        </div>
          <v-icon class="list-icon">mdi-chevron-right</v-icon>
      </div>

      <!-- Assistance options -->
      <h2 class="mt-8">Asistencia</h2>
      <div class="list-item mt-2">
        <div class="list-item-col-left">
          <v-icon class="list-icon">mdi-help-circle-outline</v-icon>
          <span>Cómo funciona Swap</span>
        </div>
          <v-icon class="list-icon">mdi-chevron-right</v-icon>
      </div>
      <div class="list-item mt-2">
        <div class="list-item-col-left">
          <v-icon class="list-icon">mdi-chat-question-outline</v-icon>
          <span>Escríbenos</span>
        </div>
          <v-icon class="list-icon">mdi-chevron-right</v-icon>
      </div>
      <v-btn class="logout-btn" variant="outlined" @click="logout()">
        Cerrar sesión
      </v-btn>
    </v-container>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

definePageMeta({
  middleware: ['auth'],
  layout: 'default',
});

const goTo = (path) => {
  router.push(path);
};

const logout = () => {
  useUserStore().removeUser();
  router.push('/login');
};
</script>

<style lang="scss" scoped>
.profile-page {
  padding: 40px;
}

.profile-header {
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  place-content: space-between;
}

.profile-header-left {
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
}

.profile-link {
  font-size: 14px;
  cursor: pointer;
}

.swapper-card {
  cursor: pointer;
  display: flex;
  background-color: #f8f8f8;
  border-radius: 12px;
  margin: 20px 0px;
  padding: 20px;
  gap: 10px;
  box-shadow: rgba(0, 0, 0, 0.12) 0px 6px 16px 0px, rgba(0, 0, 0, 0.04) 0px 0px 0px 1px !important;

  .swapper-card-col-left {
    display: flex;
    flex-direction: column;
  }

  .swapper-card-img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    margin-right: 15px;
  }
}

.list-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
}

.list-item-col-left {
  display: flex;
  gap: 10px;
  cursor: pointer;
}

.list-icon {
  cursor: pointer;
}

.divider {
  margin-top: 40px;
  margin-bottom: 0px;
  opacity: 0.8;
}

.logout-btn {
  margin-top: 20px;
  width: 100%;
  color: red;
  border-color: red;
}

@media screen and (min-width: 768px) {
  .profile-page {
    max-width: 600px;
    margin: 0 auto;
  }
}
</style>
