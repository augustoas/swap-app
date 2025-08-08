<template>
  <div class="new-job__step1">
    <div class="new-job__input-container">
      <span class="new-job__input-title">
        Elige un título para la tarea.
      </span>
      <v-text-field
        ref="descriptionInput"
        type="text"
        variant="outlined"
        id="description"
        v-model="formState.description"
        placeholder="Ej: Necesito mover un sillón."
        color="var(--base-light-blue)"
        :rules="formRules.description"
      />
    </div>
    <div class="new-job__input-container">
      <span class="new-job__input-title">
        Detalla lo mejor posible la tarea.
      </span>
      <v-textarea
        ref="detailsInput"
        type="text"
        variant="outlined"
        id="details"
        v-model="formState.details"
        placeholder="Mientras más detalles tu tarea, más fácil será encontrar un Swapper."
        auto-grow
        color="var(--base-light-blue)"
        clearable
        :rules="formRules.details"
      />
    </div>
    <div class="new-job__input-container">
      <span class="new-job__input-title">
        Elige una categoría para tu tarea.
      </span>
      <v-select
        class="new-job__category-input"
        ref="categoryInput"
        v-model="formState.categories"
        :items="categories"
        label="Categoría"
        item-title="name"
        item-value="id"
        placeholder="Selecciona una categoría"
        variant="outlined"
        color="var(--base-light-blue)"
        :rules="formRules.categories"
        multiple
      />
    </div>
    <div class="new-job__input-container">
      <span class="new-job__input-title">
        Agregar imagen o video (Opcional).
      </span>
      <v-file-input
        accept="image/*, video/*"
        placeholder="Agregar imágen (Opcional)"
        clearable
        variant="underlined"
        prepend-icon="mdi-paperclip"
        color="var(--base-light-blue)"
        multiple
        v-model="formState.images"
      ></v-file-input>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  postForm: {
    type: Object,
    required: true
  }
});

const { formState, formRules, categories } = props.postForm;

const descriptionInput = ref(null);
const detailsInput = ref(null);
const categoryInput = ref(null);

// Manual validation function to validate all fields
const validateFields = async () => {
  let descriptionValid = true;
  let detailsValid = true;
  let categoryValid = true;
  
  // Validate each field if possible
  if (descriptionInput.value && typeof descriptionInput.value.validate === 'function') {
    await descriptionInput.value.validate();
    descriptionValid = descriptionInput.value.isValid;
  }
  
  if (detailsInput.value && typeof detailsInput.value.validate === 'function') {
    await detailsInput.value.validate();
    detailsValid = detailsInput.value.isValid;
  }
  
  if (categoryInput.value && typeof categoryInput.value.validate === 'function') {
    await categoryInput.value.validate();
    categoryValid = categoryInput.value.isValid;
  }
  
  // Check if title is filled
  descriptionValid = !!formState.description;
  
  // Check if details are filled and long enough
  detailsValid = !!formState.details && formState.details.length >= 20;
  
  // Check if category is selected
  categoryValid = !!formState.categories && formState.categories.length > 0;
  
  // Log validation results for debugging
  console.log('Validation results:', { 
    description: descriptionValid, 
    details: detailsValid, 
    categories: categoryValid 
  });
  
  return descriptionValid && detailsValid && categoryValid;
};

// Expose the validation method to the parent component
defineExpose({
  validate: validateFields
});
</script>

<style lang="scss" scoped>
.new-job__input-container {
  display: flex;
  flex-direction: column;
}

.new-job__input-title {
  font-size: 16px;
  float: left;
  font-weight: 500;
  color: black;
  margin-bottom: 20px;
  margin-top: 18px;
  text-align: start;
}
</style> 