<template>
  <div class="job-list-container">
    <!-- Header con botón de filtros -->
    <div class="filter-container">
      <h2>Trabajos disponibles</h2>
      <v-btn
        variant="outlined"
        @click="showFilterDialog = true"
        class="filter-button"
        size="small"
      >
        <v-icon start>mdi-filter-variant</v-icon>
        Filtros
        <v-badge
          v-if="activeFiltersCount > 0"
          :content="activeFiltersCount"
          color="error"
          offset-x="-10"
          offset-y="-10"
        />
      </v-btn>
    </div>

    <!-- Filtros aplicados -->
    <div v-if="activeFiltersCount > 0" class="applied-filters">
      <v-chip
        v-if="appliedFilters.publishedDate !== 'all'"
        color="primary"
        closable
        size="small"
        @click:close="removeFilter('publishedDate')"
      >
        {{ getPublishedDateLabel(appliedFilters.publishedDate) }}
      </v-chip>
      <v-chip
        v-if="appliedFilters.isRemote !== 'all'"
        color="primary"
        closable
        size="small"
        @click:close="removeFilter('isRemote')"
      >
        {{ getRemoteLabel(appliedFilters.isRemote) }}
      </v-chip>
             <v-chip
         v-if="appliedFilters.priceMin || appliedFilters.priceMax"
         color="primary"
         closable
         size="small"
         @click:close="removeFilter('price')"
       >
         {{ getPriceRangeLabel() }}
       </v-chip>
       <v-chip
         v-if="appliedFilters.dateFrom || appliedFilters.dateTo"
         color="primary"
         closable
         size="small"
         @click:close="removeFilter('date')"
       >
         {{ getDateRangeLabel() }}
       </v-chip>
    </div>

    <!-- Sidebar de filtros -->
    <JobsJobFilter
      v-model="showFilterDialog"
      @apply-filters="handleFilters"
    />
    <div v-if="jobList.length === 0">
      <p>No hay trabajos disponibles</p>
    </div>
    <div v-else>
      <JobsJobCard
        v-for="job in sortedJobList"
        :key="job.id"
        :job="job"
        :onClick="() => goToJobDetail(job.id)"
      >
        <template v-slot:card-tags>
          <!-- Debug info for job tag checking -->
          <div v-if="currentUser?.id" style="font-size: 10px; color: red; margin-bottom: 4px;">
            Job {{ job.id }}: {{ hasUserOfferedToJob(job.id) ? '✅ HAS OFFER' : '❌ NO OFFER' }}
          </div>
          
          <BaseTag v-if="hasUserOfferedToJob(job.id)" tag="Ya ofertaste" type="offered" />
          <BaseTag v-if="isPublishedToday(job)" tag="Publicada hoy" type="today" />
          <BaseTag 
            v-if="getJobCategory(job)" 
            :tag="getJobCategory(job)" 
            type="category" 
          />
        </template>
      </JobsJobCard>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { formatDate, formatCurrency } from '~/utils/utils';
import { jobStatusMap, dateTypeMap } from '~/utils/mapKeys';
import dayjs from 'dayjs';
import JobRepository from '~/repositories/jobRepository';
import OfferRepository from '~/repositories/offerRepository';
import { useUserStore } from '~/stores/userStore';

const { $api } = useNuxtApp();
const jobRepository = new JobRepository($api);
const offerRepository = new OfferRepository($api);
const jobList = ref([]);
const userOffers = ref([]);
const router = useRouter();
const userStore = useUserStore();
const currentUser = computed(() => userStore.getUser());

// Mostrar el diálogo de filtros
const showFilterDialog = ref(false);

// Estado para los filtros aplicados
const appliedFilters = ref({
  publishedDate: 'all',
  isRemote: 'all',
  priceMin: null,
  priceMax: null,
  dateFrom: null,
  dateTo: null
});

// Computed para contar filtros activos
const activeFiltersCount = computed(() => {
  let count = 0;
  if (appliedFilters.value.publishedDate !== 'all') count++;
  if (appliedFilters.value.isRemote !== 'all') count++;
  if (appliedFilters.value.priceMin || appliedFilters.value.priceMax) count++;
  if (appliedFilters.value.dateFrom || appliedFilters.value.dateTo) count++;
  return count;
});

