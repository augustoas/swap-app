<template>
  <div class="question-header">
    <img :src="props.question.user.profilePicturePath || defaultProfilePicture" class="user-image" alt="User Image" />
    <div class="question-info">
      <h4>{{ props.question.user.firstname }} {{ props.question.user.lastname }}</h4>
      <p class="date">{{ props.question.date }}</p>
    </div>
  </div>
  <div class="question-body">
    <p>{{ props.question.description }}</p>
  </div>
</template>

<script setup lang="ts">
  import defaultProfilePicture from '~/assets/logos/swap-logo4.png';
  const props = defineProps<{
    question: any;
  }>();
</script>

<style scoped>

.question-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.user-image {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
}

.question-info {
  display: flex;
  flex-direction: column;
}

.question-info h4 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

.question-body {
  font-size: 14px;
  color: #555;
}

.date {
  font-size: 12px;
  color: #888;
}



</style>