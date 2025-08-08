import { reactive, ref, computed } from 'vue';
import { regions, communesByRegion } from '~/constants/address';
import JobRepository from '~/repositories/jobRepository';
import CategoryRepository from '~/repositories/categoryRepository';
import { jobStatusMap } from '~/utils/mapKeys';
import type { Category } from '~/types/resource';

const { $api } = useNuxtApp();
const jobRepository = new JobRepository($api);
const categoryRepository = new CategoryRepository($api);

const categories = ref<Category[]>([]);
const isLoading = ref(false);
const validateDate = ref(true);

const getCategories = async () => {
  const response = await categoryRepository.findAll();
  categories.value = response.payload || [];
};

export const usePostForm = async () => {  
  await getCategories();
  const steps = [
    {
      id: "title_date",
      title: "Título y detalles",
      subtitle: "¿Qué necesitas?",
      index: 0,
    },
    {
      id: "location",
      title: "Ubicación y Fecha",
      subtitle: "¿Cuándo y dónde?",
      index: 1,
    },
    {
      id: "budget",
      title: "Precio",
      subtitle: "¿Cuánto esperas pagar?",
      index: 2,
    },
    {
      id: "confirmation",
      title: "Confirmación",
      subtitle: "Tarea creada con éxito",
      index: 3,
    },
  ];

  const formState = reactive({
    steps,
    currentStep: steps[0],
    description: "",
    details: "",
    address: "",
    images: [] as File[],
    isRemote: false,
    rawBudget: "",
    formattedBudget: "",
    categories: [] as string[],
    pendingJob: false,
  });

  // Date handling
  const date = ref(null as string | null);
  const dateType = ref('flexible');
  const onDate = ref(null as string | null);
  const beforeDate = ref(null as string | null);
  const flexibleDate = ref(true);
  
  // Location data
  const region = ref({ name: "Región Metropolitana de Santiago", code: "RM" });
  const commune = ref(null as string | null);

  // Form validation rules
  const formRules = {
    description: [
      (v: string) => !!v || 'El título es requerido',
    ],
    details: [
      (v: string) => !!v || 'Los detalles son requeridos',
      (v: string) => v.length >= 20 || 'Los detalles deben tener al menos 20 caracteres',
    ],
    address: [
      (v: string) => !!v || 'La dirección es requerida',
    ],
    budget: [
      (v: string) => !!v || 'El presupuesto es requerido',
      (v: string) => parseInt(formState.rawBudget) >= 5000 || 'El presupuesto mínimo es de $5.000',
    ],
    region: [
      (v: any) => !!v || 'La región es requerida',
    ],
    commune: [
      (v: string) => !!v || 'La comuna es requerida',
    ],
    categories: [
      (v: string[]) => v.length > 0 || 'Debe seleccionar al menos una categoría',
    ],
  };

  // Currency formatting
  const formatCurrency = (event: any) => {
    let value = event.target._value;
    let numericValue = value.replace(/\D/g, '');
    let formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    formState.formattedBudget = formattedValue;
    formState.rawBudget = numericValue;
  };

  // Date handling methods
  const handleDateSelected = ({ selectedDate, identifier }: { selectedDate: string, identifier: string }) => {
    // Convert the date to ISO format
    const isoDate = selectedDate ? new Date(selectedDate).toISOString() : null;
    
    date.value = isoDate;
    dateType.value = identifier;
    if (identifier === 'onDate') {
      onDate.value = selectedDate;
      beforeDate.value = null;
    } else if (identifier === 'beforeDate') {
      beforeDate.value = selectedDate;
      onDate.value = null;
    }
  };

  const handleDateSelectionChange = (changedField: string) => {
    if (changedField === 'onDate' && onDate.value) {
      beforeDate.value = null;
      flexibleDate.value = false;
    } else if (changedField === 'beforeDate' && beforeDate.value) {
      onDate.value = null;
      flexibleDate.value = false;
    } else if (changedField === 'flexible' && flexibleDate.value) {
      onDate.value = null;
      beforeDate.value = null;
      date.value = null;
      dateType.value = 'flexible';
    }
  };

  // Navigation methods
  const nextStep = () => {
    const currentIndex = formState.currentStep.index;
    if (currentIndex < formState.steps.length - 1) {
      formState.currentStep = formState.steps[currentIndex + 1];
    }
  };

  const previousStep = () => {
    const currentIndex = formState.currentStep.index;
    if (currentIndex > 0) {
      formState.currentStep = formState.steps[currentIndex - 1];
    }
  };

  // Reset loading state - useful if we need to cancel an operation
  const resetLoading = () => {
    isLoading.value = false;
  };

  // Job creation method
  const createJob = async () => {
    isLoading.value = true;
    try {
      // Create FormData object to handle file uploads
      const formData = new FormData();
      
      // Append all regular fields
      formData.append('description', formState.description);
      formData.append('details', formState.details);
      formState.categories.forEach(category => {
        formData.append('categories[]', category);
      });
      formData.append('address', formState.address);
      formData.append('is_remote', String(formState.isRemote));
      formData.append('budget', formState.rawBudget);
      formData.append('region', region.value.name);
      formData.append('commune', commune.value || '');
      formData.append('dateType', dateType.value);
      formData.append('date', date.value || '');

      // Append each image file separately
      if (formState.images && formState.images.length > 0) {
        formState.images.forEach((image) => {
          formData.append(`images`, image);
        });
      }

      // Call the API
      const response = await jobRepository.create(formData);
      
      // Since we can't control the return type from the repository, handle it safely
      if (response && typeof response === 'object') {
        // Check for pending status
        const status = response.payload?.status;
        if (status === 'PENDING') {
          formState.pendingJob = true;
        }
        
        // Show success message
        if (response.message) {
          useAlertStore().setAlert('success', response.message);
        } else {
          useAlertStore().setAlert('success', 'Tarea creada con éxito');
        }
      } else {
        // Default success message if response isn't as expected
        useAlertStore().setAlert('success', 'Tarea creada con éxito');
      }
      
      // Move to next step
      nextStep();
    } catch (error: any) {
      console.error('Error creating job:', error);
      
      // Show error message
      if (error && error.message) {
        useAlertStore().setAlert('error', error.message);
      } else {
        useAlertStore().setAlert('error', 'Ocurrió un error al crear la tarea');
      }
    } finally {
      // Always reset loading state
      isLoading.value = false;
    }
  };

  return {
    formState,
    formRules,
    isLoading,
    date,
    dateType,
    onDate,
    beforeDate,
    flexibleDate,
    validateDate,
    region,
    commune,
    regions,
    communesByRegion,
    categories,
    formatCurrency,
    handleDateSelected,
    handleDateSelectionChange,
    nextStep,
    previousStep,
    resetLoading,
    createJob
  };
}; 