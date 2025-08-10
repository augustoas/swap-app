<template>
  <div class="job-detail-page" v-if="job">
    <!-- Status Bar -->
    <div class="status-bar">
      <button class="close-button" @click="redirectBack"><v-icon>mdi-chevron-left</v-icon></button>
      <!-- Edit Button - Only visible to job creator -->
      <button v-if="isJobCreator && !isEditMode" class="edit-button" @click="enableEditMode">
        <v-icon>mdi-pencil</v-icon>
      </button>
    </div>

    <!-- Job Info Section -->
    <div class="job-info">
      <!-- Edit Mode -->
      <div v-if="isEditMode" class="edit-form">
        <div class="edit-header">
          <h2 class="edit-title">Editar Tarea</h2>
        </div>

        <div class="edit-fields">
          <!-- Job Title -->
          <div class="edit-field">
            <label class="field-label">Título de la tarea</label>
            <v-text-field
              v-model="editData.description"
              variant="outlined"
              density="comfortable"
              color="var(--base-light-blue)"
              counter="100"
              maxlength="100"
            />
          </div>

          <!-- Job Details -->
          <div class="edit-field">
            <label class="field-label">Descripción detallada</label>
            <v-textarea
              v-model="editData.details"
              variant="outlined"
              density="comfortable"
              color="var(--base-light-blue)"
              rows="4"
              counter="500"
              maxlength="500"
            />
          </div>

          <!-- Budget -->
          <div class="edit-field">
            <label class="field-label">Presupuesto</label>
            <v-text-field
              v-model="editData.formattedBudget"
              @input="formatEditBudget"
              variant="outlined"
              density="comfortable"
              color="var(--base-light-blue)"
              placeholder="Ej: 10.000"
              prepend-inner-icon="mdi-currency-usd"
              min="5000"
            />
            <span class="budget-disclaimer">* El precio final se podrá negociar con el candidato.</span>
          </div>

          <!-- Date Type -->
          <div class="edit-field">
            <label class="field-label">Tipo de fecha</label>
            <v-select
              v-model="editData.dateType"
              :items="dateTypeOptions"
              variant="outlined"
              density="comfortable"
              color="var(--base-light-blue)"
            />
          </div>

          <!-- Date -->
          <div class="edit-field" v-if="editData.dateType !== dateTypeMap.FLEXIBLE">
            <label class="field-label">Fecha</label>
            <v-text-field
              v-model="editData.date"
              variant="outlined"
              density="comfortable"
              color="var(--base-light-blue)"
              type="date"
            />
          </div>

          <!-- Remote/In-person -->
          <div class="edit-field">
            <label class="field-label">Modalidad</label>
            <v-select
              v-model="editData.is_remote"
              :items="modalityOptions"
              variant="outlined"
              density="comfortable"
              color="var(--base-light-blue)"
            />
          </div>

          <!-- Action Buttons -->
          <div class="edit-actions">
            <button class="cancel-button" @click="cancelEdit">
              <v-icon>mdi-close</v-icon>
              Cancelar
            </button>
            <button class="save-button" @click="saveJobEdit">
              <v-icon>mdi-check</v-icon>
              Guardar
            </button>
          </div>

          <!-- Address (only if not remote) -->
          <div v-if="!editData.is_remote" class="address-fields">
            <div class="edit-field">
              <label class="field-label">Dirección</label>
              <v-text-field
                v-model="editData.address"
                variant="outlined"
                density="comfortable"
                color="var(--base-light-blue)"
              />
            </div>
            <div class="edit-field">
              <label class="field-label">Comuna</label>
              <v-text-field
                v-model="editData.commune"
                variant="outlined"
                density="comfortable"
                color="var(--base-light-blue)"
              />
            </div>
            <div class="edit-field">
              <label class="field-label">Región</label>
              <v-text-field
                v-model="editData.region"
                variant="outlined"
                density="comfortable"
                color="var(--base-light-blue)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- View Mode -->
      <div v-else>
        <h1 class="job-title">{{ job.description.slice(0,50) }}</h1>
        <div class="job-details">
          <p class="job-details-descripction">{{ job.details }}</p>
          <p><strong>Publicada por:</strong> {{ fullName }}</p>
          <p v-if="job.dateType === dateTypeMap.ON_DATE"><strong>Para el día:</strong> {{ formatDate(job.date) }}</p>
          <p v-if="job.dateType === dateTypeMap.BEFORE_DATE"><strong>Para antes del día:</strong> {{ formatDate(job.date) }}</p>
          <p v-if="job.dateType === dateTypeMap.FLEXIBLE"><strong>Por coordinar</strong> {{ formatDate(job.date) }}</p>
          <p v-if="!job.is_remote"><strong>Dirección:</strong> {{ fullAddress }}</p>
          <p v-if="job.is_remote"><strong>Tarea remota</strong></p>

          <!-- Categories Section -->
          <div v-if="job.jobCategories && job.jobCategories.length > 0" class="categories-section">
            <p><strong>Categorías:</strong></p>
            <div class="categories-container">
              <v-chip
                v-for="jobCategory in job.jobCategories"
                :key="jobCategory.id"
                class="category-chip"
                color="var(--base-light-blue)"
                variant="outlined"
              >
                {{ jobCategory.category.name }}
              </v-chip>
            </div>
          </div>
          
          <!-- Media Gallery Section -->
          <BaseMediaGallery 
            v-if="job.images && job.images.length > 0"
            :media="job.images"
            title="Archivos adjuntos"
            @download-error="handleDownloadError"
          />
        </div>
      </div>
    </div>

    <!-- Task Budget -->
    <div class="task-budget-container" v-if="!isEditMode">
      <h2 class="budget-amount">{{ formatCurrency(job.budget) }}</h2>
      
      <!-- Show finish job button for job creator when job is confirmed -->
      <div v-if="canFinishJob" class="finish-job-section">
        <v-btn
          class="text-none text-subtitle-1"
          size="large"
          rounded="lg"
          color="success"
          style="color: white"
          @click="handleFinishJob"
        >
          Terminar Trabajo
        </v-btn>
        <p class="finish-job-disclaimer">
          Una vez terminado, el trabajo pasará a estado finalizado.
        </p>
      </div>

      <!-- Show payment info for swapper when job is confirmed -->
      <div v-else-if="isSwapperViewingConfirmedJob" class="swapper-payment-info">
        <div class="payment-comparison">
          <div class="original-budget">
            <span class="budget-label">Precio original:</span>
            <span class="budget-amount-small">{{ formatCurrency(job.budget) }}</span>
          </div>
          <div class="accepted-budget">
            <span class="budget-label">Tu oferta aceptada:</span>
            <span class="budget-amount-highlight">{{ formatCurrency(currentUserOffer?.budget || job.accepted_budget) }}</span>
          </div>
        </div>
        <div class="payment-guarantee">
          <p class="guarantee-text">
            💰 El dinero lo tenemos en Swap, no te preocupes que tu trabajo será remunerado.
          </p>
          <p class="guarantee-subtext">
            Una vez que el cliente confirme que el trabajo está completado, recibirás el pago automáticamente.
          </p>
        </div>
      </div>
      
            <!-- Show simple offer info if user already made an offer -->
      <div v-else-if="!isJobCreator && hasUserMadeOffer" class="simple-offer-info">
        <p class="offer-label">Oferta ya realizada:</p>
        <p class="offer-value">{{ formatCurrency(currentUserOffer.budget) }}</p>
        <v-dialog v-model="showCancelDialog" transition="dialog-transition">
          <template v-slot:activator="{ props: activatorProps }">
            <v-btn
              variant="outlined"
              color="error"
              size="small"
              v-bind="activatorProps"
              class="cancel-offer-btn"
            >
              Cancelar oferta
            </v-btn>
          </template>
          <template v-slot:default="{ isActive }">
            <BaseModal
              @accept="confirmCancelOffer"
              @decline="showCancelDialog = false"
              title="¿Cancelar oferta?"
              message="¿Estás seguro que deseas cancelar tu oferta? Esta acción no se puede deshacer."
              acceptText="Cancelar oferta"
              declineText="Mantener oferta"
              :isLoading="isCancellingOffer"
            />
          </template>
        </v-dialog>
      </div>
      
      <!-- Show make offer button if user hasn't made an offer yet -->
      <v-dialog v-else-if="!isJobCreator" transition="dialog-bottom-transition">
        <template v-slot:activator="{ props: activatorProps }">
          <v-btn
            class="text-none text-subtitle-1"
            size="large"
            rounded="lg"
            :color="'var(--base-dark-blue)'"
            style="color: white"
            :text="'Hacer Oferta'" 
            v-bind="activatorProps">
          </v-btn>
        </template>
        <template v-slot:default="{ isActive }">
          <OffersCreateOfferModal 
            v-if="showSwapperView" 
            @close="isActive.value = false" 
            @offer-created="handleOfferCreated"
            :job_id="job.id" 
          />
          <OffersBecomeASwapperModal v-else @close="isActive.value = false" />
        </template>
      </v-dialog>
    </div>

    <!-- Tabs Section for Job Creator -->
    <div v-if="isJobCreator && !isEditMode">
      <v-tabs v-model="activeTab" color="var(--base-dark-blue)">
        <v-tab value="questions">Preguntas ({{ formattedQuestions.length }})</v-tab>
        <v-tab value="offers">Ofertas ({{ formattedOffers.length }})</v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <v-window-item value="questions">
          <!-- Questions Section -->
          <div class="questions-section">
            <div v-if="!formattedQuestions.length" class="no-questions">
              No hay preguntas todavía
            </div>
            <div v-else v-for="question in formattedQuestions" :key="question.id" class="question-card">
              <JobsJobQuestion :question="question"/>
              <!-- Replies Section -->
              <div class="replies-section">
                <JobsQuestionReply :question="question" />
              </div>
              <span class="reply-link" @click="toggleReplyInput(question.id)">
                Responder
              </span>
              <div v-if="showReplyInputs[question.id] && !isSubmittingReply" class="reply-input-container">
                <v-text-field
                  v-model="question.replyText"
                  label="Escribe tu respuesta"
                  variant="outlined"
                  density="compact"
                  append-inner-icon="mdi-send"
                  @click:append-inner="handleReplySubmit(question)"
                  :error="!!replyErrors[question.id]"
                  :error-messages="replyErrors[question.id]"
                  :class="{ 'valid-reply': isReplyValid(question.replyText) }"
                />
              </div>
              <div v-if="isSubmittingReply && showReplyInputs[question.id]" class="reply-loading">
                <v-progress-circular indeterminate color="var(--base-light-blue)"></v-progress-circular>
              </div>
            </div>
          </div>
        </v-window-item>

        <v-window-item value="offers">
          <div class="offers-section">
            <div v-if="!formattedOffers.length" class="no-offers">
              No hay ofertas todavía
            </div>
            <div v-else v-for="offer in formattedOffers" :key="offer.id">
              <JobsJobOffers 
                :offer="offer"
                :job-description="job.description"
                @offer-accepted="handleAcceptOffer"
                @offer-declined="handleDeclineOffer"
              />
            </div>
          </div>
        </v-window-item>
      </v-window>
    </div>

    <!-- Regular Questions Section for non-creators -->
    <div v-else-if="!isEditMode" class="questions-section">
      <h3 id="questions-section-title">Preguntas</h3>
      <div v-if="!formattedQuestions.length" class="no-questions">
        No hay preguntas todavía
      </div>
      <div v-else v-for="question in formattedQuestions" :key="question.id" class="question-card">
        <JobsJobQuestion :question="question" />
        <!-- Replies Section -->
        <div class="replies-section">
          <JobsQuestionReply :question="question" :reply="reply"/>
        </div>
      </div>

      <!-- New Question Input -->
      <div class="new-question-container">
        <span class="question-disclaimer">
          Pregunta lo que necesites saber al creador de la tarea.
        </span>
        <v-text-field
          type="text"
          variant="outlined"
          v-model="newQuestion"
          placeholder="Escribe tu pregunta (mínimo 10 caracteres)"
          color="var(--base-light-blue)"
          append-inner-icon="mdi-send"
          @click:append-inner="handleQuestionSubmit"
          :error="!!questionError"
          :error-messages="questionError"
          :class="{ 'valid-question': isQuestionValid(newQuestion) }"
        />
        <div v-if="isSubmittingQuestion" class="reply-loading">
          <v-progress-circular indeterminate color="var(--base-light-blue)"></v-progress-circular>
        </div>
      </div>
    </div>

    <!-- Edit Confirmation Modal -->
    <v-dialog v-model="showEditConfirmModal" width="auto" persistent>
      <BaseModal
        title="Confirmar Edición"
        :message="getEditConfirmMessage()"
        accept-text="Sí, continuar"
        decline-text="Cancelar"
        @accept="confirmSaveEdit"
        @decline="cancelEditConfirmation"
      >
        <template #message-input>
          <v-alert
            type="warning"
            variant="tonal"
            class="edit-warning-alert"
          >
            <div>
              <strong>¡Atención!</strong>
              <p class="alert-text">Al modificar cualquier campo de esta tarea, todas las ofertas actuales serán automáticamente rechazadas.</p>
              <p v-if="formattedOffers.length > 0" class="alert-text">
                Actualmente tienes <strong>{{ formattedOffers.length }} oferta{{ formattedOffers.length > 1 ? 's' : '' }}</strong> que será{{ formattedOffers.length > 1 ? 'n' : '' }} rechazada{{ formattedOffers.length > 1 ? 's' : '' }}.
              </p>
            </div>
          </v-alert>
        </template>
      </BaseModal>
    </v-dialog>

    <!-- Finish Job Confirmation Modal -->
    <v-dialog v-model="showFinishJobModal" width="auto" persistent>
      <BaseModal
        title="¿Terminar trabajo?"
        message="¿Estás seguro que el trabajo ha sido completado y deseas marcarlo como finalizado?"
        accept-text="Sí, terminar"
        decline-text="Cancelar"
        :is-loading="isFinishingJob"
        @accept="confirmFinishJob"
        @decline="cancelFinishJob"
      >
        <template #terms-link>
          <p class="finish-job-warning">
            Una vez marcado como finalizado, el trabajo pasará a la sección "Finalizadas" en tu agenda y no podrá ser modificado.
          </p>
        </template>
      </BaseModal>
    </v-dialog>

  </div>
