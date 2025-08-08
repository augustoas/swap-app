<template>
    <v-switch
      :color="props.color"
      :prepend-icon="props.prependIcon" 
      :label="props.label"
      :disabled="props.disabled || false"
    />
</template>

<script lang="ts" setup>
  interface ISwitchInput {
    color?: string;
    prependIcon?: string;
    label: string;
    disabled?: boolean;
  }
  const props = defineProps<ISwitchInput>()
</script>