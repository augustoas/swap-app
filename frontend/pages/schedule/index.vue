<template>
  <div class="job-list-container">
    <!-- Header with filters button -->
    <div class="filter-container">
      <h2>{{ isSwapperMode ? 'Agenda Swapper' : 'Agenda Cliente' }}</h2>
      <v-icon class="filter-button" icon @click="showFilterDialog = true">mdi-filter-variant</v-icon>
    </div>

    <!-- Filter dialog -->
    <ScheduleFilter
      v-model="showFilterDialog"
      @apply-filters="handleFilters"
    />

    <!-- Client Agenda View -->
    <div v-if="!isSwapperMode">
      <!-- Tabs for different job statuses -->
      <v-tabs
        v-model="activeTab"
        bg-color="transparent"
        color="var(--base-dark-blue)"
        grow
      >
        <v-tab value="published">Publicadas</v-tab>
        <v-tab value="confirmed">Confirmadas</v-tab>
        <v-tab value="finished">Finalizadas</v-tab>
      </v-tabs>

      <v-window v-model="activeTab" class="mt-4">
        <!-- Published Jobs Tab -->
        <v-window-item value="published">
          <div v-if="getPublishedJobs.length > 0">
            <JobsJobCard
              v-for="job in getSortedPublishedJobs"
              :key="job.id"
              :job="job"
              :onClick="() => goToJobDetail(job.id)"
            >
              <template v-slot:card-tags>
                <BaseTag 
                  v-if="job.offers && job.offers.length > 0 && job.offers.some(offer => !offer.is_read)"
                  tag="Nueva oferta" 
                  type="offer" 
                />
                <BaseTag 
                  v-if="job.questions && hasUnreadQuestions(job)"
                  tag="Nueva pregunta" 
                  type="question" 
                />
              </template>
            </JobsJobCard>
          </div>
          <div v-else class="empty-tab-message">
            <p>No hay tareas publicadas</p>
          </div>
        </v-window-item>

        <!-- Confirmed Jobs Tab -->
        <v-window-item value="confirmed">
          <div v-if="getConfirmedJobs.length > 0">
            <JobsJobCard
              v-for="job in getConfirmedJobs"
              :key="job.id"
              :job="job"
              :onClick="() => goToJobDetail(job.id)"
              :showWorkerImage="true"
            />
          </div>
          <div v-else class="empty-tab-message">
            <p>No hay tareas confirmadas</p>
          </div>
        </v-window-item>

        <!-- Finished Jobs Tab -->
        <v-window-item value="finished">
          <div v-if="getFinishedJobs.length > 0">
            <JobsJobCard
              v-for="job in getFinishedJobs"
              :key="job.id"
              :job="job"
              :onClick="() => goToJobDetail(job.id)"
              :showWorkerImage="true"
            />
          </div>
          <div v-else class="empty-tab-message">
            <p>No hay tareas finalizadas</p>
          </div>
        </v-window-item>
      </v-window>
    </div>

    <!-- Swapper Agenda View -->
    <div v-else>
      <!-- Check if user is a swapper -->
      <div v-if="isSwapper">
        <!-- Tabs for Swapper view -->
        <v-tabs
          v-model="swapperActiveTab"
          bg-color="transparent"
          color="var(--base-dark-blue)"
          grow
        >
          <v-tab value="offered">Ofertas Hechas</v-tab>
          <v-tab value="confirmed">Confirmadas</v-tab>
          <v-tab value="finished">Finalizadas</v-tab>
        </v-tabs>

        <v-window v-model="swapperActiveTab" class="mt-4">
          <!-- Pending Offers Tab -->
          <v-window-item value="offered">
            <div v-if="getPendingOffers.length > 0">
              <JobsJobCard
                v-for="job in getPendingOffers"
                :key="job.id"
                :job="job"
                :onClick="() => goToJobDetail(job.id)"
              />
            </div>
            <div v-else class="empty-tab-message">
              <p>No hay ofertas pendientes</p>
            </div>
          </v-window-item>

          <!-- Accepted Offers Tab -->
          <v-window-item value="confirmed">
            <div v-if="getAcceptedOffers.length > 0">
              <JobsJobCard
                v-for="job in getAcceptedOffers"
                :key="job.id"
                :job="job"
                :onClick="() => goToJobDetail(job.id)"
              />
            </div>
            <div v-else class="empty-tab-message">
              <p>No hay ofertas aceptadas</p>
            </div>
          </v-window-item>

          <!-- Finished/Rejected Offers Tab -->
          <v-window-item value="finished">
            <div v-if="getFinishedOffers.length > 0">
              <JobsJobCard
                v-for="job in getFinishedOffers"
                :key="job.id"
                :job="job"
                :onClick="() => goToJobDetail(job.id)"
              />
            </div>
            <div v-else class="empty-tab-message">
              <p>No hay ofertas finalizadas</p>
            </div>
          </v-window-item>
        </v-window>
      </div>
      
      <!-- Not a swapper message -->
      <div v-else class="not-swapper-message">
        <p>No tienes acceso a la Agenda Swapper. Para acceder a estas funcionalidades, regístrate como Swapper.</p>
        <div class="mt-4">
          <NuxtLink to="/newswapper">
            <BaseButton text="Conviértete en Swapper" variant="primary" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { jobStatusMap } from '~/utils/mapKeys';