</template>

<script setup>
import dayjs from 'dayjs';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import JobRepository from '~/repositories/jobRepository';
import OfferRepository from '~/repositories/offerRepository';
import ReplyRepository from '~/repositories/replyRepository';
import QuestionRepository from '~/repositories/questionRepository';
import BaseModal from '~/components/base/modal.vue';
import BaseMediaGallery from '~/components/base/MediaGallery.vue';
import { dateTypeMap } from '~/utils/mapKeys';
import { formatDate, formatCurrency } from '~/utils/utils';
import { useUserStore } from '~/stores/userStore';
import { useNavigationStore } from '~/stores/navigationStore';
import { useAlertStore } from '~/stores/alertStore';
import { useSwapperView } from '~/composables/useSwapperView';

const userStore = useUserStore();
const navigationStore = useNavigationStore();
const { showSwapperView } = useSwapperView();
const { $api } = useNuxtApp();
const router = useRouter();
const route = useRoute();

const activeTab = ref('questions');

const jobRepository = new JobRepository($api);
const offerRepository = new OfferRepository($api);
const replyRepository = new ReplyRepository($api);
const questionRepository = new QuestionRepository($api);
const jobId = route.params.id;
const job = ref(null);
const currentUser = userStore.getUser;
const questions = ref([]);
const offers = ref([]);
const userOffers = ref([]); // User's own offers across all jobs
const newQuestion = ref('');
const showReplyInputs = ref({});
const isSubmittingReply = ref(false);
const isSubmittingQuestion = ref(false);

