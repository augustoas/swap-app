<template>
  <v-data-table
    :headers="props.resourceHeaders"
    :items="props.resourceData"
    :sort-by="[{ key: 'id', order: 'asc' }]"
  >
    <template v-slot:top>
      <v-toolbar
        flat
      >
        <v-toolbar-title>{{ resourceName }}</v-toolbar-title>
        <v-divider
          class="mx-4"
          inset
          vertical
        ></v-divider>
        <v-spacer></v-spacer>
        <v-btn color="primary" dark @click="$emit('create')">
          Nuevo Item
        </v-btn>
      </v-toolbar>
    </template>
    <template v-slot:item.qrimage="{ item }">
      <!-- Check if QR image exists -->
      <template v-if="item.qrimage">
        <img :src="convertBase64ToImageUrl(item.qrimage)" alt="QR Code" style="width: 100px; height: auto;">
      </template>
      <!-- Show placeholder if QR image doesn't exist -->
      <template v-else>
        <span>No QR code</span>
      </template>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon
        class="me-2"
        size="small"
        @click="$emit('edit', item.id)"
      >
        mdi-pencil
      </v-icon>
      <v-icon
        size="small"
        @click="$emit('delete', item.id)"
      >
        mdi-delete
      </v-icon>
    </template>
  </v-data-table>
</template>

<script lang="ts" setup>
  import { computed, nextTick, ref, watch } from 'vue';
  const props = defineProps<{
    resourceName: string | string[],
    resourceData: any[],
    resourceHeaders: any[]
  }>()
  // Method to convert base64 string to image URL
  const convertBase64ToImageUrl = (base64String: string) => {
    return `data:image/png;base64,${base64String}`;
  }
  const tableData = ref(props.resourceData)
  watch(() => props.resourceData, (newValue) => {
  tableData.value = [...newValue];
});
</script>