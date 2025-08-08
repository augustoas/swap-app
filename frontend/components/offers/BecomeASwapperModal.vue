<template>
  <v-card class="offer-card" max-width="600">
    <h1 class="offer-card-title">Conviértete en Swapper</h1>
    <p class="offer-card-description">Para hacer una oferta debes registrarte como Swapper</p>
    
    <v-card-text>
      <div class="offer-card-form">
        <div class="modal-icon-container">
          <v-img 
            src="~/assets/logos/swap-logo3.png" 
            alt="Swap logo" 
            class="modal-icon"
            width="100"
            height="100"
          />
        </div>
        
        <p class="offer-card-message">
          Como Swapper podrás acceder a todas las ofertas disponibles y generar ingresos adicionales realizando tareas.
        </p>
      </div>
      
      <v-spacer></v-spacer>
      
      <div class="offer-card-buttons">
        <BaseButton
          color="var(--base-dark-blue)"
          text-color="white"
          text="Convertirme en Swapper"
          @click="goToSwapperRegistration"
        >
          Convertirme en Swapper
        </BaseButton>
        <span
          class="offer-card-cancel"
          color="var(--base-dark-blue)"
          text-color="white"
          @click="handleClose"
        >
          Cancelar
        </span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
const emit = defineEmits(['close']);

// Function to navigate to swapper registration
const goToSwapperRegistration = () => {
  router.push('/profile/newswapper');
};

// Function to close the modal
const handleClose = () => {
  emit('close');
};
</script>

<style scoped>
.offer-card {
  padding: 20px;
  background-color: white;
}

.offer-card-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
  margin-bottom: 20px;
}

.offer-card-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  color: var(--base-dark-blue);
  text-align: center;
}

.offer-card-description {
  font-size: 16px;
  margin-bottom: 20px;
  color: var(--base-dark-blue);
  text-align: center;
}

.offer-card-message {
  font-size: 14px;
  color: #666;
  margin: 10px 0;
  max-width: 400px;
}

.modal-icon-container {
  margin: 10px 0;
}

.offer-card-buttons {
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.offer-card-cancel {
  text-decoration: underline;
  cursor: pointer;
}
</style> 