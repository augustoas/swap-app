<template>
  <div class="forgot-password-container">
    <v-card>
      <v-card-title class="headline">Forgot Password</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="handleForgotPassword">
          <v-text-field
            label="Email"
            v-model="email"
            prepend-icon="mdi-email"
            type="email"
            required
          ></v-text-field>
          <v-btn class="mt-4" color="primary" type="submit" block>Reset Password</v-btn>
          <v-btn variant="text" color="secondary text-caption">Return to <NuxtLink class="font-weight-black" to="/login"> Log in</NuxtLink></v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import AuthRepository from '~/repositories/authRepository';
  definePageMeta({
    layout: 'dynamic'
  });

  const { $api } = useNuxtApp();
  const authRepository = new AuthRepository($api);

  const email = ref('');

  const handleForgotPassword = async () => {
    const data = await authRepository.forgotPassword({ email: email.value });
    console.log(`data: ${JSON.stringify(data)}`);
    // Handle the response, e.g., show a message that an email has been sent
  };

</script>

<style scoped>
.forgot-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}
.v-card {
  max-width: 400px;
  width: 100%;
  padding: 20px;
}
</style>