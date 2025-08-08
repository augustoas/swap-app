<template>
  <div v-if="useUserStore().isLoggedIn()" :class="{ 'new-job-form': true, 'new-job-form--mobile': isMobile }">
    <div v-if="!isMobile" class="new-job-form__step-list">
      <span class="new-job-form__step-list-title">Nueva publicación</span>
      <span
        v-for="(step, index) in postForm.formState.steps"
        :key="index"
        :class="{ active: postForm.formState.currentStep.index === index, step: true }"
      >
        {{ step.title }}
      </span>
    </div>
    <BaseForm
      :subtitle="postForm.formState.currentStep.subtitle"
      :showStepNumber="postForm.formState.currentStep.index !== 3"
      :steps="postForm.formState.steps.length"
      :currentStep="postForm.formState.currentStep.index + 1"
    >
      <template v-slot:content>
        <!-- STEP 1 - Title and Details -->
        <StepOne 
          v-if="postForm.formState.currentStep.index === 0" 
          ref="stepOneRef" 
          :postForm="postForm" 
        />
        
        <!-- STEP 2 - Location and Date -->
        <StepTwo 
          v-if="postForm.formState.currentStep.index === 1" 
          ref="stepTwoRef" 
          :postForm="postForm" 
        />

        <!-- STEP 3 - Budget -->
        <StepThree 
          v-if="postForm.formState.currentStep.index === 2" 
          ref="stepThreeRef" 
          :postForm="postForm" 
        />

        <!-- STEP 4 - Success Screen -->
        <StepSuccess 
          v-if="postForm.formState.currentStep.index === 3" 
          :postForm="postForm" 
        />
      </template>
      <template v-slot:inputs v-if="postForm.formState.currentStep.index !== 3">
        <div v-if="loading" class="new-job__circular-progress-container">
          <BaseLoader :loading="true" />
        </div>
        <div v-else class="new-job__buttons-container">
          <BaseButton
            v-if="postForm.formState.currentStep.index > 0"
            class="new-job__back-button"
            :text="'Volver'"
            @click="postForm.previousStep()"
            color="var(--base-light-blue)"
          />
          <BaseButton
            :text="postForm.formState.currentStep.index !== 2 ? 'Continuar' : 'Finalizar'"
            @click="validateAndProceed"
            color="var(--base-light-blue)"
          />
        </div>
      </template>
    </BaseForm>
  </div>
  <div v-else class="login-message-container">
    <h2>Debes iniciar sesión para publicar una tarea.</h2>
    <NuxtLink style="text-decoration: none;" :to="{ path: '/login', query: { redirect: '/post' } }" @click="handleBottomTabUpdate(4)">
      <BaseButton text="Iniciar Sesión" />
    </NuxtLink>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { usePostForm } from '~/composables/usePostForm';
import StepOne from '~/components/post/StepOne.vue';
import StepTwo from '~/components/post/StepTwo.vue';
import StepThree from '~/components/post/StepThree.vue';
import StepSuccess from '~/components/post/StepSuccess.vue';

definePageMeta({
  layout: 'default'
});

const route = useRoute();
const navigationStore = useNavigationStore();

const isMobile = computed(() => navigationStore.getIsMobile);
const loading = ref(false);

// Initialize the post form composable
const postForm = await usePostForm();

// Step component refs for validation
const stepOneRef = ref(null);
const stepTwoRef = ref(null);
const stepThreeRef = ref(null);

