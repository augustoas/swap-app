<template>
  <div class="quick-job-create">
    <div class="quick-job-create__container">
      <h2 class="quick-job-create__title">
        <v-icon icon="mdi-lightning-bolt" color="var(--button-light-blue)" size="x-large" class="title-icon"></v-icon>
        ¿Qué tarea necesitas realizar?
      </h2>
      
      <div class="quick-job-create__form">
        <v-text-field
          ref="quickDescriptionInput"
          type="text"
          variant="outlined"
          id="quick-description"
          v-model="description"
          placeholder="Ej: Necesito mover un sillón"
          color="var(--base-light-blue)"
          class="quick-job-create__input"
          :rules="[v => !!v || 'El título es requerido']"
          @keyup.enter="handleCreateJob"
        />
        
        <v-textarea
          ref="quickDetailsInput"
          v-model="details"
          label="Detalles"
          placeholder="Describe los detalles de tu tarea"
          variant="outlined"
          color="var(--base-light-blue)"
          class="quick-job-create__details"
          rows="3"
          auto-grow
        />
        
        <BaseButton
          class="quick-job-create__button"
          text="Crear Tarea Ahora"
          @click="handleCreateJob"
          color="var(--base-dark-blue)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const userStore = useUserStore();
const alertStore = useAlertStore();

const description = ref('');
const details = ref('');

const allRequiredFieldsCompleted = () => {
  return description.value && details.value;
};

const handleCreateJob = () => {
  // Validate that we have at least a title
  if (!description.value) {
    alertStore.setAlert('error', 'Por favor ingresa un título para tu tarea');
    return;
  }
  
  // Check if user is logged in
  if (!userStore.isLoggedIn()) {
    // Save data in localStorage for retrieval after login
    localStorage.setItem('quick_job_description', description.value);
    if (details.value) {
      localStorage.setItem('quick_job_details', details.value);
    }
    
    // Redirect to login with return path to job creation
    router.push({ 
      path: '/login', 
      query: { 
        redirect: '/post',
        quick_job: 'true'
      } 
    });
    return;
  }
  
  // Success alert before redirecting
  alertStore.setAlert('success', 'Creando tu tarea...', 'bottom');
  
  // User is logged in, navigate to job creation with params
  router.push({ 
    path: '/post',
    query: { 
      title: description.value,
      details: details.value || '',
      all_required: allRequiredFieldsCompleted() ? 'true' : 'false'
    }
  });
};
</script>

<style lang="scss" scoped>
.quick-job-create {
  width: 100%;
  padding: 2.5rem 1.5rem;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  margin: 2rem 0;
  
  &__container {
    max-width: 800px;
    margin: 0 auto;
  }
  
  &__title {
    font-size: 2rem;
    color: var(--base-dark-blue);
    text-align: center;
    margin-bottom: 2rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    
    .title-icon {
      margin-right: 5px;
    }
  }
  
  &__form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  &__input {
    flex-grow: 2;
    
    :deep(.v-field__field) {
      font-size: 1.1rem;
    }
  }
  
  &__details {
    width: 100%;
    
    :deep(.v-field__field) {
      font-size: 1rem;
    }
  }
  
  &__button {
    width: 100%;
    margin-top: 1rem;
    background-color: var(--button-light-blue);
    border-radius: 8px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    height: 50px;
    font-size: 1.1rem;
    font-weight: 600;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
  }
}

// Media queries for responsive design
@media (min-width: 768px) {
  .quick-job-create {
    &__form {
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
      gap: 1.5rem;
    }
    
    &__input {
      grid-column: 1;
      grid-row: 1;
    }
    
    &__details {
      grid-column: 1;
      grid-row: 2;
    }
    
    &__button {
      grid-column: 1;
      grid-row: 3;
      width: 50%;
      margin: 1.5rem auto 0;
    }
  }
}
</style> 