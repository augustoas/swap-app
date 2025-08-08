<template>
  <div class="new-job__step3">
    <div class="new-job__input-container">
      <v-text-field
        ref="budgetInput"
        type="text"
        variant="outlined"
        id="budget"
        v-model="formState.formattedBudget"
        @input="formatCurrency"
        placeholder="Ej: 10.000"
        color="var(--base-light-blue)"
        :rules="formRules.budget"
        prepend-inner-icon="mdi-currency-usd"
      />
      <span class="new-job__input-disclaimer">
        * El precio final se podrá negociar con el candidato.
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  postForm: {
    type: Object,
    required: true
  }
});

const { formState, formRules, formatCurrency } = props.postForm;

const budgetInput = ref(null);

// Computed to check if budget meets minimum requirement
const isBudgetValid = computed(() => {
  // Parse the budget to a number
  const budget = parseInt(formState.rawBudget);
  // Check if it's a valid number and meets minimum requirement
  return !isNaN(budget) && budget >= 5000;
});

// Manual validation function
const validateBudget = async () => {
  // Try component validation first
  try {
    if (budgetInput.value && typeof budgetInput.value.validate === 'function') {
      await budgetInput.value.validate();
      // If component validation is available, use its result
      if (budgetInput.value.isValid !== undefined) {
        return budgetInput.value.isValid;
      }
    }
  } catch (error) {
    console.error('Error validating budget:', error);
  }
  
  // Fallback to manual validation
  const budgetValid = isBudgetValid.value;
  console.log('Budget validation result:', { budget: budgetValid, value: formState.rawBudget });
  
  // If budget is not valid, show an error message
  if (!budgetValid) {
    useAlertStore().setAlert('error', 'El presupuesto mínimo es de $5.000');
  }
  
  return budgetValid;
};

defineExpose({
  validate: validateBudget
});
</script>

<style lang="scss" scoped>
.new-job__step3 {
  .new-job__input-container {
    display: flex;
    flex-direction: column;
  }

  .new-job__input-disclaimer {
    font-size: 12px;
    color: #666;
    margin: 20px 0px;
  }
}
</style> 