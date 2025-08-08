<template>
  <v-container class="profile-page">
    <v-row>
      <v-col cols="12" md="8" lg="6" class="mx-auto">
        <div class="d-flex flex-column align-center justify-center">
          <span class="text-h5 mb-2">¡Estás a un paso de ser Swapper!</span>
          <span class="text-subtitle-1 mb-4 text-center">Necesitamos estos datos para transferir el dinero que ganes a tu cuenta</span>
        </div>
        <v-divider class="mb-6"></v-divider>
        
        <BaseForm ref="form">
          <template v-slot:content>
            <div class="swapper-form__input-container">
              <span class="swapper-form__input-title">Rut</span>
              <v-text-field
                ref="rutInput"
                class="swapper-form__input"
                variant="outlined"
                id="rut"
                v-model="rut"
                placeholder="Ej: 12.345.678-9"
                color="var(--base-light-blue)"
                @update:model-value="formatRut"
                :rules="rutRules"
                append-inner-icon="mdi-id-card"
              />
            </div>
            
            <div class="swapper-form__input-container">
              <span class="swapper-form__input-title">Banco</span>
              <v-select
                ref="bankInput"
                class="swapper-form__input"
                variant="outlined"
                id="bank"
                v-model="bank"
                :items="banks"
                label="Banco"
                itemTitle="name"
                itemValue="name"
                placeholder="Selecciona un banco"
                color="var(--base-light-blue)"
                :rules="bankRules"
              />
            </div>
            
            <div class="swapper-form__input-container">
              <span class="swapper-form__input-title">Tipo de cuenta</span>
              <v-select
                ref="accountTypeInput"
                class="swapper-form__input"
                variant="outlined"
                id="account_type"
                v-model="account_type"
                :items="accountType"
                itemTitle="name"
                itemValue="name"
                placeholder="Selecciona un tipo de cuenta"
                color="var(--base-light-blue)"
                :rules="accountTypeRules"
              />
            </div>
            
            <div class="swapper-form__input-container">
              <span class="swapper-form__input-title">Número de cuenta</span>
              <v-text-field
                ref="accountNumberInput"
                class="swapper-form__input"
                variant="outlined"
                id="account_number"
                v-model="account_number"
                placeholder="Ej: 123456789"
                color="var(--base-light-blue)"
                @input="onlyNumbers"
                :rules="accountNumberRules"
                append-inner-icon="mdi-numeric"
              />
            </div>
          </template>
        </BaseForm>
        
        <div class="swapper-form__buttons-container">
          <BaseButton
            class="swapper-form__back-button"
            color="var(--base-gray)"
            text-color="black"
            text="Cancelar"
            @click="handleCancel"
          />
          
          <BaseButton
            color="var(--base-dark-blue)"
            text-color="white"
            text="Guardar"
            :disabled="isLoading"
            @click="validateAndSave"
          />
        </div>

        <div v-if="isLoading" class="loading-container">
          <v-progress-circular indeterminate color="var(--base-light-blue)"></v-progress-circular>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
  