import dayjs from 'dayjs';
import JobRepository from '~/repositories/jobRepository';
import OfferRepository from '~/repositories/offerRepository';
import { useSwapperView } from '~/composables/useSwapperView';

const { $api } = useNuxtApp();
const jobRepository = new JobRepository($api);
const offerRepository = new OfferRepository($api);
const userStore = useUserStore();
const navigationStore = useNavigationStore();
const jobList = ref([]);
const userOffers = ref([]); // Array of offers made by the user
const swapperFinishedJobs = ref([]); // Array of finished jobs for swapper
const router = useRouter();

// Use the swapper view composable
const { isSwapper, isSwapperMode } = useSwapperView();

// Active tab states for each view
const activeTab = ref('published');
const swapperActiveTab = ref('offered');

// Mostrar el diálogo de filtros
const showFilterDialog = ref(false);

// Estado para los filtros aplicados
const appliedFilters = ref({
  status: ''
});

// Watch for changes in the view mode
watch(isSwapperMode, (newMode) => {
  // Reset to appropriate tab when switching views
  if (newMode) {
    swapperActiveTab.value = 'offered';
  } else {
    activeTab.value = 'published';
  }
});

// Function to refresh data
const refreshData = async () => {
  try {
    // Fetch regular jobs (as creator)
    const jobs = await jobRepository.findMyJobs();
    jobList.value = jobs.payload;
    
    // If user is a swapper, fetch offers they've made and finished jobs
    if (isSwapper.value) {
      const offers = await offerRepository.findMyOffers();
      userOffers.value = offers.payload || [];
      console.log('User offers refreshed:', userOffers.value);
      
      // Fetch finished jobs for swapper
      try {
        const finishedJobs = await jobRepository.findSwapperFinishedJobs();
        swapperFinishedJobs.value = finishedJobs.payload || [];
        console.log('Swapper finished jobs refreshed:', swapperFinishedJobs.value);
      } catch (error) {
        console.error('Error fetching swapper finished jobs:', error);
        swapperFinishedJobs.value = [];
      }
    }
  } catch (error) {
    console.error('Error fetching jobs:', error);
  }
};

// Watch for route query changes to refresh when coming back from job detail
watch(() => router.currentRoute.value.query.redirect, (newRedirect, oldRedirect) => {
  if (newRedirect === '/schedule') {
    // User came back from job detail, refresh data
    console.log('Detected return from job detail, refreshing data...');
    refreshData();
  }
});

// Navegar al detalle del trabajo
const goToJobDetail = (jobId) => {
  router.push({ path: `/jobs/${jobId}`, query: { redirect: '/schedule' } });
};

// Aplicar los filtros desde el componente de diálogo
const handleFilters = (filters) => {
  appliedFilters.value = filters;
  
  // Update active tab based on filter if status is specified
  if (filters.status === 'Activas') {
    activeTab.value = 'published';
  } else if (filters.status === 'Confirmadas') {
    if (isSwapperMode.value) {
      swapperActiveTab.value = 'confirmed';
    } else {
      activeTab.value = 'confirmed';
    }
  } else if (filters.status === 'Finalizadas') {
    if (isSwapperMode.value) {
      swapperActiveTab.value = 'finished';
    } else {
      activeTab.value = 'finished';
    }
  } else if (filters.status === 'Ofertas Hechas' && isSwapper.value && isSwapperMode.value) {
    swapperActiveTab.value = 'offered';
  }
};

