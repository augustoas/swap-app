<template>
  <div>
    <BaseForm
      class="auth-form"
      :title="componentMapping[currentComponent].title"
      :subtitle="componentMapping[currentComponent].subtitle"
    >
      <template v-slot:content>
        <v-divider
          :thickness="1"
          class="divider"
          color="var(--base-light-blue)"
        ></v-divider>
        <div class="auth-form__input-group">
          <v-text-field
            class="auth-form__input"
            ref="emailInput"
            v-model="email"
            label="Email"
            variant="outlined"
            type="email"
            density="comfortable"
            :rules="isSignUp ? registerRules.email : loginRules.email"
            color="var(--base-dark-blue)"
          />
        </div>
        <div v-if="isSignUp" class="auth-form__input-group">
          <v-text-field
            class="auth-form__input"
            ref="phoneInput"
            v-model="phone"
            label="Teléfono"
            variant="outlined"
            type="text"
            density="comfortable"
            :rules="registerRules.phone"
            color="var(--base-dark-blue)"
            placeholder="Escribe tu número"
          >
            <!-- Icono de la bandera -->
            <template #prepend>
              <div class="phone-container">
                <v-avatar size="20" class="mr-2 flag-avatar">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Flag_of_Chile.svg/1920px-Flag_of_Chile.svg.png" alt="Chile Flag" />
                </v-avatar>
                <!-- Código +56 9 -->
                <span class="phone-country-code">+56 9</span>
              </div>
            </template>
          </v-text-field>
        </div>
        <div v-if="isSignUp" class="auth-form__input-group-names">
          <v-text-field
            class="auth-form__input"
            ref="firstNameInput"
            v-model="firstName"
            label="Nombre"
            variant="outlined"
            type="text"
            density="comfortable"
            :rules="registerRules.firstName"
            color="var(--base-dark-blue)"
          />
          <v-text-field
            class="auth-form__input"
            ref="lastNameInput"
            v-model="lastName"
            label="Apellido"
            variant="outlined"
            type="text"
            density="comfortable"
            :rules="registerRules.lastName"
            color="var(--base-dark-blue)"
          />
        </div>
        <div class="auth-form__input-group auth-form__input-group--password">
          <v-text-field
            class="auth-form__input"
            ref="passwordInput"
            v-model="password"
            label="Contraseña"
            variant="outlined"
            :type="showPassword ? 'text' : 'password'"
            density="comfortable"
            :rules="isSignUp ? registerRules.password : loginRules.password"
            color="var(--base-dark-blue)"
            
          />
          <div @click="togglePassword" class="auth-form__password-input">
            <v-icon
                class="auth-form__toggle-password"
                :icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                color="var(--base-dark-blue)"
              >
            </v-icon>
          </div>
        </div>
        <div
          v-if="isSignUp"
          class="auth-form__input-group auth-form__input-group--password"
        >
          <v-text-field
            class="auth-form__input"
            ref="confirmPasswordInput"
            v-model="confirmPassword"
            label="Confirmar contraseña"
            variant="outlined"
            type="password"
            density="comfortable"
            :rules="registerRules.confirmPassword"
            color="var(--base-dark-blue)"
          />
        </div>
        <div class="auth-form__forgot-password" v-if="!isSignUp">
          <NuxtLink class="auth-form__link-to" to="forgotPassword">¿Olvidó su contraseña?</NuxtLink>
        </div>
        <BaseButton
          v-if="!isLoading"
          class="auth-form__button"
          :text="'Continuar'"
          :is-hoverable="false"
          @click="validateAndProceed()"
        ></BaseButton>
        <div class="auth-form__circular-progress-container">
          <BaseLoader :loading="isLoading" />
        </div>
        <p class="auth-form__signup-prompt">
          {{ componentMapping[currentComponent].questionText }}
          <a
            class="auth-form__link-to"
            @click="switchComponent()"
          >
            {{ componentMapping[currentComponent].textButton }}
          </a>
        </p>
        <!-- <div v-if="!isSignUp" class="auth-form__alternative-logins">
          <v-btn class="mb-4" color="red darken-1" block @click="signInWith('google')">
            <v-icon left>mdi-google</v-icon>
            Login with Google
          </v-btn>
          <v-btn color="blue darken-3" block @click="signInWith('facebook')">
            <v-icon left>mdi-facebook</v-icon>
            Login with Facebook
          </v-btn>
        </div> -->
      </template>
    </BaseForm>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import AuthRepository from '~/repositories/authRepository';
  import NotificationRepository from '~/repositories/notificationRepository';

  const { $api } = useNuxtApp();
  const router = useRouter();
  const route = useRoute();

  const authRepository = new AuthRepository($api);
  const notificationRepository = new NotificationRepository($api);

  const props = defineProps({
    component: {
      type: String,
      default: 'SignIn',
    },
  });

  const isLoading = ref(false)

  const email = ref('')
  const phone = ref('')
  const password = ref('')
  const confirmPassword = ref('')
  const firstName = ref('')
  const lastName = ref('')
  const showPassword = ref(false)
  
  const currentComponent = ref(props.component)

  const emailInput = ref(null)
  const passwordInput = ref(null)
  const confirmPasswordInput = ref(null)
  const firstNameInput = ref(null)
  const lastNameInput = ref(null)
  const phoneInput = ref(null)

  const isSignUp = computed(() => currentComponent.value === 'SignUp');

  const loginRules = {
    email: [
      (v) => !!v || 'El email es requerido',
      (v) => /.+@.+\..+/.test(v) || 'El email debe ser válido',
    ],
    password: [
      (v) => !!v || 'La contraseña es requerida',
    ],
  };

  const registerRules = {
    email: [
      (v) => !!v || 'El email es requerido',
      (v) => /.+@.+\..+/.test(v) || 'El email debe ser válido',
    ],
    password: [
      (v) => !!v || 'La contraseña es requerida',
    ],
    confirmPassword: [
      (v) => !!v || 'La confirmación de la contraseña es requerida',
      (v) => v === password.value || 'Las contraseñas no coinciden',
    ],
    firstName: [
      (v) => !!v || 'El nombre es requerido',
    ],
    lastName: [
      (v) => !!v || 'El apellido es requerido',
    ],
    phone: [
      (v) => !!v || 'El número de teléfono es requerido',
      (v) => v.length == 8 || 'El número debe tener 8 dígitos',
    ],
  };

  const componentMapping = {
    SignIn: {
      title: "Iniciar Sesión",
      subtitle: "Te damos la bienvenida a Swap",
      questionText: "¿No tienes una cuenta?",
      textButton: "Regístrate",
    },
    SignUp: {
      title: "Registrarse",
      subtitle: "Te damos la bienvenida a Swap",
      questionText: "¿Ya tienes una cuenta?",
      textButton: "Inicia sesión",
    },
  };

  const togglePassword = () => {
    showPassword.value = !showPassword.value
  }

  const switchComponent = () => {
    currentComponent.value = currentComponent.value === 'SignIn' ? 'SignUp' : 'SignIn'
  }

  const validateAndProceed = () => {
    if (isSignUp.value) {
      if (emailInput.value.validate()
        && passwordInput.value.validate()
        && confirmPasswordInput.value.validate()
        && firstNameInput.value.validate()
        && lastNameInput.value.validate()
        && phoneInput.value.validate()
      ) {
        handleRegister()
      }
    } else {
      if (emailInput.value.validate()
        && passwordInput.value.validate()
      ) {
        handleLogin()
      }
    }
  }

  const handleLogin = async () => {
    isLoading.value = true
    try {
      const data = await authRepository.login({ email: email.value, password: password.value });
      useUserStore().setUserFromResponse(data.payload.user, data.payload.token);
      useAlertStore().setAlert('success', data.message);
      const notificationResponse = await notificationRepository.findByCurrentAuthUser();
      for (const notification of notificationResponse.payload) {
        useNotificationStore().addNotification(notification);
      }
      const redirectPath = route.query.redirect || '/'
      router.push(redirectPath)
    } catch (error) {
      console.log('error', error)
      useAlertStore().setAlert('error', error.message);
    } finally {
      isLoading.value = false
    }
  }

  const handleRegister = async () => {
    isLoading.value = true
    try {
      const data = await authRepository.register({ 
        firstname: firstName.value, 
        lastname: lastName.value, 
        email: email.value, 
        password: password.value,
        phonenumber: '+569' + phone.value,
      });
      useAlertStore().setAlert('success', data.message);
      switchComponent()
    } catch (error) {
      console.error('error:', error);
      useAlertStore().setAlert('error', error.message);
    } finally {
      isLoading.value = false
    }
  };

  const signInWith = (provider) => {
    // TODO: Google / Facebook
    console.log(`provider: ${provider}`);
  }

