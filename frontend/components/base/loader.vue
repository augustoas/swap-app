<template>
  <v-progress-circular
    v-if="loading"
    :size="size"
    :color="color"
    indeterminate
  ></v-progress-circular>
</template>

<script setup>
  const props = defineProps({
    loading: {
      type: Boolean,
      required: true,
    },
    size: {
      type: Number,
      default: 40,
    },
    color: {
      type: String,
      default: 'var(--base-dark-blue)',
    },
    width: {
      type: Number,
      default: 4,
    },
  });
</script>