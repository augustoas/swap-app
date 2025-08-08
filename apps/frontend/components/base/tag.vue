<template>
  <div>
    <span :class="['job-footer-tag', tagType]">
      {{ props.tag }}
      <v-icon v-if="props.icon" size="small" class="tag-icon">{{ props.icon }}</v-icon>
      <span v-if="props.emoji" class="tag-emoji">{{ props.emoji }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  tag: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    validator: (value: string) => {
      return ['offer', 'online', 'status', 'today', 'near', 'pet', 'category', 'offered'].includes(value)
    }
  },
  icon: {
    type: String,
    required: false
  },
  emoji: {
    type: String,
    required: false
  }
});

const tagType = computed(() => props.type);
</script>

<style scoped>
.job-footer-tag {
  padding: 4px 8px;
  border-radius: 15px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* Responsive styles for mobile */
@media (max-width: 768px) {
  .job-footer-tag {
    padding: 3px 6px;
    font-size: 10px;
    max-width: 120px;
  }
}

@media (max-width: 480px) {
  .job-footer-tag {
    padding: 2px 5px;
    font-size: 9px;
    max-width: 100px;
  }
}

.offer {
  background-color: #f32121;
}

.online {
  background-color: #9c27b0;
}

.status {
  background-color: #4caf50;
}

.today {
  background-color: #2196f3;
}

.near {
  background-color: #ff9800;
}

.pet {
  background-color: #24d4d1;
}

.category {
  background-color: #6c757d;
}

.offered {
  background-color: #28a745;
}
</style>
