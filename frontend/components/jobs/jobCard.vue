<template>
  <div class="job-card" @click="onClick">
    <div class="job-header">
      <h3 class="job-description">{{ truncatedDescription(job.description) }}</h3>
      <div class="images-container">
        <img
          v-if="showWorkerImage"
          class="job-worker-img"
          src="~/assets/logos/swap-logo3.png"
          alt="Worker Image"
        />
        <img
          class="job-owner-img"
          src="~/assets/logos/swap-logo4.png"
          alt="Job Owner Logo"
        />
      </div>
    </div>
    <div class="job-body">
      <div v-if="job.dateType === dateTypeMap.ON_DATE" class="job-body-item">
        <v-icon>mdi-calendar</v-icon>En el día: {{ formatDate(job.date) }}
      </div>
      <div v-if="job.dateType === dateTypeMap.BEFORE_DATE" class="job-body-item">
        <v-icon>mdi-calendar</v-icon>Antes del día: {{ formatDate(job.date) }}
      </div>
      <div v-if="job.dateType === dateTypeMap.FLEXIBLE" class="job-body-item">
        <v-icon>mdi-calendar</v-icon>Por definir
      </div>
      <div v-if="!job.is_remote" class="job-body-item">
        <v-icon>mdi-map-marker</v-icon>{{ `${job.address}, ${job.commune}, ${job.region}` }}
      </div>
      <div v-if="job.is_remote" class="job-body-item">
        <v-icon>mdi-map-marker</v-icon>Remoto
      </div>
    </div>
    <div class="job-footer">
      <slot name="card-tags"></slot>
    </div>
    
    <div class="job-footer budget">
      <!-- Show offer info if available (for swapper agenda) -->
      <div v-if="job.offerInfo" class="offer-budget-info">
        <span class="job-budget">Trabajo: {{ formatCurrency(job.budget) }}</span>
        <span class="offer-budget">Tu oferta: {{ formatCurrency(job.offerInfo.budget) }}</span>
        <v-chip 
          :color="getOfferStatusColor(job.offerInfo.status)" 
          size="small" 
          class="offer-status-chip"
        >
          {{ getOfferStatusText(job.offerInfo.status) }}
        </v-chip>
      </div>
      
      <!-- Show client payment info for confirmed jobs -->
      <div v-else-if="isConfirmedJobForClient" class="client-payment-info">
        <div class="payment-comparison-client">
          <span class="original-price">{{ formatCurrency(job.budget) }}</span>
          <span class="paid-price">{{ formatCurrency(job.accepted_budget) }}</span>
        </div>
        <v-chip 
          color="success" 
          size="small" 
          class="payment-status-chip"
        >
          Pagado
        </v-chip>
      </div>
      <!-- Normal budget display with counters -->
      <div v-else class="budget-and-counters">
        <div class="budget-info">
          <span v-if="job.accepted_budget" class="payment-status">Pagada</span>
          <span class="job-budget">
            {{ job.accepted_budget ? formatCurrency(job.accepted_budget) : formatCurrency(job.budget) }}
          </span>
        </div>
        <div class="job-counters">
          <div v-if="job.offers && job.offers.length > 0" class="counter offers-counter">
            <v-icon size="small" color="var(--base-dark-blue)">mdi-briefcase-variant</v-icon>
            <span>{{ job.offers.length }}</span>
          </div>
          <div v-if="unansweredQuestionsCount > 0" class="counter questions-counter">
            <v-icon size="small" color="var(--base-dark-blue)">mdi-help-circle</v-icon>
            <span>{{ unansweredQuestionsCount }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { formatDate, formatCurrency } from '~/utils/utils';
import { dateTypeMap } from '~/utils/mapKeys';

const props = defineProps({
  job: Object,
  onClick: Function,
  showWorkerImage: {
    type: Boolean,
    default: false,
  },
});

const truncatedDescription = (description) => {
  return description.length > 50 ? description.slice(0, 50) + '...' : description;
};

// Calculate unanswered questions count
const unansweredQuestionsCount = computed(() => {
  if (!props.job.questions || !Array.isArray(props.job.questions)) {
    return 0;
  }
  
  return props.job.questions.filter(question => 
    !question.replies || question.replies.length === 0
  ).length;
});

// Check if this is a confirmed job for the client (has accepted_budget and no offerInfo)
const isConfirmedJobForClient = computed(() => {
  return props.job.accepted_budget && 
         !props.job.offerInfo && 
         props.job.status === 'confirmed';
});

// Offer status helpers
const getOfferStatusColor = (status) => {
  switch (status) {
    case 'accepted':
      return 'success';
    case 'pending':
      return 'warning';
    case 'rejected':
      return 'error';
    case 'cancelled':
      return 'grey';
    default:
      return 'primary';
  }
};

const getOfferStatusText = (status) => {
  switch (status) {
    case 'accepted':
      return 'Aceptada';
    case 'pending':
      return 'Pendiente';
    case 'rejected':
      return 'Rechazada';
    case 'cancelled':
      return 'Cancelada';
    default:
      return 'Desconocido';
  }
};
</script>

<style lang="scss" scoped>
.job-card {
  padding: 10px;
  margin-bottom: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
}

/* Responsive styles for mobile */
@media (max-width: 768px) {
  .job-card {
    padding: 8px;
    margin-bottom: 12px;
  }
}

@media (max-width: 480px) {
  .job-card {
    padding: 6px;
    margin-bottom: 10px;
  }
}

.job-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;

  .job-description {
    font-size: 18px;
    margin-right: 20px;
    text-align: start;
  }
}