const replyErrors = ref({});
const questionError = ref(null);

// Edit Mode State
const isEditMode = ref(false);
const editData = ref({});
const showEditConfirmModal = ref(false);

// Finish Job State
const showFinishJobModal = ref(false);
const isFinishingJob = ref(false);

// Cancel Offer State
const showCancelDialog = ref(false);
const isCancellingOffer = ref(false);

// Edit Mode Options
const dateTypeOptions = [
  { title: 'En una fecha específica', value: dateTypeMap.ON_DATE },
  { title: 'Antes de esta fecha', value: dateTypeMap.BEFORE_DATE },
  { title: 'Fecha flexible', value: dateTypeMap.FLEXIBLE }
];

const modalityOptions = [
  { title: 'Presencial', value: false },
  { title: 'Remoto', value: true }
];

// Format Currency Functions
const formatEditBudget = (event) => {
  const input = event.target.value;
  // Remove all non-digit characters
  const numericValue = input.replace(/\D/g, '');
  
  // Store raw budget for calculations
  editData.value.rawBudget = numericValue;
  
  if (numericValue) {
    // Format with thousands separator
    const formatted = parseInt(numericValue).toLocaleString('es-CL');
    editData.value.formattedBudget = formatted;
  } else {
    editData.value.formattedBudget = '';
  }
};

