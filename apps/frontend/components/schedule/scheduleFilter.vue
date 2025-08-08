<template>
    <v-dialog max-width="500">
      <template v-slot:default="{ isActive }">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6">Filtros Agenda</span>
            <v-icon @click="isActive.value = false" class="cursor-pointer" size="x-small">mdi-close</v-icon>
          </v-card-title>
  
          <v-card-text>
            <v-select
              label="Estado"
              v-model="filters.status"
              :items="statusOptions"
              outlined
            />
            <div class="d-flex flex-wrap gap-2 mt-4">
              <v-chip
                v-if="filters.status !== 'Todos'"
                color="primary"
                closable
                @click:close="filters.status = 'Todos'"
              >
                {{ filters.status }}
              </v-chip>
            </div>
          </v-card-text>
  
          <v-card-actions>
            <v-btn text @click="resetFilters(isActive)">Cancelar</v-btn>
            <v-btn color="primary" @click="applyFilters(isActive)">Aplicar</v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const emit = defineEmits(['apply-filters']);
  
  // Filtros seleccionados
  const filters = ref({
    status: 'Todos',
  });
  
  // Opciones de estado
  const statusOptions = ['Todos', 'Publicadas', 'Confirmadas'];
  
  // Mapear los valores del estado
  const mapStatus = (status) => {
    const statusMap = {
      Publicadas: 'Activas',
      Confirmadas: 'Confirmadas',
      Todos: 'Todos',
    };
    return statusMap[status] || status;
  };
  
  // Aplicar los filtros seleccionados
  const applyFilters = (isActive) => {
    const mappedFilters = {
      ...filters.value,
      status: mapStatus(filters.value.status),
    };
    emit('apply-filters', mappedFilters);
    isActive.value = false; // Cerrar el diálogo
  };
  
  // Resetear los filtros
  const resetFilters = (isActive) => {
    filters.value = { status: 'Todos' }; // Restaurar valores por defecto
    isActive.value = false; // Cerrar el diálogo
  };
  </script>
  
  <style scoped>
  .cursor-pointer {
    cursor: pointer;
  }
</style>
  