<template>
  <div v-for="reply in props.question.replies" :key="reply.id" 
        :class="['reply-card', reply.isJobCreator ? 'creator-reply' : 'user-reply']"
        :style="reply.isJobCreator ? {} : {alignSelf: 'flex-end'}">
    <div class="reply-header">
      <!-- <img src="~/assets/logos/swap-logo4.png" class="user-image-small" alt="User Image" />
      <div class="reply-info">
        <h5>{{ reply.userName }}</h5>
        <p class="reply-time">{{ reply.time }}</p>
      </div> -->
    </div>
    <div class="reply-content">
      <p>{{ reply.text }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  question: any;
}>();
</script>

<style scoped>

.reply-card {
  padding: 10px;
  border-radius: 8px;
  max-width: 80%;
  margin: 5px 0;
}

.reply-header {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.user-image-small {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}

.reply-info {
  display: flex;
  flex-direction: column;
}

.reply-info h5 {
  margin: 0;
  font-size: 14px;
  font-weight: bold;
}

.reply-time {
  font-size: 10px;
  color: #666;
  margin: 0;
}

.reply-content {
  font-size: 13px;
}

.creator-reply {
  align-self: flex-start;
  background-color: #f0f0f0;
}

.user-reply {
  background-color: var(--base-dark-blue);
  color: white;
  align-self: flex-end;
}

.user-reply .reply-time {
  color: rgba(255, 255, 255, 0.8);
}
</style>