// Edit Mode Functions
const enableEditMode = () => {
  isEditMode.value = true;
  // Format the current budget for display
  const currentBudget = job.value.budget.toString();
  const formattedCurrentBudget = parseInt(currentBudget).toLocaleString('es-CL');
  
  // Initialize edit data with current job values
  editData.value = {
    description: job.value.description,
    details: job.value.details,
    budget: job.value.budget,
    rawBudget: currentBudget,
    formattedBudget: formattedCurrentBudget,
    dateType: job.value.dateType,
    date: job.value.date ? dayjs(job.value.date).format('YYYY-MM-DD') : '',
    is_remote: job.value.is_remote,
    address: job.value.address || '',
    commune: job.value.commune || '',
    region: job.value.region || ''
  };
};

const cancelEdit = () => {
  isEditMode.value = false;
  editData.value = {};
};

const saveJobEdit = () => {
  // Validate required fields first
  if (!validateEditForm()) {
    return;
  }
  
  // Show confirmation modal
  showEditConfirmModal.value = true;
};

const validateEditForm = () => {
  if (!editData.value.description.trim()) {
    alert('El título de la tarea es obligatorio');
    return false;
  }
  
  if (!editData.value.details.trim()) {
    alert('La descripción es obligatoria');
    return false;
  }
  
  const budget = parseInt(editData.value.rawBudget || '0');
  if (!budget || budget < 5000) {
    alert('El presupuesto debe ser mayor a $5.000');
    return false;
  }
  
  if (editData.value.dateType !== dateTypeMap.FLEXIBLE && !editData.value.date) {
    alert('La fecha es obligatoria para el tipo de fecha seleccionado');
    return false;
  }
  
  if (!editData.value.is_remote && (!editData.value.address.trim() || !editData.value.commune.trim() || !editData.value.region.trim())) {
    alert('La dirección completa es obligatoria para tareas presenciales');
    return false;
  }
  
  return true;
};

const cancelEditConfirmation = () => {
  showEditConfirmModal.value = false;
};

const getEditConfirmMessage = () => {
  return "¿Estás seguro de que deseas continuar con la edición?";
};

