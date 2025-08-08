<template>
  <v-autocomplete class="pa-2" variant="outlined"
    :label="props.label" 
    :prepend-icon="props.prependIcon" 
    :items="props.items"  
    :item-title="props.itemTitle" 
    :item-value="props.itemValue"  
    :rules="props.rules" 
    :disabled="props.disabled || false"
  >
  <template v-slot:append>
    <slot name="append"></slot>
  </template>
  </v-autocomplete>
</template>

<script lang="ts" setup>
  interface IAutoCompleteInput {
    label: string;
    prependIcon: string;
    items: any[];
    itemTitle: string;
    itemValue: string;
    rules?: any[];
    disabled?: boolean;
  }
  const props = defineProps<IAutoCompleteInput>()
</script>