// Regular User View - Computed Properties
const getPublishedJobs = computed(() => {
  return jobList.value.filter(job => job.status === jobStatusMap.PUBLISHED);
});

const getSortedPublishedJobs = computed(() => {
  return getPublishedJobs.value.sort((a, b) => {
    const aHasUnreadOffers = a.offers && a.offers.length > 0 && a.offers.some(offer => !offer.is_read);
    const bHasUnreadOffers = b.offers && b.offers.length > 0 && b.offers.some(offer => !offer.is_read);
    
    if (aHasUnreadOffers && !bHasUnreadOffers) return -1;
    if (!aHasUnreadOffers && bHasUnreadOffers) return 1;
    
    // If both have same offer status, sort by date
    const dateA = dayjs(a.createdDate);
    const dateB = dayjs(b.createdDate);
    return dateB.diff(dateA);
  });
});

const getConfirmedJobs = computed(() => {
  return jobList.value.filter(job => job.status === jobStatusMap.CONFIRMED);
});

const getFinishedJobs = computed(() => {
  return jobList.value.filter(job => job.status === jobStatusMap.FINISHED);
});

// Swapper View - Computed Properties (filtered by offer status, not job status)
const getPendingOffers = computed(() => {
  return userOffers.value
    .filter(offer => offer.status === 'pending')
    .map(offer => ({
      ...offer.job, // Extract job data
      offerInfo: {
        id: offer.id,
        text: offer.text,
        budget: offer.budget,
        status: offer.status,
        createdDate: offer.createdDate
      }
    }));
});

const getAcceptedOffers = computed(() => {
  return userOffers.value
    .filter(offer => offer.status === 'accepted')
    .map(offer => ({
      ...offer.job, // Extract job data
      offerInfo: {
        id: offer.id,
        text: offer.text,
        budget: offer.budget,
        status: offer.status,
        createdDate: offer.createdDate
      }
    }));
});

const getFinishedOffers = computed(() => {
  // Combine finished jobs and rejected/cancelled offers
  const finishedJobs = swapperFinishedJobs.value.map(job => ({
    ...job,
    offerInfo: {
      id: job.acceptedOffer?.id || '',
      text: job.acceptedOffer?.text || '',
      budget: job.acceptedOffer?.budget || job.budget,
      status: 'finished', // Mark as finished for display
      createdDate: job.acceptedOffer?.createdDate || job.createdDate
    }
  }));
  
  const rejectedOffers = userOffers.value
    .filter(offer => ['rejected', 'cancelled'].includes(offer.status))
    .map(offer => ({
      ...offer.job, // Extract job data
      offerInfo: {
        id: offer.id,
        text: offer.text,
        budget: offer.budget,
        status: offer.status,
        createdDate: offer.createdDate
      }
    }));
  
  // Return combined array, with finished jobs first
  return [...finishedJobs, ...rejectedOffers];
});

// Helper function to check for unanswered questions
const hasUnansweredQuestions = (job) => {
  if (!job.questions || !Array.isArray(job.questions)) {
    return false;
  }
  
  return job.questions.some(question => 
    !question.replies || question.replies.length === 0
  );
};

// Helper function to check for unread questions
const hasUnreadQuestions = (job) => {
  if (!job.questions || !Array.isArray(job.questions)) {
    return false;
  }
  
  return job.questions.some(question => !question.is_read);
};

// Initialize data on mount
onMounted(refreshData);
</script>

<style lang="scss" scoped>
.job-list-container {
  padding: 0 25px;
  margin-top: 20px;
}

.job-section-title {
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 600;
}

.filter-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 20px;
  margin-top: 20px;
}

.filter-button {
  margin-bottom: 0px;
}

.divider {
  margin-bottom: 20px;
  opacity: 0.8;
  width: 100%;
}

.disclaimer {
  font-size: 14px;
  margin-bottom: 20px;
}

.validate-link {
  color: var(--base-dark-blue);
  font-weight: bold;
  cursor: pointer;
  text-decoration: underline;
}

.empty-tab-message {
  text-align: center;
  padding: 20px;
  color: #666;
}

.not-swapper-message {
  text-align: center;
  padding: 40px 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-top: 20px;
  
  p {
    color: #555;
    margin-bottom: 10px;
  }
}

.w-100 {
  width: 100%;
}
</style>