const confirmSaveEdit = () => {
  showEditConfirmModal.value = false;
  
  // Get the final budget value
  const finalBudget = parseInt(editData.value.rawBudget);
  
  // Console log for backend implementation
  console.log('=== SAVING JOB EDIT ===');
  console.log('Job ID:', jobId);
  console.log('Original Job Data:', job.value);
  console.log('Updated Job Data:', editData.value);
  console.log('Changes to save:', {
    jobId: jobId,
    description: editData.value.description,
    details: editData.value.details,
    budget: finalBudget,
    dateType: editData.value.dateType,
    date: editData.value.dateType !== dateTypeMap.FLEXIBLE ? editData.value.date : null,
    is_remote: editData.value.is_remote,
    address: editData.value.is_remote ? null : editData.value.address,
    commune: editData.value.is_remote ? null : editData.value.commune,
    region: editData.value.is_remote ? null : editData.value.region
  });
  console.log('Note: All current offers will be automatically rejected');
  console.log('=======================');

  // Simulate success and update local data
  Object.assign(job.value, {
    description: editData.value.description,
    details: editData.value.details,
    budget: finalBudget,
    dateType: editData.value.dateType,
    date: editData.value.dateType !== dateTypeMap.FLEXIBLE ? editData.value.date : job.value.date,
    is_remote: editData.value.is_remote,
    address: editData.value.is_remote ? null : editData.value.address,
    commune: editData.value.is_remote ? null : editData.value.commune,
    region: editData.value.is_remote ? null : editData.value.region
  });

  // Clear offers since they will be rejected
  offers.value = [];

  isEditMode.value = false;
  editData.value = {};
  
  // Show success message
  alert('Tarea actualizada exitosamente. Todas las ofertas anteriores han sido rechazadas.');
};

// Media handling
const alertStore = useAlertStore();

const handleDownloadError = (error) => {
  console.error('Error downloading media:', error);
  alertStore.setAlert('error', 'Error al descargar el archivo');
};

// Método para validar una respuesta específica
const isReplyValid = (text) => text.length >= 2;

// Método para validar una pregunta
const isQuestionValid = (text) => text.length >= 10;

// Fetch job and questions data
const fetchJobData = async () => {
  const response = await jobRepository.findOne(jobId.toString());
  job.value = response.payload;
  questions.value = job.value.questions || [];
  offers.value = job.value.offers || [];

  console.log('=== JOB DATA DEBUG ===');
  console.log('Job response:', response);
  console.log('Job offers (from job detail):', job.value?.offers);
  console.log('Current user:', currentUser);
  console.log('Is job creator:', job.value?.jobCreator?.id === currentUser.id);

  if (!job.value) {
    console.error(`Job with ID ${jobId} not found.`);
  }
};

// Fetch user's own offers to check if they made an offer to this job
const fetchUserOffers = async () => {
  if (!currentUser.id) {
    console.log('No current user, skipping offer check');
    return;
  }

  try {
    console.log('=== FETCHING USER OFFERS ===');
    const userOffersResponse = await offerRepository.findMyOffers();
    userOffers.value = userOffersResponse.payload || [];
    
    console.log('User offers response:', userOffersResponse);
    console.log('User offers array:', userOffers.value);
    console.log('Total user offers:', userOffers.value.length);
    
    if (userOffers.value.length > 0) {
      console.log('=== USER OFFERS ANALYSIS ===');
      userOffers.value.forEach((offer, index) => {
        console.log(`User offer ${index}:`, {
          offerId: offer.id,
          jobId: offer.jobId || offer.job?.id,
          currentJobId: jobId,
          isForCurrentJob: (offer.jobId || offer.job?.id) == jobId,
          offerText: offer.text,
          offerBudget: offer.budget,
          offerStatus: offer.status
        });
      });
    }
    console.log('============================');
  } catch (error) {
    console.error('Error fetching user offers:', error);
  }
};
// Initial fetch on mount
onMounted(async () => {
  console.log('Current user:', currentUser);
  await fetchJobData();
  await fetchUserOffers(); // Fetch user's offers to check for existing offers to this job
});

const fullName = computed(() => `${job.value?.jobCreator?.firstname} ${job.value?.jobCreator?.lastname}`);
const fullAddress = computed(() => `${job.value?.commune}, ${job.value?.region}`);

const isJobCreator = computed(() => job.value?.jobCreator?.id === currentUser.id);

// Check if current user already made an offer to THIS JOB
const currentUserOffer = computed(() => {
  console.log('=== CURRENTUSEROFFER COMPUTED (NEW LOGIC) ===');
  
  if (!currentUser || !currentUser.id) {
    console.log('❌ No current user');
    return null;
  }
  
  if (!userOffers.value || userOffers.value.length === 0) {
    console.log('❌ No user offers available');
    return null;
  }
  
  console.log('✅ Checking user offers for job ID:', jobId);
  console.log('Total user offers:', userOffers.value.length);
  
  // Find offer for this specific job
  const offerForThisJob = userOffers.value.find(offer => {
    const offerJobId = offer.jobId || offer.job?.id;
    const currentJobId = jobId;
    
    // Convert to string for comparison
    const match = String(offerJobId) === String(currentJobId);
    
    console.log('Comparing:', {
      offerJobId,
      currentJobId,
      match,
      offerText: offer.text?.substring(0, 30) + '...',
      offerBudget: offer.budget,
      offerStatus: offer.status
    });
    
    return match;
  });
  
  console.log('=== FINAL RESULT ===');
  console.log('Found offer for this job:', offerForThisJob ? 'YES' : 'NO');
  if (offerForThisJob) {
    console.log('Offer details:', {
      id: offerForThisJob.id,
      text: offerForThisJob.text,
      budget: offerForThisJob.budget,
      status: offerForThisJob.status
    });
  }
  console.log('==================');
  
  return offerForThisJob;
});