// Function to get the first category of a job
const getJobCategory = (job) => {
  if (job.jobCategories && job.jobCategories.length > 0) {
    return job.jobCategories[0].category.name;
  }
  return null;
};

// Function to check if a job was published today
const isPublishedToday = (job) => {
  if (!job.createdDate) return false;
  const jobDate = dayjs(job.createdDate);
  const today = dayjs();
  return jobDate.isSame(today, 'day');
};

// Function to check if user already made an offer to a specific job
const hasUserOfferedToJob = (jobId) => {
  console.log('=== CHECKING OFFER FOR JOB ===');
  console.log('Job ID:', jobId);
  console.log('Current user:', currentUser.value?.id);
  console.log('User offers:', userOffers.value);
  console.log('User offers length:', userOffers.value.length);
  
  if (!currentUser.value?.id || !userOffers.value.length) {
    console.log('❌ No user or no offers');
    return false;
  }
  
  const hasOffer = userOffers.value.some(offer => {
    const offerJobId = offer.jobId || offer.job?.id;
    const match = String(offerJobId) === String(jobId);
    console.log(`Offer ${offer.id}: jobId=${offerJobId}, match=${match}`);
    return match;
  });
  
  console.log('Final result:', hasOffer);
  console.log('=============================');
  return hasOffer;
};

// Helper functions for filter labels
const getPublishedDateLabel = (value) => {
  const labels = {
    today: 'Hoy',
    '3days': 'Últimos 3 días',
    week: 'Última semana',
    month: 'Último mes'
  };
  return labels[value] || '';
};

const getRemoteLabel = (value) => {
  const labels = {
    online: 'Online',
    offline: 'Presencial'
  };
  return labels[value] || '';
};

const getPriceRangeLabel = () => {
  const min = appliedFilters.value.priceMin ? `$${parseInt(appliedFilters.value.priceMin).toLocaleString()}` : '$0';
  const max = appliedFilters.value.priceMax ? `$${parseInt(appliedFilters.value.priceMax).toLocaleString()}` : 'Sin límite';
  return `${min} - ${max}`;
};

const getDateRangeLabel = () => {
  if (!appliedFilters.value.dateFrom && !appliedFilters.value.dateTo) return '';
  
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  };
  
  const from = formatDate(appliedFilters.value.dateFrom) || 'Sin límite';
  const to = formatDate(appliedFilters.value.dateTo) || 'Sin límite';
  
  return `${from} - ${to}`;
};

// Function to remove individual filters
const removeFilter = (filterType) => {
  switch(filterType) {
    case 'publishedDate':
      appliedFilters.value.publishedDate = 'all';
      break;
    case 'isRemote':
      appliedFilters.value.isRemote = 'all';
      break;
    case 'price':
      appliedFilters.value.priceMin = null;
      appliedFilters.value.priceMax = null;
      break;
    case 'date':
      appliedFilters.value.dateFrom = null;
      appliedFilters.value.dateTo = null;
      break;
  }
};

// Function to check if job matches published date filter
const matchesPublishedDateFilter = (job) => {
  if (appliedFilters.value.publishedDate === 'all') return true;
  
  const jobDate = dayjs(job.createdDate);
  const now = dayjs();
  
  switch(appliedFilters.value.publishedDate) {
    case 'today':
      return jobDate.isSame(now, 'day');
    case '3days':
      return jobDate.isAfter(now.subtract(3, 'days'));
    case 'week':
      return jobDate.isAfter(now.subtract(1, 'week'));
    case 'month':
      return jobDate.isAfter(now.subtract(1, 'month'));
    default:
      return true;
  }
};

// Function to check if job matches price filter
const matchesPriceFilter = (job) => {
  const jobBudget = job.accepted_budget || job.budget;
  
  if (appliedFilters.value.priceMin && jobBudget < appliedFilters.value.priceMin) {
    return false;
  }
  
  if (appliedFilters.value.priceMax && jobBudget > appliedFilters.value.priceMax) {
    return false;
  }
  
  return true;
};

