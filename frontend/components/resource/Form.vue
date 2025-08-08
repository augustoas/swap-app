<template>
  <v-form @submit.prevent="handleSubmit">
    <v-container>
      <v-row v-for="(field, index) in formFields" :key="index">
        <v-col cols="12" md="6">
          <v-text-field
            v-if="field.type !== 'checkbox'"
            v-model="formData[field.key]"
            :label="field.title"
            :type="field.type"
            :required="field.required"
          ></v-text-field>
          <v-checkbox 
          v-if="field.type === 'checkbox'"
          v-model="formData[field.key]"
          :label="field.title"
          :required="field.required"
          ></v-checkbox>
        </v-col>
      </v-row>
      <v-btn color="primary" type="submit">Submit</v-btn>
    </v-container>
  </v-form>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import { Resource } from '~/types/resource';
  interface FormField {
    key: string;
    title: string;
    type: string;
    required: boolean;
  }
  // Props
  const props = defineProps<{
    resourceName: string;
    resourceData: any;
    mode: 'create' | 'edit';
  }>();
  const emit = defineEmits(['submit'])

  // Use Record<string, any> for formData to accommodate different resources dynamically
  const formData = ref<Record<string, any>>({}); // Form data object
  const formFields = ref<FormField[]>([]); // Array of form fields

  // Watch resourceData for editing mode
  watch(
    () => props.resourceData,
    (newValue) => {
      if (props.mode === 'edit' && newValue) {
        formData.value = { ...newValue };
      }
    },
    { immediate: true }
  );

// Method to initialize form fields based on the resource
const initializeFormFields = () => {
  switch (props.resourceName) {
    case Resource.User:
      formFields.value = [
        { key: 'firstname', title: 'First Name', type: 'text', required: true },
        { key: 'lastname', title: 'Last Name', type: 'text', required: true },
        { key: 'email', title: 'Email', type: 'email', required: true },
        { key: 'password', title: 'Contraseña', type: 'password', required: true },
        { key: 'token', title: 'Token', type: 'text', required: false },
        { key: 'gender', title: 'Gender', type: 'text', required: false },
        { key: 'birthdate', title: 'Birthdate', type: 'date', required: false },
      ];
      break;

    case Resource.Job:
      formFields.value = [
        { key: 'budget', title: 'Budget', type: 'number', required: true },
        { key: 'accepted_budget', title: 'Accepted Budget', type: 'number', required: false },
        { key: 'details', title: 'Details', type: 'text', required: true },
        { key: 'status', title: 'Status', type: 'text', required: false },
        { key: 'currency', title: 'Currency', type: 'text', required: false },
        { key: 'region', title: 'Región', type: 'text', required: false },
        { key: 'commune', title: 'Comuna', type: 'text', required: false },
        { key: 'dateType', title: 'Date Type', type: 'text', required: true },
        { key: 'date', title: 'Date', type: 'date', required: false },
        { key: 'is_remote', title: 'Is Remote', type: 'checkbox', required: true },
        { key: 'jobCreatorId', title: 'Job Creator ID', type: 'number', required: false },
        { key: 'jobWorkerId', title: 'Job Worker ID', type: 'number', required: false },
      ];
      break;

    case Resource.JobCategory:
      formFields.value = [
        { key: 'categoryId', title: 'Category ID', type: 'number', required: false },
        { key: 'jobId', title: 'Job ID', type: 'number', required: false },
      ];
      break;

    case Resource.Category:
      formFields.value = [
        { key: 'name', title: 'Name', type: 'text', required: true },
        { key: 'description', title: 'Description', type: 'text', required: true },
      ];
      break;

    case Resource.TermsAndConditions:
      formFields.value = [
        { key: 'title', title: 'Title', type: 'text', required: true },
        { key: 'text', title: 'Text', type: 'textarea', required: true },
        { key: 'description', title: 'Description', type: 'text', required: false },
      ];
      break;

    case Resource.Offer:
      formFields.value = [
        { key: 'text', title: 'Text', type: 'text', required: true },
        { key: 'budget', title: 'Budget', type: 'number', required: true },
        { key: 'userId', title: 'User ID', type: 'number', required: false },
        { key: 'jobId', title: 'Job ID', type: 'number', required: false },
      ];
      break;

    case Resource.Question:
      formFields.value = [
        { key: 'text', title: 'Text', type: 'text', required: true },
        { key: 'userId', title: 'User ID', type: 'number', required: false },
        { key: 'jobId', title: 'Job ID', type: 'number', required: false },
      ];
      break;

    case Resource.Reply:
      formFields.value = [
        { key: 'text', title: 'Text', type: 'text', required: true },
        { key: 'offerId', title: 'Offer ID', type: 'number', required: false },
        { key: 'questionId', title: 'Question ID', type: 'number', required: false },
        { key: 'userId', title: 'User ID', type: 'number', required: false },
      ];
      break;

    case Resource.Review:
      formFields.value = [
        // Define fields based on the schema of the review table
      ];
      break;

    default:
      formFields.value = [];
    }
  };

// Handle form submission
const handleSubmit = async () => {
  emit('submit', formData.value);
};

onMounted(() => {
  initializeFormFields();
});
</script>
