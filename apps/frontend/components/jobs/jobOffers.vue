<template>
  <div class="offer-card" :class="offerStatusClass">
    <div class="offer-header">
      <img 
        :src="props.offer.user.profilePicturePath || defaultProfilePicture"
        class="user-image" 
        alt="User Image" 
      />
      <div class="offer-info">
        <h4>{{ props.offer.user.firstname }} {{ props.offer.user.lastname }}</h4>
        <p class="budget">Oferta: {{ formatCurrency(props.offer.budget) }}</p>
        <div class="offer-status">
          <v-chip
            :color="statusColor"
            size="small"
            class="status-chip"
          >
            {{ statusText }}
          </v-chip>
        </div>
      </div>
    </div>
    <div class="offer-body">
      <p>{{ props.offer.text }}</p>
    </div>
    <div class="offer-actions" v-if="canShowActions">
      <v-dialog transition="dialog-bottom-transition">
        <template v-slot:activator="{ props: activatorProps }">
          <button 
            class="btn decline"
            v-bind="activatorProps"
            :disabled="isLoading"
          >
            <v-progress-circular
              v-if="isLoading"
              indeterminate
              size="20"
              width="2"
              color="white"
              class="mr-2"
            ></v-progress-circular>
            Rechazar
          </button>
        </template>
        <template v-slot:default="{ isActive }">
          <BaseModal
            @accept="handleDecline(props.offer.id, rejectReason)"
            @decline="isActive.value = false"
            title="¿Rechazar oferta?"
            :message="`¿Estás seguro que deseas rechazar la oferta de ${props.offer.user.firstname} ${props.offer.user.lastname}?`"
            :acceptText="`Rechazar`"
            :declineText="`Cancelar`"
            :isLoading="isLoading"
          >
            <template #message-input>
              <v-textarea
                v-model="rejectReason"
                label="¿Por qué rechazas esta oferta? (opcional)"
                placeholder="Escribe un comentario explicando por qué rechazas esta oferta..."
                variant="outlined"
                rows="3"
                :disabled="isLoading"
              ></v-textarea>
            </template>
          </BaseModal>
        </template>
      </v-dialog>
      <v-dialog transition="dialog-bottom-transition">
        <template v-slot:activator="{ props: activatorProps }">
          <button 
            class="btn accept"
            v-bind="activatorProps"
            :disabled="isLoading"
          >
            <v-progress-circular
              v-if="isLoading"
              indeterminate
              size="20"
              width="2"
              color="white"
              class="mr-2"
            ></v-progress-circular>
            Aceptar
          </button>
        </template>
        <template v-slot:default="{ isActive }">
          <BaseModal
            @accept="handleAcceptOffer"
            @decline="isActive.value = false"
            title="¿Aceptar oferta?"
            :message="`¿Estás seguro que deseas aceptar la oferta de ${props.offer.user.firstname} ${props.offer.user.lastname} por ${formatCurrency(props.offer.budget)}?`"
            :acceptText="`Pagar`"
            :declineText="`Cancelar`"
            :isLoading="isLoading"
          >
            <template #terms-link>
              <p>
                Al aceptar la oferta, aceptas los <a href="/terms">términos y condiciones</a> de Swap y procederás al pago de la oferta.
              </p>
            </template>
          </BaseModal>  
        </template>
      </v-dialog>
    </div>
  </div>

  <!-- Payment Modal -->
  <PaymentModal
    v-model="showPaymentModal"
    :offer-id="props.offer.id"
    :amount="props.offer.budget"
    :swapper-name="`${props.offer.user.firstname} ${props.offer.user.lastname}`"
    :job-description="props.jobDescription || 'Servicio solicitado'"
    @payment-success="handlePaymentSuccess"
  />
</template>

<script setup lang="ts">
import { formatCurrency } from '~/utils/utils';
import { ref, computed } from 'vue';
import OfferRepository from '~/repositories/offerRepository';
import defaultProfilePicture from '~/assets/logos/swap-logo4.png';
import PaymentModal from '~/components/payment/PaymentModal.vue';
const { $api } = useNuxtApp();
const offerRepository = new OfferRepository($api);
const emit = defineEmits(['offerAccepted', 'offerDeclined']);

const props = defineProps<{
  offer: {
    id: string;
    user: {
      firstname: string;
      lastname: string;
      profilePicturePath: string | null;
    };
    text: string;
    budget: number;
    date: string;
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  },
  jobDescription?: string;
}>();

const rejectReason = ref('');
const isLoading = ref(false);
const showPaymentModal = ref(false);

const statusColor = computed(() => {
  switch (props.offer.status) {
    case 'accepted':
      return 'success';
    case 'rejected':
      return 'error';
    case 'cancelled':
      return 'grey';
    default:
      return 'primary';
  }
});

const statusText = computed(() => {
  switch (props.offer.status) {
    case 'accepted':
      return 'Aceptada';
    case 'rejected':
      return 'Rechazada';
    case 'cancelled':
      return 'Cancelada';
    default:
      return 'Pendiente';
  }
});

const offerStatusClass = computed(() => {
  return `offer-status-${props.offer.status}`;
});

const canShowActions = computed(() => {
  console.log('canShowActions props.offer', props.offer);
  return props.offer.status === 'pending';
});

const handleAcceptOffer = async () => {
  // Open payment modal instead of directly accepting
  showPaymentModal.value = true;
};

const handlePaymentSuccess = (acceptedOffer: any) => {
  // This will be called after successful payment
  emit('offerAccepted', acceptedOffer);
};

const handleDecline = async (id: string, reason: string) => {
  try {
    isLoading.value = true;
    const response = await offerRepository.declineOffer(id, reason);
    
    if (response.payload) {
      useAlertStore().setAlert('success', response.message || 'Oferta rechazada exitosamente');
      emit('offerDeclined', response.payload);
    }
  } catch (error: any) {
    console.error('Error declining offer:', error);
    useAlertStore().setAlert('error', error.message || 'Error al rechazar la oferta');
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.offer-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.offer-status-pending {
  border-left: 4px solid #2196F3;
}

.offer-status-accepted {
  border-left: 4px solid #4CAF50;
  background-color: rgba(76, 175, 80, 0.05);
}

.offer-status-rejected {
  border-left: 4px solid #F44336;
  background-color: rgba(244, 67, 54, 0.05);
}

.offer-status-cancelled {
  border-left: 4px solid #9E9E9E;
  background-color: rgba(158, 158, 158, 0.05);
}

.offer-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.user-image {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
  object-fit: cover;
}

.offer-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.offer-info h4 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

.budget {
  font-size: 16px;
  color: #2c5282;
  font-weight: 600;
  margin: 4px 0;
}

.offer-status {
  margin-top: 4px;
}

.status-chip {
  font-size: 12px;
  font-weight: 500;
}

.offer-body {
  font-size: 14px;
  color: #555;
  margin-bottom: 15px;
}

.offer-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn {
  padding: 4px 10px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.2s;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn:hover {
  opacity: 0.8;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.accept {
  background-color: #48bb78;
  color: white;
}

.decline {
  background-color: #f56565;
  color: white;
}
</style>