// Function to check if job matches date filter
const matchesDateFilter = (job) => {
  if (!appliedFilters.value.dateFrom && !appliedFilters.value.dateTo) return true;
  if (!job.date) return false;
  
  const jobDate = dayjs(job.date);
  
  if (appliedFilters.value.dateFrom) {
    const fromDate = dayjs(appliedFilters.value.dateFrom);
    if (jobDate.isBefore(fromDate, 'day')) {
      return false;
    }
  }
  
  if (appliedFilters.value.dateTo) {
    const toDate = dayjs(appliedFilters.value.dateTo);
    if (jobDate.isAfter(toDate, 'day')) {
      return false;
    }
  }
  
  return true;
};

// Fetch the job list when the component is mounted
onMounted(async () => {
  try {
    const jobs = await jobRepository.findAll();
    jobList.value = jobs.payload.filter(job => job.status === jobStatusMap.PUBLISHED);
    
    // Fetch user offers if user is logged in
    if (currentUser.value?.id) {
      console.log('🔍 Fetching user offers for user:', currentUser.value.id);
      try {
        const userOffersResponse = await offerRepository.findMyOffers();
        userOffers.value = userOffersResponse.payload || [];
        console.log('✅ User offers loaded:', userOffers.value);
        console.log('Total user offers:', userOffers.value.length);
      } catch (error) {
        console.error('❌ Error fetching user offers:', error);
      }
    } else {
      console.log('❌ No current user, skipping offers fetch');
    }
  } catch (error) {
    console.error('Error fetching job list:', error);
  }
});

const truncatedDescription = (description) => {
  return description.length > 50 ? description.slice(0, 50) + '...' : description;
};

// Map the job status to a readable string
const jobStatusText = (status) => {
  return {
    [jobStatusMap.PUBLISHED]: 'Activa',
  }[status] || 'Desconocido';
};

// Navegar al detalle del trabajo
const goToJobDetail = (jobId) => {
  console.log('GO TO JOB CLICK')
  console.log('jobList', jobList.value);
  console.log('jobId', jobId);
  router.push({ path: `/jobs/${jobId}`, query: { redirect: '/jobs' } });
};

// Aplicar los filtros desde el componente de diálogo
const handleFilters = (filters) => {
  appliedFilters.value = { ...filters };
};

// Computed property to filter and sort jobs
const filteredJobList = computed(() => {
  return jobList.value
    .filter(job => {
      // Filtrar por fecha de publicación
      if (!matchesPublishedDateFilter(job)) return false;
      
      // Filtrar por modalidad remoto/presencial
      if (appliedFilters.value.isRemote === 'online' && !job.is_remote) return false;
      if (appliedFilters.value.isRemote === 'offline' && job.is_remote) return false;
      
      // Filtrar por rango de precio
      if (!matchesPriceFilter(job)) return false;
      
      // Filtrar por fecha de entrega
      if (!matchesDateFilter(job)) return false;
      
      return true;
    })
});

// Ordenar los trabajos por fecha, de más reciente a más antiguo
const sortedJobList = computed(() => {
  return filteredJobList.value.sort((a, b) => {
    const dateA = dayjs(a.createdDate);
    const dateB = dayjs(b.createdDate);
    return dateB.diff(dateA); // Ordena de más reciente a más antiguo
  });
});
</script>

<style lang="scss" scoped>
.job-list-container {
  padding: 0 25px;
  margin-top: 20px;
}

.jobs-list {
  display: flex;
  flex-direction: column;
}

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

.job-owner-img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
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

/* Responsive styles for mobile */
@media (max-width: 768px) {
  .job-footer {
    gap: 6px;
  }
}

@media (max-width: 480px) {
  .job-footer {
    gap: 4px;
  }
}

.job-budget {
  color: var(--base-dark-blue);
  font-weight: bold;
}

.filter-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  margin-top: 20px;
}

.filter-button {
  border-color: var(--base-dark-blue) !important;
  color: var(--base-dark-blue) !important;
  
  &:hover {
    background-color: var(--base-dark-blue) !important;
    color: white !important;
  }
}

.applied-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

// Responsive adjustments
@media (max-width: 768px) {
  .filter-container {
    flex-direction: column;
    gap: 16px;
    align-items: center;
    
    h2 {
      text-align: center;
      margin: 0;
    }
  }
  
  .applied-filters {
    padding: 12px;
    margin-bottom: 16px;
  }
}

@media (max-width: 480px) {
  .applied-filters {
    padding: 8px;
    gap: 6px;
  }
}
</style>
