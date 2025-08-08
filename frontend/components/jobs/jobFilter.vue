<template>
  <v-navigation-drawer
    v-if="modelValue"
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    temporary
    location="right"
    width="400"
    class="filter-sidebar"
    :scrim="true"
    :persistent="false"
    :disable-resize-watcher="true"
    :disable-route-watcher="true"
  >
    <div class="filter-content">
      <!-- Header -->
      <div class="filter-header">
        <h2 class="filter-title">Filtros</h2>
        <v-btn
          variant="text"
          density="compact"
          icon="mdi-close"
          @click="closeFilters"
          class="close-btn"
        >
          <v-icon size="20">mdi-close</v-icon>
        </v-btn>
      </div>

      <!-- Filters Body -->
      <div class="filter-body">
        
        <!-- Published Date Filter -->
        <div class="filter-section">
          <h3 class="section-title">Publicados hace</h3>
          <div class="date-filter-options">
            <v-chip-group
              v-model="filters.publishedDate"
              selected-class="text-primary"
              color="primary"
              mandatory
            >
              <v-chip value="all" size="small">Cualquier momento</v-chip>
              <v-chip value="today" size="small">Hoy</v-chip>
              <v-chip value="3days" size="small">3 días</v-chip>
              <v-chip value="week" size="small">1 semana</v-chip>
              <v-chip value="month" size="small">1 mes</v-chip>
            </v-chip-group>
          </div>
        </div>

        <!-- Remote/In-person Filter -->
        <div class="filter-section">
          <h3 class="section-title">Modalidad</h3>
          <v-chip-group
            v-model="filters.isRemote"
            selected-class="text-primary"
            color="primary"
            mandatory
          >
            <v-chip value="all" size="small">Todos</v-chip>
            <v-chip value="online" size="small">
              <v-icon start>mdi-laptop</v-icon>
              Online
            </v-chip>
            <v-chip value="offline" size="small">
              <v-icon start>mdi-map-marker</v-icon>
              Presencial
            </v-chip>
          </v-chip-group>
        </div>

        <!-- Price Range Filter -->
        <div class="filter-section">
          <h3 class="section-title">Rango de precio</h3>
          <div class="price-range-container">
            <div class="price-inputs-horizontal">
              <v-text-field
                v-model="filters.priceMin"
                label="Precio mínimo"
                prefix="$"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                class="price-input-min"
              />
              <v-text-field
                v-model="filters.priceMax"
                label="Precio máximo"
                prefix="$"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                class="price-input-max"
              />
            </div>
            <div class="price-presets">
              <v-chip
                size="small"
                variant="outlined"
                @click="setPriceRange(0, 50000)"
              >
                $0 - $50k
              </v-chip>
              <v-chip
                size="small"
                variant="outlined"
                @click="setPriceRange(50000, 150000)"
              >
                $50k - $150k
              </v-chip>
              <v-chip
                size="small"
                variant="outlined"
                @click="setPriceRange(150000, 500000)"
              >
                $150k - $500k
              </v-chip>
              <v-chip
                size="small"
                variant="outlined"
                @click="setPriceRange(500000, null)"
              >
                $500k+
              </v-chip>
            </div>
          </div>
        </div>

        <!-- Date Range Filter -->
        <div class="filter-section">
          <h3 class="section-title">Fecha de entrega</h3>
          <div class="date-range-container">
            <div class="date-inputs-horizontal">
              <v-text-field
                v-model="filters.dateFrom"
                label="Desde"
                type="date"
                variant="outlined"
                density="compact"
                hide-details
                class="date-input-from"
              />
              <v-text-field
                v-model="filters.dateTo"
                label="Hasta"
                type="date"
                variant="outlined"
                density="compact"
                hide-details
                class="date-input-to"
              />
            </div>
            <div class="date-presets">
              <v-chip
                size="small"
                variant="outlined"
                @click="setDateRange('today')"
              >
                Hoy
              </v-chip>
              <v-chip
                size="small"
                variant="outlined"
                @click="setDateRange('week')"
              >
                Esta semana
              </v-chip>
              <v-chip
                size="small"
                variant="outlined"
                @click="setDateRange('month')"
              >
                Este mes
              </v-chip>
              <v-chip
                size="small"
                variant="outlined"
                @click="clearDateRange()"
              >
                Limpiar
              </v-chip>
            </div>
          </div>
        </div>

        <!-- Active Filters Display -->
        <div class="filter-section" v-if="hasActiveFilters">
          <h3 class="section-title">Filtros activos</h3>
          <div class="active-filters">
            <v-chip
              v-if="filters.publishedDate !== 'all'"
              color="primary"
              closable
              size="small"
              @click:close="filters.publishedDate = 'all'"
            >
              {{ getPublishedDateLabel() }}
            </v-chip>
            <v-chip
              v-if="filters.isRemote !== 'all'"
              color="primary"
              closable
              size="small"
              @click:close="filters.isRemote = 'all'"
            >
              {{ getRemoteLabel() }}
            </v-chip>
            <v-chip
              v-if="filters.priceMin || filters.priceMax"
              color="primary"
              closable
              size="small"
              @click:close="clearPriceRange()"
            >
              {{ getPriceRangeLabel() }}
            </v-chip>
            <v-chip
              v-if="filters.dateFrom || filters.dateTo"
              color="primary"
              closable
              size="small"
              @click:close="clearDateRange()"
            >
              {{ getDateRangeLabel() }}
            </v-chip>
          </div>
        </div>

      </div>

      <!-- Footer Actions -->
      <div class="filter-footer">
        <v-btn
          variant="text"
          @click="resetFilters"
          class="reset-btn"
        >
          Limpiar filtros
        </v-btn>
        <v-btn
          color="primary"
          @click="applyFilters"
          class="apply-btn"
        >
          Aplicar filtros
        </v-btn>
      </div>

    </div>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'apply-filters']);

