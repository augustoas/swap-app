<template>
  <v-dialog
    v-model="isOpen"
    fullscreen
    :scrim="false"
    transition="dialog-bottom-transition"
    class="payment-modal"
  >
    <v-card class="payment-card">
      <!-- Header -->
      <v-app-bar
        flat
        class="payment-header"
        color="white"
      >
        <v-btn
          icon="mdi-close"
          @click="closeModal"
          class="close-btn"
        ></v-btn>
        
        <v-toolbar-title class="payment-title">
          Procesar Pago
        </v-toolbar-title>
        
        <v-spacer></v-spacer>
      </v-app-bar>

      <!-- Content -->
      <v-card-text class="payment-content">
        <div class="payment-container">
          
          <!-- Payment Summary -->
          <div class="payment-summary">
            <h2 class="summary-title">Resumen del Pago</h2>
            <div class="summary-item">
              <span class="summary-label">Swapper:</span>
              <span class="summary-value">{{ swapperName }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Servicio:</span>
              <span class="summary-value">{{ jobDescription }}</span>
            </div>
            <div class="summary-item total">
              <span class="summary-label">Total a pagar:</span>
              <span class="summary-value">{{ formatCurrency(amount) }}</span>
            </div>
          </div>

          <!-- Terms and Conditions -->
          <div class="terms-section">
            <v-checkbox
              v-model="acceptedTerms"
              class="terms-checkbox"
              color="var(--base-dark-blue)"
            >
              <template #label>
                <span class="terms-label">
                  Acepto los <a href="/terms" target="_blank" class="terms-link">términos y condiciones</a> de Swap
                </span>
              </template>
            </v-checkbox>

            <v-checkbox
              v-model="acceptedCancellation"
              class="terms-checkbox"
              color="var(--base-dark-blue)"
            >
              <template #label>
                <span class="terms-label">
                  Acepto las políticas de cancelación
                </span>
              </template>
            </v-checkbox>

            <div class="cancellation-policy">
              <v-icon class="warning-icon" color="orange">mdi-alert-circle</v-icon>
              <span class="disclaimer-text">
                <strong>Importante:</strong> Si cancelas con menos de 24 horas de anticipación se te cobrará un 20% del valor del ticket
              </span>
            </div>
          </div>

          <!-- Payment Method -->
          <div class="payment-method">
            <h3 class="method-title">Método de Pago</h3>
            <div class="payment-option">
              <v-icon class="payment-icon" color="var(--base-dark-blue)">mdi-credit-card</v-icon>
              <span class="payment-text">Tarjeta de Crédito/Débito</span>
              <v-icon class="check-icon" color="success">mdi-check-circle</v-icon>
            </div>
          </div>

          <!-- Payment Button -->
          <div class="payment-actions">
            <v-btn
              class="pay-button"
              size="large"
              color="var(--base-dark-blue)"
              :disabled="!canProceedPayment || isProcessing"
              :loading="isProcessing"
              @click="processPayment"
              block
            >
              <v-icon start>mdi-credit-card</v-icon>
              {{ isProcessing ? 'Procesando...' : `Pagar ${formatCurrency(amount)}` }}
            </v-btn>
          </div>

        </div>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Success Modal -->
  <v-dialog
    v-model="showSuccessModal"
    max-width="400"
    persistent
    class="success-modal"
  >
    <v-card class="success-card">
      <v-card-text class="success-content">
        <div class="success-icon-container">
          <v-icon class="success-icon" color="success" size="64">mdi-check-circle</v-icon>
        </div>
        <h2 class="success-title">¡Pago Exitoso!</h2>
        <p class="success-message">
          El pago se ha procesado correctamente. La oferta ha sido aceptada y el trabajo está confirmado.
        </p>
        <v-btn
          class="success-button"
          color="var(--base-dark-blue)"
          size="large"
          @click="redirectToSchedule"
          block
        >
          <v-icon start>mdi-calendar</v-icon>
          Ir a Mi Agenda
        </v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { formatCurrency } from '~/utils/utils';
import OfferRepository from '~/repositories/offerRepository';

interface Props {
  modelValue: boolean;
  offerId: string;
  amount: number;
  swapperName: string;
  jobDescription: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue', 'paymentSuccess']);

const { $api } = useNuxtApp();
const router = useRouter();
const offerRepository = new OfferRepository($api);

// Reactive state
const acceptedTerms = ref(false);
const acceptedCancellation = ref(false);
const isProcessing = ref(false);
const showSuccessModal = ref(false);

// Computed properties
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const canProceedPayment = computed(() => {
  return acceptedTerms.value && acceptedCancellation.value;
});

// Methods
const closeModal = () => {
  if (!isProcessing.value) {
    isOpen.value = false;
  }
};

const processPayment = async () => {
  if (!canProceedPayment.value) return;
  
  try {
    isProcessing.value = true;
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Call accept offer endpoint
    const response = await offerRepository.acceptOffer(props.offerId);
    
    if (response.payload) {
      // Close payment modal
      isOpen.value = false;
      
      // Show success modal
      showSuccessModal.value = true;
      
      // Emit success event
      emit('paymentSuccess', response.payload);
      
      useAlertStore().setAlert('success', 'Pago procesado exitosamente');
    }
  } catch (error: any) {
    console.error('Error processing payment:', error);
    useAlertStore().setAlert('error', error.message || 'Error al procesar el pago');
  } finally {
    isProcessing.value = false;
  }
};

const redirectToSchedule = () => {
  showSuccessModal.value = false;
  router.push('/schedule');
};
</script>

<style lang="scss" scoped>
.payment-modal {
  z-index: 9999;
}

.payment-card {
  background-color: #f8f9fa;
}

.payment-header {
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.close-btn {
  color: var(--base-dark-blue);
}

.payment-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--base-dark-blue);
}

.payment-content {
  padding: 0;
  background-color: #f8f9fa;
}

.payment-container {
  max-width: 600px;
  margin: 0 auto;
  margin-top: 80px; /* Space for navbar */
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Payment Summary */
.payment-summary {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.summary-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--base-dark-blue);
  margin-bottom: 16px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  &.total {
    margin-top: 8px;
    padding-top: 16px;
    border-top: 2px solid var(--base-dark-blue);
    font-weight: 600;
    font-size: 18px;
  }
}

.summary-label {
  color: #666;
  font-weight: 500;
}

.summary-value {
  color: var(--base-dark-blue);
  font-weight: 600;
}

/* Terms Section */
.terms-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.terms-checkbox {
  margin-bottom: 12px;
}

.terms-label {
  font-size: 14px;
  color: #444;
}

.terms-link {
  color: var(--base-dark-blue);
  text-decoration: underline;
  
  &:hover {
    text-decoration: none;
  }
}

.cancellation-policy {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 12px;
  margin-top: 16px;
}

.warning-icon {
  margin-top: 2px;
  flex-shrink: 0;
}

.disclaimer-text {
  font-size: 13px;
  color: #856404;
  line-height: 1.4;
}

/* Payment Method */
.payment-method {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.method-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--base-dark-blue);
  margin-bottom: 16px;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid var(--base-dark-blue);
  border-radius: 8px;
  background-color: rgba(var(--base-light-blue-rgb), 0.1);
}

