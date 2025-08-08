<template>
  <v-text-field
    variant="solo-filled"
    :label="props.label"
    :type="props.type"
    :placeholder="props.placeholder"
    :prepend-icon="props.prependIcon"
    :disabled="props.disabled || false"
    clearable
  />
</template>

<script lang="ts" setup>
  interface ITextfieldInput {
    label: string;
    type: 'text' | 'password' | 'email';
    placeholder?: string;
    prependIcon?: string;
    disabled?: boolean;
  }
  const props = defineProps<ITextfieldInput>()
</script>