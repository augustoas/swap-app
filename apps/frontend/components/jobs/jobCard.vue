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
      <!-- Normal budget display -->
      <span v-else class="job-budget">
        {{ job.accepted_budget ? `Pagado: ${formatCurrency(job.accepted_budget)}` : formatCurrency(job.budget) }}
      </span>
    </div>
  </div>
</template>

<script setup>
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

/* Responsive styles for offer info */
@media (max-width: 768px) {
  .offer-budget-info {
    gap: 3px;
  }
  
  .offer-budget {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .offer-budget-info {
    gap: 2px;
  }
  
  .offer-budget {
    font-size: 12px;
  }
}

/* Responsive styles for job budget */
@media (max-width: 768px) {
  .job-budget {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .job-budget {
    font-size: 12px;
  }
}
</style>
