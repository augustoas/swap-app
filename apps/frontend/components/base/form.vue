<template>
  <div
    :class="{ 'base-form': true, 'base-form--mobile': isMobile }"
    :style="{ 'max-width': maxWidth }"
  >
    <div class="base-form__section">
      <div class="base-form__step-container">
        <span v-if="showStepNumber" class="base-form__step-number"
          >Paso {{ currentStep + "/" + (steps - 1) }}</span
        >
      </div>
      <h2 class="base-form__subtitle">{{ subtitle }}</h2>
    </div>
    <div class="base-form__body">
      <slot name="content"></slot>
    </div>
    <div class="base-form__inputs">
      <slot name="inputs"></slot>
    </div>
  </div>
</template>

<script setup>

const navigationStore = useNavigationStore();

const isMobile = computed(() => navigationStore.getIsMobile);

const props = defineProps({
  title: {
    type: String,
    required: false,
  },
  subtitle: {
    type: String,
    required: false,
    default: "",
  },
  maxWidth: {
    type: String,
    required: false,
    default: "568px",
  },
  showStepNumber: {
    type: Boolean,
    default: false,
  },
  currentStep: {
    type: Number,
    required: false,
  },
  steps: {
    type: Number,
    required: false,
  },
});

</script>

<style lang="scss" scoped>
.base-form {
  max-width: 568px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  margin-top: 32px !important;
  margin-bottom: 32px !important;
  border: 1px solid #b0b0b0 !important;
  border-radius: 12px !important;
  padding-bottom: 20px;
}

.base-form__body {
  width: 85%;
  margin-left: auto;
  margin-right: auto;
  padding-left: 10px;
  padding-right: 10px;
}

.base-form__section {
  width: 100%;
  margin-bottom: 20px;
}

.base-form__step-container {
  display: flex;
  align-items: center;
  margin: 20px 65px 10px 65px;
  justify-content: right;
}

.base-form__title {
  font-size: 16px;
  color: #222222;
  font-weight: 600;
}

.base-form__subtitle {
  font-size: 20px;
  color: var(--base-dark-blue);
  font-weight: 600;
  margin-top: 20px;
  text-align: center;
}

.base-form__divider-line {
  flex-grow: 1;
  height: 1px;
  background-color: #ccc;
}

.base-form__step-number {
  font-size: 12px;
}

.base-form__inputs {
  margin-top: 20px;
  display: flex;
}

/* MOBILE SPECIFIC */

.base-form--mobile {
  border: none !important;
}
</style>