</script>

<style scoped>

.auth-form__input-group-names {
  display: flex;
  width: 100%;
  gap: 10px;
}

.auth-form__password-input {
  position: relative;
}

.auth-form__toggle-password {
  position: absolute;
  top: -73px;
  right: 15px;
  cursor: pointer;
}

.auth-form__forgot-password {
  font-size: 14px;
  text-align: right;
}

.auth-form__button {
  background-color: var(--base-dark-blue);
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  height: 50px;
  margin: 10px 0;
}

.auth-form__input {
  margin-bottom: 15px;
}

.auth-form__circular-progress-container {
  margin: 20px 0px 20px 0px;
  text-align: center;
}

.auth-form__signup-prompt {
  font-size: 14px;
  margin-bottom: 20px;
}

.auth-form__link-to {
  color: var(--base-dark-blue);
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
}

.auth-form__alternative-logins button {
  width: 100%;
  display: flex;
  margin-top: 20px;
  margin-bottom: 20px;
  background-color: transparent;
  border-radius: 4px;
  padding: 10px 10px;
  font-size: 14px;
  cursor: pointer;
  height: 50px;
}

.job-modal__description {
  font-size: 14px;
}

.divider {
  margin-top: 0px;
  margin-bottom: 40px;
  opacity: 0.5;
}

.phone-container {
  font-size: 14px;
  font-weight: 500;
  border: solid 1px;
  padding: 12px;
  border-radius: 5px;
  border-color: var(--disable-grey);
  cursor: default;
}

.flag-avatar img {
  object-fit: contain;
  width: 100%;
  height: 100%;
}

.v-avatar{
  border-radius: 0px !important;
}
</style>
