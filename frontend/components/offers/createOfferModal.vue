<template>
  <v-card class="offer-card" max-width="600">
    <h1 class="offer-card-title">Nueva oferta</h1>
    <p class="offer-card-description">Una vez creada la oferta el creador del trabajo recibirá una notificación.</p>
    
    <v-card-text>
      <div ref="form" class="offer-card-form">
        <h3 class="offer-card-form-title">Monto ofertado</h3>
        <v-text-field
          ref="budgetInput"
          type="text"
          variant="outlined"
          id="budget"
          v-model="formattedBudget"
          @input="formatCurrency"
          placeholder="Monto por el cual harías el trabajo"
          color="var(--base-light-blue)"
          :rules="formRules.budget"
          :error-messages="budgetError"
          prepend-inner-icon="mdi-currency-usd"
        />
        <h3 class="offer-card-form-title">Comentario adicional</h3>
        <v-textarea
          ref="textInput"
          type="text"
          variant="outlined"
          id="text"
          v-model="text"
          placeholder="Ej: Ojalá puedas confirmarme hoy, podría ir a tu casa a revisar el trabajo esta semana"
          color="var(--base-light-blue)"
          :rules="formRules.text"
        />
      </div>
      <v-spacer></v-spacer>
      <div class="offer-card-buttons">
        <div v-if="isLoading" class="loading-spinner">
          <v-progress-circular indeterminate color="var(--base-light-blue)"></v-progress-circular>
        </div>
        <BaseButton
          v-else
          color="var(--base-dark-blue)"
          text-color="white"
          text="Crear oferta"
          @click="handleCreateOffer"
        >
          Crear oferta
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
import OfferRepository from '@/repositories/offerRepository'

const props = defineProps({
  job_id: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['close']);

const budgetInput = ref(null);
const formattedBudget = ref('');
const budget = ref(0);
const text = ref('');
const isLoading = ref(false);
const budgetError = ref('');

const { $api } = useNuxtApp();
const offerRepository = new OfferRepository($api);

const formRules = {
  budget: [
    (v) => !!v || 'El presupuesto es requerido',
    (v) => budget.value >= 5000 || 'El presupuesto mínimo es de $5.000',
  ],
  text: [
    (v) => !v || v.length >= 20 || 'El comentario debe tener al menos 20 caracteres',
  ],
};

const handleClose = () => {
  emit('close');
};

const validateForm = () => {
  budgetError.value = '';
  
  if (!budget.value) {
    budgetError.value = 'El presupuesto es requerido';
    return false;
  }
  
  if (budget.value < 5000) {
    budgetError.value = 'El presupuesto mínimo es de $5.000';
    return false;
  }

  if (text.value && text.value.length < 20) {
    return false;
  }

  return true;
};

const handleCreateOffer = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    isLoading.value = true;
    await offerRepository.create({
      budget: Number(budget.value), 
      text: text.value, 
      jobId: props.job_id
    });
    useAlertStore().setAlert('success', 'Oferta creada correctamente');
    handleClose();
  } catch (error) {
    console.error(error);
    useAlertStore().setAlert('error', 'Error al crear la oferta');
  } finally {
    isLoading.value = false;
  }
};

const formatCurrency = (event) => {
  let value = event.target._value;
  let numericValue = value.replace(/\D/g, '');
  let formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  formattedBudget.value = formattedValue;
  budget.value = numericValue;
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
  gap: 10px;
}

.offer-card-form-title {
  font-size: 16px;
  font-weight: bold;
  color: var(--base-dark-blue);
}

.offer-card-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: var(--base-dark-blue);
  text-align: center;
}

.offer-card-description {
  font-size: 16px;
  margin-bottom: 20px;
  color: var(--base-dark-blue);
  text-align: center;
}

.offer-card-buttons {
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: center;
  align-items: center;
}

.offer-card-cancel {
  text-decoration: underline;
  cursor: pointer;
}
</style>
