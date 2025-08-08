<template>
  <v-btn
    flat
    :class="buttonClass"
    :style="buttonStyle"
    :color="buttonColor"
    :disabled="isDisabled"
    rounded
    @click="handleClick"
  >
    {{ text }}
  </v-btn>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: "var(--base-dark-blue)",
  },
  textColor: {
    type: String,
    default: "white",
  },
  secondary: {
    type: Boolean,
    default: false,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
  isHoverable: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["click"]);

const buttonColor = computed(() =>
  props.secondary ? "white" : props.color
);

const buttonClass = computed(() => ({
  "base-button": true,
  "secondary-button": props.secondary,
  "disabled-button": props.isDisabled,
  "hoverable-button": props.isHoverable && !props.isDisabled,
}));

const buttonStyle = computed(() => ({
  backgroundColor: props.secondary ? "white" : props.color,
  color: props.secondary ? "var(--base-dark-blue)" : props.textColor,
  borderColor: props.secondary ? "var(--base-dark-blue)" : "transparent",
}));

const handleClick = () => {
  if (!props.isDisabled) {
    emit("click");
  }
};
</script>

<style scoped>
.base-button {
  display: flex;
  padding: 20px 20px;
  border: 1px solid var(--base-dark-blue);
  font-weight: bold;
  border-radius: 25px;
  cursor: pointer;
  justify-content: center;
  transition: background-color 0.3s ease;
  color: white;
  text-transform: none; /* Prevents text from being uppercase */
  letter-spacing: 0.5px; /* Ensures no extra space between letters */
  font-size: 16px;
  min-width: 150px;
}

.secondary-button {
  border: 1px solid var(--base-dark-blue);
}

.hoverable-button:hover {
  filter: brightness(1.1); /* Lighten the background slightly */
}

.disabled-button {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
