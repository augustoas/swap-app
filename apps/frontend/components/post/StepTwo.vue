<template>
  <div class="new-job__step2">
    <div class="new-job__dates-container">
      <p class="new-job__input-title">¿Para cuándo lo necesitas?</p>
      <div class="new-job__date-pickers-container">
        <BaseDatepicker
          v-model="beforeDate"
          buttonText="Antes del"
          :model-value="beforeDate"
          @select-date="(newDate) => handleDateSelected({ selectedDate: newDate, identifier: 'beforeDate' })"
          :secondary="beforeDate ? false : true"
        /> 
        <BaseDatepicker
          class="date-picker"
          v-model="onDate"
          buttonText="El día"
          :model-value="onDate"
          @select-date="(newDate) => handleDateSelected({ selectedDate: newDate, identifier: 'onDate' })"
          :secondary="onDate ? false : true"
        />
      </div>
      <div class="new-job__checkbox-container">
        <v-checkbox
          class="new-job__checkbox"
          color="var(--base-dark-blue)"
          v-model="flexibleDate"
          label="Coordinar fecha más adelante."
          style="font-size: 14px; color: black; margin-top: 10px;"
        >
        </v-checkbox>
      </div>
      <p v-if="!validateDate" class="new-job__input-title-error">Selecciona alguna opción de fecha.</p>
    </div>
    <div class="new-job__location-container">
      <p class="new-job__input-title">Selecciona Remoto si se puede realizar el trabajo de manera remota.</p>
      <div class="new-job__location-buttons-container">
        <BaseButton
          class="new-job__location-button"
          text="Presencial"
          :secondary="formState.isRemote"
          @click="formState.isRemote = false"
        />
        <BaseButton
          class="new-job__location-button"
          text="Remoto"
          :secondary="!formState.isRemote"
          @click="formState.isRemote = true"
        />
      </div>
      <div v-if="!formState.isRemote" class="new-job__address-container">
        <p class="new-job__input-title">¿A qué dirección deberá ir?</p>
        <v-select
          class="new-job__address-input"
          ref="regionInput"
          v-model="region"
          :items="regions"
          :item-props="regionProps"
          label="Región"
          placeholder="Selecciona una región"
          variant="outlined"
          color="var(--base-light-blue)"
          :rules="formRules.region"
          disabled
        />
        <v-select
          class="new-job__address-input"
          ref="communeInput"
          v-model="commune"
          :items="communesByRegion[region.code]"
          label="Comuna"
          placeholder="Selecciona una comuna"
          variant="outlined"
          color="var(--base-light-blue)"
          :rules="formRules.commune"
          :disabled="!region"
          :virtual-scroll="true"
        />
        <v-text-field
          class="new-job__address-input"
          ref="addressInput"
          type="text"
          variant="outlined"
          id="address"
          v-model="formState.address"
          placeholder="Ej: Americo Vespucio, 4891."
          color="var(--base-light-blue)"
          :rules="!formState.isRemote ? formRules.address : []"
          append-inner-icon="mdi-map-marker"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  postForm: {
    type: Object,
    required: true
  }
});

const { 
  formState, 
  formRules, 
  regions, 
  communesByRegion, 
  region, 
  commune, 
  onDate, 
  beforeDate, 
  flexibleDate,
  validateDate,
  handleDateSelected,
  handleDateSelectionChange
} = props.postForm;

const regionInput = ref(null);
const communeInput = ref(null);
const addressInput = ref(null);

// Ensure we have a valid date selection
const hasValidDateSelection = computed(() => {
  return flexibleDate.value || onDate.value || beforeDate.value;
});

const regionProps = (item) => {
  return {
    title: item.name,
  }
};

// Watch for date changes
watch(onDate, (newVal) => {
  if (newVal) handleDateSelectionChange('onDate');
});

watch(beforeDate, (newVal) => {
  if (newVal) handleDateSelectionChange('beforeDate');
});

watch(flexibleDate, (newVal) => {
  if (newVal) handleDateSelectionChange('flexible');
});

// Manual validation function
const validateFields = async () => {
  // Always update the date validation status
  if (!hasValidDateSelection.value) {
    console.log('Date validation failed');
    return false;
  }

  // For remote jobs, we only need valid date selection
  if (formState.isRemote) {
    console.log('Remote job - only date validation needed');
    return true;
  }
  
  // For non-remote jobs, we need to validate location fields
  let addressValid = true;
  let regionValid = true;
  let communeValid = true;
  
  // Try to validate inputs if they exist
  try {
    if (addressInput.value && typeof addressInput.value.validate === 'function') {
      await addressInput.value.validate();
      addressValid = addressInput.value.isValid;
    } else {
      addressValid = !!formState.address;
    }
    
    if (regionInput.value && typeof regionInput.value.validate === 'function') {
      await regionInput.value.validate();
      regionValid = regionInput.value.isValid;
    } else {
      regionValid = !!region.value;
    }
    
    if (communeInput.value && typeof communeInput.value.validate === 'function') {
      await communeInput.value.validate();
      communeValid = communeInput.value.isValid;
    } else {
      communeValid = !!commune.value;
    }
  } catch (error) {
    console.error('Error validating location fields:', error);
  }
  
  // Manual validation for location fields
  addressValid = !!formState.address;
  regionValid = !!region.value;
  communeValid = !!commune.value;
  
  console.log('Location validation results:', { 
    address: addressValid, 
    region: regionValid, 
    commune: communeValid 
  });
  
  return addressValid && regionValid && communeValid;
};

defineExpose({
  validate: validateFields
});
</script>

<style lang="scss" scoped>
.new-job__step2 {
  .new-job__input-title {
    font-size: 16px;
    float: left;
    font-weight: 500;
    color: black;
    margin-bottom: 20px;
    margin-top: 18px;
    text-align: start;
  }

  .new-job__input-title-error {
    color: rgb(176,0,32);
    font-size: 12px;
    margin-left: 10px;
  }

  .new-job__dates-container {
    display: flex;
    flex-direction: column;
  }

  .new-job__date-pickers-container {
    display: flex;
    flex-direction: row;
    gap: 20px;
    justify-content: center;
  }

  .new-job__checkbox-container {
    margin-top: 10px;
  }

  .new-job__location-container {
    display: flex;
    flex-direction: column;
  }

  .new-job__location-buttons-container {
    display: flex;
    flex-direction: row;
    gap: 20px;
    justify-content: center;
  }

  .new-job__address-container {
    display: flex;
    flex-direction: column;
  }

  .new-job__address-input {
    margin-bottom: 10px;
  }
}
</style> 