const hasUserMadeOffer = computed(() => {
  const hasOffer = !!currentUserOffer.value;
  console.log('Has user made offer:', hasOffer);
  return hasOffer;
});

const formattedQuestions = computed(() => {
  return questions.value
    .map(question => buildQuestion(question))
    .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
});

const formattedOffers = computed(() => {
  return offers.value
    .map(offer => buildOffer(offer))
    .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
});

const buildOffer = (offer) => {
  return {
    id: offer.id,
    date: dayjs(offer.createdDate).format('DD MMMM YYYY HH:mm'),
    user: {
      name: offer.user.firstname + ' ' + offer.user.lastname,
      firstname: offer.user.firstname,
      lastname: offer.user.lastname,
      img: offer.user.img
    },
    text: offer.text,
    budget: offer.budget,
    status: offer.status
  }
}

const buildQuestion = (question) => {
  return {
    id: question.id,
    user: question.user,
    date: dayjs(question.createdDate).format('DD MMMM YYYY HH:mm'),
    description: question.text,
    replyText: '',
    replies: (question.replies || []).map(reply => ({
      id: reply.id,
      userName: reply.user.firstname + ' ' + reply.user.lastname,
      text: reply.text,
      time: dayjs(reply.createdDate).format('MMM DD, HH:mm'),
      isJobCreator: reply.user.id === job.value?.jobCreator?.id
    }))
  }
}

const handleAcceptOffer = async (acceptedOffer) => {
  console.log('Offer accepted:', acceptedOffer);
  // Refresh job data to get updated offers and job status
  await fetchJobData();
  useAlertStore().setAlert('success', 'Pago procesado exitosamente. La oferta ha sido aceptada.');
};