/* Responsive styles for job header */
@media (max-width: 768px) {
  .job-header {
    margin-bottom: 10px;
    
    .job-description {
      font-size: 16px;
      margin-right: 15px;
    }
  }
}

@media (max-width: 480px) {
  .job-header {
    margin-bottom: 8px;
    
    .job-description {
      font-size: 14px;
      margin-right: 10px;
    }
  }
}

.images-container {
  display: flex;
  align-items: center;
  position: relative;
  width: 90px;
  margin-top: 30px;
}

/* Responsive styles for images */
@media (max-width: 768px) {
  .images-container {
    width: 70px;
    margin-top: 20px;
  }
}

@media (max-width: 480px) {
  .images-container {
    width: 60px;
    margin-top: 15px;
  }
}

.job-owner-img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  position: absolute;
  right: 0;
}

.job-worker-img {
  width: 65px;
  height: 65px;
  border-radius: 50%;
  position: absolute;
  left: 0;
  z-index: 1;
}

/* Responsive styles for profile images */
@media (max-width: 768px) {
  .job-owner-img {
    width: 50px;
    height: 50px;
  }
  
  .job-worker-img {
    width: 55px;
    height: 55px;
  }
}

@media (max-width: 480px) {
  .job-owner-img {
    width: 40px;
    height: 40px;
  }
  
  .job-worker-img {
    width: 45px;
    height: 45px;
  }
}

.job-body {
  display: flex;
  flex-direction: column;
  text-align: left;
  margin-bottom: 12px;
  gap: 5px;

  .job-body-item {
    color: #666;
    font-size: 14px;
    margin-bottom: 3px;
    display: flex;
    gap: 5px;
  }
}

/* Responsive styles for job body */
@media (max-width: 768px) {
  .job-body {
    margin-bottom: 10px;
    gap: 3px;
    
    .job-body-item {
      font-size: 12px;
    }
  }
}

@media (max-width: 480px) {
  .job-body {
    margin-bottom: 8px;
    gap: 2px;
    
    .job-body-item {
      font-size: 11px;
    }
  }
}

.job-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;

  &.budget {
    margin-top: 10px;
    justify-content: right;
  }
}

/* Responsive styles for job footer */
@media (max-width: 768px) {
  .job-footer {
    gap: 6px;
    
    &.budget {
      margin-top: 8px;
    }
  }
}

@media (max-width: 480px) {
  .job-footer {
    gap: 4px;
    
    &.budget {
      margin-top: 6px;
    }
  }
}

.budget-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.payment-status {
  color: #4caf50;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.job-budget {
  color: var(--base-dark-blue);
  font-weight: bold;
}

.offer-budget-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
}

.offer-budget {
  color: var(--base-light-blue);
  font-weight: 600;
  font-size: 14px;
}

.offer-status-chip {
  margin-top: 4px;
}

.client-payment-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
}

.payment-comparison-client {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.original-price {
  color: #6c757d;
  font-size: 14px;
  font-weight: 500;
  text-decoration: line-through;
}

.paid-price {
  color: var(--base-dark-blue);
  font-size: 16px;
  font-weight: 700;
}

.payment-status-chip {
  margin-top: 2px;
}

/* Responsive styles for offer info */
@media (max-width: 768px) {
  .offer-budget-info {
    gap: 3px;
  }
  
  .offer-budget {
    font-size: 13px;
  }
  
  .client-payment-info {
    gap: 4px;
  }
  
  .original-price {
    font-size: 13px;
  }
  
  .paid-price {
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .offer-budget-info {
    gap: 2px;
  }
  
  .offer-budget {
    font-size: 12px;
  }
  
  .client-payment-info {
    gap: 3px;
  }
  
  .original-price {
    font-size: 12px;
  }
  
  .paid-price {
    font-size: 14px;
  }
}

/* Budget and counters layout */
.budget-and-counters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.job-counters {
  display: flex;
  gap: 12px;
  align-items: center;
}

.counter {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: rgba(42, 43, 71, 0.1);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--base-dark-blue);
}

.counter span {
  line-height: 1;
}

/* Responsive styles for job budget */
@media (max-width: 768px) {
  .job-budget {
    font-size: 14px;
  }
  
  .payment-status {
    font-size: 11px;
  }
  
  .job-counters {
    gap: 8px;
  }
  
  .counter {
    padding: 3px 6px;
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .job-budget {
    font-size: 12px;
  }
  
  .payment-status {
    font-size: 10px;
  }
  
  .job-counters {
    gap: 6px;
  }
  
  .counter {
    padding: 2px 5px;
    font-size: 10px;
  }
}
</style>
