<template>
  <v-container class="confirm-email-page">
    <v-row>
      <v-col cols="12" md="6" class="mx-auto">
        <v-card class="pa-6">
          <div v-if="isLoading" class="d-flex flex-column align-center">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <span class="mt-4">Verificando tu correo electrónico...</span>
          </div>
          
          <div v-else-if="error" class="d-flex flex-column align-center">
            <v-icon color="error" size="64" class="mb-4">mdi-alert-circle</v-icon>
            <span class="text-h6 text-center mb-4">{{ error }}</span>
            <v-btn color="primary" @click="router.push('/login')">
              Volver al inicio de sesión
            </v-btn>
          </div>
          
          <div v-else class="d-flex flex-column align-center">
            <v-icon color="success" size="64" class="mb-4">mdi-check-circle</v-icon>
            <span class="text-h6 text-center mb-4">¡Correo electrónico confirmado exitosamente!</span>
            <v-btn color="primary" @click="router.push('/login')">
              Ir al inicio de sesión
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import AuthRepository from '~/repositories/authRepository';

definePageMeta({
  layout: 'auth',
});

const route = useRoute();
const router = useRouter();
const { $api } = useNuxtApp();
const authRepository = new AuthRepository($api);

const isLoading = ref(true);
const error = ref(null);

const confirmEmail = async () => {
  try {
    const token = route.params.token;
    await authRepository.confirmEmail(token);
    isLoading.value = false;
  } catch (err) {
    error.value = err.message || 'Ha ocurrido un error al confirmar tu correo electrónico';
    isLoading.value = false;
  }
};

onMounted(() => {
  confirmEmail();
});
</script>

<style lang="scss" scoped>
.confirm-email-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 