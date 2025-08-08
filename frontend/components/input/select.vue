<template>
  <v-select class="pa-2" variant="outlined"
    :label="props.label" 
    :prepend-icon="props.prependIcon" 
    :items="props.items"  
    :item-title="props.itemTitle" 
    :item-value="props.itemValue"
    clearable
    :rules="props.rules" 
    :multiple="multiple || false"
    :chips="chips || false"
    :disabled="props.disabled || false"
  />
</template>

<script lang="ts" setup>
  interface ISelectInput {
    label: string;
    prependIcon: string;
    items: any;
    itemTitle: string;
    itemValue: string;
    rules?: any[];
    multiple?: boolean;
    chips?: boolean;
    disabled?: boolean;
  }
  const props = defineProps<ISelectInput>()
</script>