const handleDeclineOffer = async (declinedOffer) => {
  console.log('Offer declined:', declinedOffer);
  // Refresh job data to get updated offers
  await fetchJobData();
  useAlertStore().setAlert('success', 'Oferta rechazada exitosamente.');
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

// Handle offer creation
const handleOfferCreated = async () => {
  // Refresh both job data and user offers
  await fetchJobData();
  await fetchUserOffers();
};

// Cancel offer function with confirmation
const confirmCancelOffer = async () => {
  if (!currentUserOffer.value) return;
  
  isCancellingOffer.value = true;
  
  try {
    await offerRepository.delete(currentUserOffer.value.id);
    await fetchUserOffers(); // Refresh user offers
    showCancelDialog.value = false;
    useAlertStore().setAlert('success', 'Oferta cancelada exitosamente');
  } catch (error) {
    console.error('Error canceling offer:', error);
    useAlertStore().setAlert('error', 'Error al cancelar la oferta');
  } finally {
    isCancellingOffer.value = false;
  }
};

// Check if job can be finished - ONLY job creator can finish
const canFinishJob = computed(() => {
  // Only job creator (client) can finish a confirmed job
  if (!job.value || job.value.status !== 'confirmed') return false;
  
  // Only job creator can finish
  return isJobCreator.value;
});

// Check if swapper is viewing a confirmed job where they are the worker
const isSwapperViewingConfirmedJob = computed(() => {
  if (!job.value || job.value.status !== 'confirmed') return false;
  
  // Check if current user is the swapper (job worker) for this confirmed job
  const currentUserId = userStore.getUser?.id || currentUser.value?.id;
  return !isJobCreator.value && 
         job.value.jobWorker && 
         job.value.jobWorker.id === currentUserId;
});

// Finish job function
const handleFinishJob = () => {
  showFinishJobModal.value = true;
};

const confirmFinishJob = async () => {
  try {
    isFinishingJob.value = true;
    
    const response = await jobRepository.finishJob(job.value.id);
    
    if (response.payload || response.message === 'Job finished successfully') {
      showFinishJobModal.value = false;
      await fetchJobData(); // Refresh job data
      useAlertStore().setAlert('success', 'Trabajo terminado exitosamente');
      
      // Redirect to schedule
      router.push('/schedule');
    }
  } catch (error) {
    console.error('Error finishing job:', error);
    useAlertStore().setAlert('error', error.message || 'Error al terminar el trabajo');
  } finally {
    isFinishingJob.value = false;
  }
};

const cancelFinishJob = () => {
  showFinishJobModal.value = false;
};

const toggleReplyInput = (questionId) => {
  console.log('Toggling reply input for question:', questionId);
  showReplyInputs.value[questionId] = !showReplyInputs.value[questionId];
};

const handleQuestionSubmit = async () => {
  if (!isQuestionValid(newQuestion.value)) {
    questionError.value = "La pregunta debe tener al menos 10 caracteres.";
    return;
  }

  questionError.value = null;
  await submitQuestion();
};

const submitQuestion = async () => {
  try {
    isSubmittingQuestion.value = true;
    
    const questionData = {
      jobId: job.value.id.toString(),
      text: newQuestion.value
    };

    const response = await questionRepository.create(questionData);
    
    // Clear the question input
    newQuestion.value = '';
    
    // Refresh the job data to get updated questions
    await fetchJobData();

    // Scroll to the questions section title
    const questionSectionTitle = document.getElementById('questions-section-title');
    if (questionSectionTitle) {
      questionSectionTitle.scrollIntoView({ behavior: 'smooth' });
    }
    // Add an offset for the topbar (e.g., 60px)
    

  } catch (error) {
    console.error('Error submitting question:', error);
    questionError.value = "Error al enviar la pregunta. Por favor intente nuevamente.";
  } finally {
    isSubmittingQuestion.value = false;
  }
};

// Método para manejar la validación y envío
const handleReplySubmit = async (question) => {
  const replyText = question.replyText;
  if (!isReplyValid(replyText)) {
    replyErrors.value[question.id] = "La respuesta debe tener al menos 2 caracteres.";
    return;
  }
  
  replyErrors.value[question.id] = null; // Limpia el error si pasa la validación
  
  // Llama a la función de envío
  await submitReply(replyText, question.id);
};

const submitReply = async (replyText, questionId) => {
  try {    
    isSubmittingReply.value = true;
    const question = questions.value.find(q => q.id === questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    // Create plain object instead of FormData
    const replyData = {
      questionId: questionId.toString(),
      text: replyText
    };

    const response = await replyRepository.create(replyData);

    // Clear the reply input
    if (question) {
      question.replyText = '';
    }
    showReplyInputs.value[questionId] = false;

    // Refresh the job data to get updated replies
    await fetchJobData();

  } catch (error) {
    console.error('Error submitting reply:', error);
    // Here you could add error handling, like showing an error message to the user
  } finally {
    isSubmittingReply.value = false;
  }
};

// Redirect to /jobs
const redirectBack = () => {
  const redirectPath = route.query.redirect || '/'
  router.push(redirectPath)
};

</script>

<style scoped>

strong {
  color: var(--base-dark-blue);
}

.job-detail-page {
  padding: 40px;
  font-family: 'Arial', sans-serif;
  position: relative;
  z-index: 1;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.status {
  padding: 5px 15px;
  border-radius: 5px;
  color: white;
  font-size: 14px;
  background-color: #ccc; /* You can apply different colors for different statuses */
}

.status.open {
  background-color: #4caf50; /* Green for OPEN status */
}

/* Edit Button */
.edit-button {
  background-color: #f5f5f5;
  width: 30px;
  height: 30px;
  padding: 0px;
  font-size: 14px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  cursor: pointer;
  color: var(--base-dark-blue);
  font-weight: 600;
  transition: all 0.3s ease;
}

.edit-button:hover {
  background-color: var(--base-light-blue);
  color: white;
  transform: scale(1.05);
}

/* Edit Form Styles */
.edit-form {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  border: 2px solid var(--base-light-blue);
}

.edit-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.edit-title {
  font-size: 24px;
  font-weight: bold;
  color: var(--base-dark-blue);
  margin: 0;
}

.edit-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin: 20px 0;
}

.cancel-button {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  transition: all 0.3s ease;
}

.cancel-button:hover {
  background-color: #e0e0e0;
  border-color: #bbb;
}

.save-button {
  background-color: var(--base-dark-blue);
  border: 1px solid var(--base-dark-blue);
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  transition: all 0.3s ease;
}

.save-button:hover {
  background-color: var(--base-light-blue);
  border-color: var(--base-light-blue);
  transform: translateY(-1px);
}

.edit-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.edit-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--base-dark-blue);
  margin-bottom: 4px;
}

.address-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 8px;
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.address-fields::before {
  content: "Información de ubicación";
  font-size: 12px;
  font-weight: 600;
  color: var(--base-dark-blue);
  margin-bottom: 8px;
  display: block;
}

.job-info {
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
}

.job-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
  color: var(--base-dark-blue);
  position: relative;
  z-index: 1;
}

.job-details {
  display: flex;
  flex-direction: column;
  color: #666;
  gap: 10px;
}

.job-details-descripction {
  font-size: 16px;
  margin-bottom: 10px;
  text-align: justify;
}