// Filter state
const filters = ref({
  publishedDate: 'all',
  isRemote: 'all',
  priceMin: null,
  priceMax: null,
  dateFrom: null,
  dateTo: null
});

// Computed properties
const hasActiveFilters = computed(() => {
  return filters.value.publishedDate !== 'all' ||
         filters.value.isRemote !== 'all' ||
         filters.value.priceMin ||
         filters.value.priceMax ||
         filters.value.dateFrom ||
         filters.value.dateTo;
});

// Helper methods
const getPublishedDateLabel = () => {
  const labels = {
    today: 'Hoy',
    '3days': 'Últimos 3 días',
    week: 'Última semana',
    month: 'Último mes'
  };
  return labels[filters.value.publishedDate] || '';
};

const getRemoteLabel = () => {
  const labels = {
    online: 'Online',
    offline: 'Presencial'
  };
  return labels[filters.value.isRemote] || '';
};

const getPriceRangeLabel = () => {
  const min = filters.value.priceMin ? `$${parseInt(filters.value.priceMin).toLocaleString()}` : '$0';
  const max = filters.value.priceMax ? `$${parseInt(filters.value.priceMax).toLocaleString()}` : 'Sin límite';
  return `${min} - ${max}`;
};

const setPriceRange = (min, max) => {
  filters.value.priceMin = min;
  filters.value.priceMax = max;
};

const clearPriceRange = () => {
  filters.value.priceMin = null;
  filters.value.priceMax = null;
};

const setDateRange = (type) => {
  const today = new Date();
  const formatDate = (date) => date.toISOString().split('T')[0];
  
  switch(type) {
    case 'today':
      filters.value.dateFrom = formatDate(today);
      filters.value.dateTo = formatDate(today);
      break;
    case 'week':
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + 7);
      filters.value.dateFrom = formatDate(today);
      filters.value.dateTo = formatDate(endOfWeek);
      break;
    case 'month':
      const endOfMonth = new Date(today);
      endOfMonth.setMonth(today.getMonth() + 1);
      filters.value.dateFrom = formatDate(today);
      filters.value.dateTo = formatDate(endOfMonth);
      break;
  }
};

const clearDateRange = () => {
  filters.value.dateFrom = null;
  filters.value.dateTo = null;
};

const getDateRangeLabel = () => {
  if (!filters.value.dateFrom && !filters.value.dateTo) return '';
  
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  };
  
  const from = formatDate(filters.value.dateFrom) || 'Sin límite';
  const to = formatDate(filters.value.dateTo) || 'Sin límite';
  
  return `${from} - ${to}`;
};

const resetFilters = () => {
  filters.value = {
    publishedDate: 'all',
    isRemote: 'all',
    priceMin: null,
    priceMax: null,
    dateFrom: null,
    dateTo: null
  };
};

const applyFilters = () => {
  emit('apply-filters', { ...filters.value });
  closeFilters();
};

const closeFilters = () => {
  emit('update:modelValue', false);
};
</script>

<style lang="scss" scoped>
.filter-sidebar {
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  z-index: 9999;
}

// Smooth animations
:deep(.v-navigation-drawer) {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

// Custom overlay styling
:deep(.v-overlay__scrim) {
  background-color: rgba(0, 0, 0, 0.5) !important;
}

.filter-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: white;
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fafafa;
}

.filter-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--base-dark-blue);
  margin: 0;
}

.close-btn {
  min-width: 36px !important;
  width: 36px !important;
  height: 36px !important;
  border-radius: 50% !important;
  background-color: rgba(0, 0, 0, 0.05) !important;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.1) !important;
    transform: rotate(90deg);
  }
}

.filter-body {
  flex-grow: 1;
  padding: 24px;
  overflow-y: auto;
}

.filter-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--base-dark-blue);
  margin-bottom: 16px;
}

.date-filter-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.price-range-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.price-inputs-horizontal {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.date-range-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.date-inputs-horizontal {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.date-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.price-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-footer {
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
  background-color: #fafafa;
  display: flex;
  gap: 12px;
}

.reset-btn {
  flex: 1;
  color: var(--base-dark-blue) !important;
}

.apply-btn {
  flex: 2;
  background-color: var(--base-dark-blue) !important;
  color: white !important;
}

// Responsive adjustments
@media (max-width: 768px) {
  .filter-sidebar {
    width: 100vw !important;
  }
  
  .filter-header, .filter-body, .filter-footer {
    padding-left: 20px;
    padding-right: 20px;
  }
  
  .price-inputs-horizontal,
  .date-inputs-horizontal {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}

// Custom chip group styles
:deep(.v-chip-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

:deep(.v-chip) {
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}
</style>
