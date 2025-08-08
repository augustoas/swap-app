<template>
  <div class="container">
    <button class="back-button" @click="goBack">
      <v-icon>mdi-chevron-left</v-icon>
    </button>
    <h1 class="header">Cuenta</h1>
    <v-divider
      :thickness="1"
      class="divider"
      color="var(--base-light-blue)"
    ></v-divider>
    <h2 class="header">Notificaciones</h2>

    <div class="info-section">
      <!-- Whatsapp -->
      <div class="list-item">
        <div class="info">
          <span class="label">Whatsapp</span>
          <span class="value">{{ whatsapp ? 'Activado' : 'Desactivado' }}</span>
        </div>
        <v-switch
          v-model="whatsapp"
          color="var(--base-light-blue)"
          hide-details
        ></v-switch>
      </div><!-- Whatsapp -->
      <div class="list-item">
        <div class="info">
          <span class="label">Correo electrónico</span>
          <span class="value">{{ correo ? 'Activado' : 'Desactivado' }}</span>
        </div>
        <v-switch
          v-model="correo"
          color="var(--base-light-blue)"
          hide-details
        ></v-switch>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

definePageMeta({
  middleware: ['auth'],
  layout: 'default',
});

// Valores originales para revertir en caso de error
const originalWhatsapp = ref(true);
const originalCorreo = ref(true);

// Variables para los valores editados
const whatsapp = ref(originalWhatsapp.value);
const correo = ref(originalCorreo.value);

const goBack = () => {
  router.push('/profile');
};

// Simulación de una llamada a la API
const updateNotificationSetting = async (type: string, value: boolean) => {
  try {
    // Llamar API aca
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Error en la actualización' };
  }
};

// Watch para observar cambios en whatsapp
watch(whatsapp, async (newValue, oldValue) => {
  const response = await updateNotificationSetting('whatsapp', newValue);
  if (!response.success) {
    whatsapp.value = oldValue;
    console.error(response.error);
  } else {
    originalWhatsapp.value = newValue;
  }
});

// Watch para observar cambios en correo
watch(correo, async (newValue, oldValue) => {
  const response = await updateNotificationSetting('correo', newValue);
  if (!response.success) {
    correo.value = oldValue;
    console.error(response.error);
  } else {
    originalCorreo.value = newValue;
  }
});
</script>


<style scoped>
.container {
  font-family: Arial, sans-serif;
  max-width: 600px;
  margin: auto;
}

.header {
  padding-top: 20px;
  padding-left: 30px;
  font-size: 1.375rem !important;
  font-weight: 700 !important;
  line-height: 1.625rem !important;
  letter-spacing: -0.6px !important;
  color: inherit !important;
}

.info-section {
  margin: 20px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.list-item {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  gap: 10px;

  &.active {
    flex-direction: column;
  }
}

.list-item:last-child {
  border-bottom: none;
}

.info {
  display: flex;
  flex-direction: column;
}

.label {
  color: black;
}

.value {
  flex: 1;
  color: #666;
  font-size: 14px;
}

.input {
  margin-top: 10px;
}

.back-button {
  color: black;
  padding: 20px;
}

.divider {
  margin-top: 20px;
  opacity: 0.5;
  margin-right: auto;
  margin-left: auto;
  width: 90%;
}
</style>