<script setup>
  import { banks, accountType } from '~/constants/banks';
  import UserRepository from '~/repositories/userRepository';

  definePageMeta({
    middleware: ['auth'],
    layout: 'default',
  });
  
  const router = useRouter();
  const { $api } = useNuxtApp();
  const userRepository = new UserRepository($api);
  const userStore = useUserStore();
  const form = ref(null);
  
  // Add refs for each input field
  const rutInput = ref(null);
  const bankInput = ref(null);
  const accountTypeInput = ref(null);
  const accountNumberInput = ref(null);
  
  const isLoading = ref(false);
  const rut = ref('');
  const bank = ref('');
  const account_type = ref('');
  const account_number = ref('');
  
  // Determine if form is valid
  const isFormValid = computed(() => {
    if (!rut.value || !bank.value || !account_type.value || !account_number.value) return false;
    
    // Validate RUT
    const rutLimpio = rut.value.replace(/[^0-9kK]/g, '').toUpperCase();
    if (rutLimpio.length < 8) return false;
    
    // Validate account number
    if (account_number.value.length < 6 || account_number.value.length > 16) return false;
    
    return true;
  });

  const rutRules = [
    v => !!v || 'El RUT es requerido',
    // Validar longitud del RUT
    v => (v.length >= 11 && v.length <= 12) || 'El RUT no cumple con el formato',
    // Validar el RUT chileno
    v => {
      // Función para validar el RUT
      const validarRUT = (rut) => {
        // Limpiar el RUT: eliminar puntos, guiones y convertir a mayúsculas
        const rutLimpio = rut.replace(/[^0-9kK]/g, '').toUpperCase();

        // Separar cuerpo y dígito verificador
        const cuerpo = rutLimpio.slice(0, -1);
        const dv = rutLimpio.slice(-1);

        // Validar largo mínimo
        if (cuerpo.length < 7) return false;

        // Calcular dígito verificador
        let suma = 0;
        let multiplicador = 2;

        for (let i = cuerpo.length - 1; i >= 0; i--) {
          suma += parseInt(cuerpo[i], 10) * multiplicador;
          multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
        }
        const resto = suma % 11;
        const dvCalculado = 11 - resto === 11 ? '0' : 11 - resto === 10 ? 'K' : String(11 - resto);
        // Comparar el dígito verificador calculado con el ingresado
        return dv === dvCalculado;
      };
      // Validar el RUT ingresado
      return validarRUT(v) || 'El RUT no es válido';
    }
  ];

  const bankRules = [
    v => !!v || 'El banco es requerido'
  ];

  const accountTypeRules = [
    v => !!v || 'El tipo de cuenta es requerido'
  ];

  const accountNumberRules = [
    // Regla 1: Validar que no esté vacío
    v => !!v || 'El número de cuenta es requerido',

    // Regla 2: Validar que solo contenga números
    v => /^\d+$/.test(v) || 'El número de cuenta solo puede contener dígitos',

    // Regla 3: Validar que tenga una longitud razonable (6-16 dígitos)
    v => (v.length >= 6 && v.length <= 16) || 'El número de cuenta debe tener entre 6 y 16 dígitos',
  ];

  const formatRut = () => {
    // Remove any existing dots and dash
    rut.value = rut.value.replace(/\./g, '').replace(/-/g, '');
    
    // Remove any non-numeric and non-k/K characters
    rut.value = rut.value.replace(/[^0-9kK]/g, '');
    
    // Format with dots
    let result = rut.value.slice(-1); // Get verification digit
    let numbers = rut.value.slice(0, -1); // Get numbers before verification digit
    
    // Reverse the string to add dots from right to left
    numbers = numbers.split('').reverse().join('');
    
    // Add dots every 3 digits
    numbers = numbers.replace(/(\d{3})/g, '$1.');
    
    // Reverse back and remove trailing dot if exists
    numbers = numbers.split('').reverse().join('').replace(/^\./, '');
    
    rut.value = numbers + '-' + result;
  };

  const onlyNumbers = (event) => {
    // Remover cualquier cosa que no sea un número
    const inputValue = event.target.value;
    const numericValue = inputValue.replace(/[^0-9]/g, '');
    
    // Actualizar el valor del campo
    event.target.value = numericValue;
    account_number.value = numericValue;
  };

  // New function to handle validation and saving
  const validateAndSave = async () => {
    let isValid = true;
    
    // Validate each field manually
    await rutInput.value.validate();
    await bankInput.value.validate();
    await accountTypeInput.value.validate();
    await accountNumberInput.value.validate();
    
    // Check validation status
    isValid = rutInput.value.isValid && 
              bankInput.value.isValid && 
              accountTypeInput.value.isValid && 
              accountNumberInput.value.isValid;
    
    if (isValid) {
      handleSave();
    }
  };

  const handleSave = async () => {
    try {
      isLoading.value = true;
      const userId = userStore.user.id;
      
      // Format data properly for the API
      const updateData = {
        rut: rut.value,
        bank: bank.value,
        accountType: account_type.value,
        accountNumber: account_number.value,
        isSwapper: true,
      };
            
      // Update user data in the backend
      await userRepository.updateWorker(userId, updateData);
      
      // Update the user state in the store
      userStore.updateUser({
        rut: rut.value,
        bank: bank.value,
        accountType: account_type.value,
        accountNumber: account_number.value,
        isSwapper: true,
      });
      
      useAlertStore().setAlert('success', '¡Felicidades! Ahora eres un Swapper');
      router.push('/profile');
    } catch (error) {
      console.error('Error al actualizar la información de Swapper:', error);
      
      // More specific error message based on error
      if (error.response?.status === 400) {
        useAlertStore().setAlert('error', 'Datos incompletos o inválidos. Por favor verifica la información ingresada.');
      } else {
        useAlertStore().setAlert('error', 'Ha ocurrido un error. Por favor intenta nuevamente');
      }
    } finally {
      isLoading.value = false;
    }
  };

  const handleCancel = () => {
    router.push('/profile');
  };
</script>

<style lang="scss" scoped>
.profile-page {
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
}

.swapper-form__input-container {
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
}

.swapper-form__input-title {
  font-size: 16px;
  float: left;
  font-weight: 500;
  color: black;
  margin-bottom: 8px;
  text-align: start;
}

.swapper-form__input {
  margin-bottom: 3px;
}

.swapper-form__buttons-container {
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
}

.swapper-form__back-button {
  margin-right: 10px;
}

.swapper-form__input-title-error {
  color: rgb(176,0,32);
  font-size: 12px;
  margin-left: 10px;
}

.loading-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

@media screen and (max-width: 600px) {
  .profile-page {
    padding: 20px;
  }
}
</style>