// Handle incoming query parameters or localStorage data
const initializeFormWithData = () => {
  // Check for query parameters from landing page quick form
  const { title, details, all_required } = route.query;
  
  if (title) {
    postForm.formState.description = String(title);
  }
  
  if (details) {
    postForm.formState.details = String(details);
  }
  
  // Check for localStorage data from the quick form (saved before login)
  const savedDescription = localStorage.getItem('quick_job_description');
  const savedDetails = localStorage.getItem('quick_job_details');
  
  if (savedDescription && !title) {
    postForm.formState.description = savedDescription;
  }
  
  if (savedDetails && !details) {
    postForm.formState.details = savedDetails;
  }
  
  // Clear localStorage after retrieval
  if (savedDescription || savedDetails) {
    localStorage.removeItem('quick_job_description');
    localStorage.removeItem('quick_job_details');
  }
  
  // Check if we have a quick_job parameter indicating we came from the landing page
  const quickJob = route.query.quick_job === 'true';
  const allRequiredProvided = all_required === 'true';
  
  // If we have prefilled data and this is a quick job or all required fields are provided, auto-validate the first step
  if ((title || savedDescription) && (quickJob || allRequiredProvided)) {
    // Only auto-proceed if we have valid data
    if (
      postForm.formState.description &&
      postForm.formState.description.length > 0 &&
      (allRequiredProvided || postForm.formState.details)
    ) {
      // We need a small delay to ensure the component is mounted
      setTimeout(() => {
        validateAndProceed();
      }, 100);
    }
  }
};

onMounted(() => {
  navigationStore.setSelectedItem(2);
  initializeFormWithData();
});

const handleBottomTabUpdate = (index) => {
  navigationStore.setSelectedItem(index);
};

// Validation handler
const validateAndProceed = async () => {
  // Set local loading state
  loading.value = true;
  
  try {
    let isValid = false;

    // Validate current step
    if (postForm.formState.currentStep.index === 0 && stepOneRef.value) {
      console.log('Validating step 1');
      isValid = await stepOneRef.value.validate();
    } else if (postForm.formState.currentStep.index === 1 && stepTwoRef.value) {
      console.log('Validating step 2');
      isValid = await stepTwoRef.value.validate();
      postForm.validateDate.value = isValid;
    } else if (postForm.formState.currentStep.index === 2 && stepThreeRef.value) {
      console.log('Validating step 3');
      isValid = await stepThreeRef.value.validate();
    }

    console.log('Validation result:', isValid);

    if (isValid) {
      if (postForm.formState.currentStep.index < 2) {
        postForm.nextStep();
      } else {
        await postForm.createJob();
      }
    } else {
      console.log('Validation failed');
      useAlertStore().setAlert('error', 'Por favor completa todos los campos requeridos.');
    }
  } catch (error) {
    console.error('Error during validation:', error);
    useAlertStore().setAlert('error', 'Se produjo un error. Por favor intenta nuevamente.');
  } finally {
    // Reset local loading state
    loading.value = false;
  }
};

// Watch date changes
watch(postForm.onDate, (newVal) => {
  if (newVal) postForm.handleDateSelectionChange('onDate');
});

watch(postForm.beforeDate, (newVal) => {
  if (newVal) postForm.handleDateSelectionChange('beforeDate');
});

watch(postForm.flexibleDate, (newVal) => {
  if (newVal) postForm.handleDateSelectionChange('flexible');
});

// Watch postForm loading state
watch(() => postForm.isLoading.value, (newVal) => {
  loading.value = newVal;
});
</script>

<style lang="scss" scoped>
/* GLOBAL */
.new-job-form {
  display: flex;

  .new-job-form__step-list {
    margin: 40px 0px 40px 40px;
    display: flex;
    flex-direction: column;
    text-align: left;

    .step {
      padding: 8px;
      position: relative;
      font-size: 14px;

      &::before {
        content: "";
        position: absolute;
        left: 0px;
        top: 20%;
        bottom: 20%;
        width: 3px;
        background: transparent;
      }

      &.active::before {
        background-color: var(--base-dark-blue);
      }
    }
  }

  .new-job-form__step-list-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 20px;
  }

  .new-job__back-button {
    margin-right: 20px;
  }

  .new-job__buttons-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

/* MOBILE ONLY*/
.new-job-form--mobile {
  display: block;
  align-items: center;
  justify-content: space-between;
}

.login-message-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  width: 80%;
  margin: auto;

  h2 {
    font-size: 22px;
    margin-bottom: 40px;
  }
}

.new-job__circular-progress-container {
  margin: 20px 0px 20px 0px;
  text-align: center;
}
</style>

