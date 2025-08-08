<template>
  <div class="date-picker-container">
    <BaseButton
      @click="openDateMenu"
      :text="formattedDate"
      :secondary="props.secondary"
    />
    <v-dialog
      v-model="dateMenu"
      :close-on-content-click="true"
      transition="dialog-bottom-transition"
      max-width="290px"
      min-width="290px"
    >
      <v-date-picker
        v-model="selectedDate"
        scrollable
        elevation="24"
        @update:modelValue="onDateSelected()"
        :fullscreen-mobile="true"
        header="Fecha"
        title="Selecciona una fecha"
        :allowed-dates="allowedDates"
      />
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import dayjs from 'dayjs';

const props = defineProps({
  modelValue: {
    type: [String, Date],
  },
  buttonText: {
    type: String,
    default: 'Fecha',
  },
  secondary: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(['update:modelValue', 'selectDate']);

const dateMenu = ref(false);
const selectedDate = ref(props.modelValue);

// Función para permitir solo fechas desde hoy en adelante
const allowedDates = (date: any) => {
  const today = new Date();
  const selected = new Date(date);
  return selected.setHours(0, 0, 0, 0) >= today.setHours(0, 0, 0, 0);
};

const formattedDate = computed(() => {
  return selectedDate.value
    ? `${props.buttonText}: ${dayjs(selectedDate.value).format('MMM D')}`
    : `${props.buttonText} ---`;
});

const openDateMenu = () => {
  dateMenu.value = true;
};

const onDateSelected = () => {
  emits('selectDate', selectedDate.value);
};

watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue) {
      selectedDate.value = undefined;
    }
  }
);
</script>

<style scoped>
.date-picker-container {
  display: inline-block;
}
</style>
