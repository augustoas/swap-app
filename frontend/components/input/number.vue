<template>
  <v-number-input
    :reverse="props.reverse || false"
    :controlVariant="props.controlVariant || 'default'"
    :label="props.label"
    :min="props.min"
    :max="props.max"
    :step="props.step"
    :hideInput="false"
    :inset="false"
    variant="solo-filled"
    :disabled="props.disabled || false"
  />
</template>

<script lang="ts" setup>
interface INumberInput {
  label: string;
  reverse?: boolean;
  min?: number;
  max?: number;
  step?: number;
  controlVariant?: 'default' | 'stacked' | 'split';
  disabled?: boolean;
}
  const props = defineProps<INumberInput>()
</script>