.payment-icon {
  font-size: 24px;
}

.payment-text {
  flex: 1;
  font-weight: 500;
  color: var(--base-dark-blue);
}

.check-icon {
  font-size: 20px;
}

/* Payment Actions */
.payment-actions {
  margin-top: 8px;
}

.pay-button {
  height: 56px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  text-transform: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  color: white !important;
  
  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    opacity: 0.6;
  }
}

/* Success Modal */
.success-card {
  border-radius: 16px;
  overflow: hidden;
}

.success-content {
  text-align: center;
  padding: 32px 24px;
}

.success-icon-container {
  margin-bottom: 16px;
}

.success-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--base-dark-blue);
  margin-bottom: 12px;
}

.success-message {
  font-size: 16px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 24px;
}

.success-button {
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  text-transform: none;
  color: white !important;
}

/* Responsive */
@media (max-width: 768px) {
  .payment-container {
    padding: 16px;
    gap: 24px;
    margin-top: 70px; /* Smaller margin for mobile */
  }
  
  .payment-summary,
  .terms-section,
  .payment-method {
    padding: 16px;
  }
  
  .summary-title,
  .method-title {
    font-size: 16px;
  }
  
  .cancellation-policy {
    padding: 12px;
  }
  
  .disclaimer-text {
    font-size: 12px;
  }
}
</style>