.task-budget-container {
  background-color: #f5f5f5;
  padding: 20px;
  text-align: center;
  margin-bottom: 30px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.task-budget {
  font-size: 14px;
  font-weight: bold;
  color: #888;
}

.budget-amount {
  font-size: 36px;
  color: #2d2d2d;
  margin-bottom: 15px;
}

.simple-offer-info {
  text-align: center;
  margin-top: 16px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.offer-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.offer-value {
  font-size: 20px;
  font-weight: bold;
  color: var(--base-dark-blue);
  margin-bottom: 12px;
}

.cancel-offer-btn {
  margin-top: 8px;
}

.finish-job-section {
  text-align: center;
  margin-top: 16px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.finish-job-disclaimer {
  font-size: 14px;
  color: #666;
  margin-top: 12px;
  margin-bottom: 0;
}

.finish-job-warning {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-top: 8px;
}

/* Force all Vuetify components inside job detail to have low z-index */
.job-detail-page :deep(.v-chip),
.job-detail-page :deep(.v-btn),
.job-detail-page :deep(.v-card),
.job-detail-page :deep(.v-text-field),
.job-detail-page :deep(.v-textarea),
.job-detail-page :deep(.v-dialog),
.job-detail-page :deep(.v-overlay) {
  z-index: 10 !important;
}

/* Ensure main content never interferes with sidebar */
.job-detail-page * {
  z-index: auto;
}

/* Specific override for media gallery which might have high z-index */
.job-detail-page :deep(.media-gallery),
.job-detail-page :deep(.media-gallery *) {
  z-index: 10 !important;
}



.question-button {
  width: 20%;
  align-self: center;
  font-size: 14px;
}

.questions-section, .offers-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 30px;
}

.question-disclaimer {
  font-size: 12px;
  color: #888;
}

.question-card {
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 15px;

}

.question-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.valid-question {
  border-color: var(--base-light-blue);
}

.invalid-question {
  border-color: var(--base-red);
}

.reply-input-container {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
}

.reply-loading {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.reply-link {
  font-size: 12px;
  color: var(--base-dark-blue);
  cursor: pointer;
  font-weight: 600;
  text-decoration: underline;
  margin-top: 10px;
  margin-bottom: 10px;
}

.close-button {
  background-color: #f5f5f5;
  width: 30px; /* Asegúrate de que el ancho y la altura sean iguales */
  height: 30px; /* Altura igual al ancho */
  padding: 0px; /* Elimina el padding adicional */
  font-size: 14px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  cursor: pointer;
  color: var(--base-dark-blue);
  font-weight: 600;
}

.replies-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.full-screen-dialog .v-overlay__content {
  height: 100vh !important; /* Asegúrate de ocupar todo el alto de la pantalla */
  margin: 0 !important; /* Elimina cualquier margen */
  top: 0 !important; /* Posiciona el diálogo en la parte superior */
  left: 0 !important; /* Asegúrate de que esté alineado a la izquierda */
}

.full-screen-dialog .v-card {
  height: 100%; /* Asegúrate de que el contenido también ocupe todo el espacio */
  overflow: auto; /* Permite el scroll si el contenido es demasiado grande */
}

.no-offers {
  text-align: center;
  color: #666;
  padding: 20px;
  font-size: 16px;
}

.swapper-payment-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border: 1px solid #dee2e6;
}

.payment-comparison {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.original-budget, .accepted-budget {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.budget-label {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

.budget-amount-small {
  font-size: 16px;
  color: #6c757d;
  font-weight: 600;
  text-decoration: line-through;
}

.budget-amount-highlight {
  font-size: 18px;
  color: var(--base-dark-blue);
  font-weight: 700;
}

.payment-guarantee {
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 8px;
  padding: 16px;
}

.guarantee-text {
  font-size: 16px;
  font-weight: 600;
  color: #2e7d32;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.guarantee-subtext {
  font-size: 13px;
  color: #388e3c;
  margin: 0;
  line-height: 1.4;
}

/* Responsive design for swapper payment info */
@media (max-width: 768px) {
  .swapper-payment-info {
    padding: 15px;
    gap: 15px;
  }

  .budget-label {
    font-size: 13px;
  }

  .budget-amount-small {
    font-size: 14px;
  }

  .budget-amount-highlight {
    font-size: 16px;
  }

  .guarantee-text {
    font-size: 14px;
  }

  .guarantee-subtext {
    font-size: 12px;
  }
}

/* Responsive design for edit form */
@media (max-width: 768px) {
  .edit-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .edit-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .address-fields {
    gap: 12px;
  }
}

.budget-disclaimer {
  font-size: 12px;
  color: #666;
  margin-top: 8px;
  font-style: italic;
}

/* Edit Warning Alert */
.edit-warning-alert {
  margin: 16px 0;
}

.edit-warning-alert .alert-text {
  margin: 4px 0 0 0;
  line-height: 1.4;
}

.edit-warning-alert strong {
  color: inherit;
  font-weight: 600;
}



.categories-section {
  margin-top: 15px;
}

.categories-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.category-chip {
  font-size: 14px;
  border-color: var(--base-light-blue) !important;
  color: var(--base-dark-blue) !important;
}

</style>
