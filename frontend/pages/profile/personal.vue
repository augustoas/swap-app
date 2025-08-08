<template>
  <div class="container">
    <button class="back-button" @click="goBack">
      <v-icon>mdi-chevron-left</v-icon>
    </button>
    <h1 class="header">Información personal</h1>

    <div class="info-section">
      <!-- Nombre -->
      <div :class="{'list-item': true, 'active': isEditingFirstName}">
        <div class="info">
          <span class="label">Nombre</span>
          <template v-if="!isEditingFirstName">
            <span class="value">{{ firstName }}</span>
          </template>
          <template v-else>
            <p class="description">Introduce tu nombre </p>
            <v-text-field
              class="input"
              ref="firstNameInput"
              type="text"
              v-model="firstName"
              variant="outlined"
              density="comfortable"
              color="var(--base-dark-blue)"
              :rules="editingRules.firstName"
            />
          </template>
        </div>
        <span v-if="!isEditingFirstName" class="btn" @click="startEditing('firstName')">Edita</span>
        <div v-if="isEditingFirstName" class="btn-container">
          <button @click="saveField('firstName', 'isEditingFirstName')" class="save-btn">Guardar</button>
          <button @click="cancelEdit('firstName', 'isEditingFirstName')" class="cancel-btn">Cancelar</button>
        </div>
      </div>

      <!-- Apellido -->
      <div :class="{'list-item': true, 'active': isEditingLastName}">
        <div class="info">
          <span class="label">Apellido</span>
          <template v-if="!isEditingLastName">
            <span class="value">{{ lastName }}</span>
          </template>
          <template v-else>
            <p class="description">Introduce tu Apellido</p>
            <v-text-field
              class="input"
              ref="lastNameInput"
              type="text"
              v-model="lastName"
              variant="outlined"
              density="comfortable"
              color="var(--base-dark-blue)"
              :rules="editingRules.lastName"
            />
          </template>
        </div>
        <span v-if="!isEditingLastName" class="btn" @click="startEditing('lastName')">Edita</span>
        <div v-if="isEditingLastName" class="btn-container">
          <button @click="saveField('lastName', 'isEditingLastName')" class="save-btn">Guardar</button>
          <button @click="cancelEdit('lastName', 'isEditingLastName')" class="cancel-btn">Cancelar</button>
        </div>
      </div>

      <!-- Dirección de correo electrónico -->
      <div :class="{'list-item': true, 'active': isEditingEmail}">
        <div class="info">
          <span class="label">Dirección de correo electrónico</span>
          <template v-if="!isEditingEmail">
            <span class="value">{{ email }}</span>
          </template>
          <template v-else>
            <p class="description">Introduce tu dirección de correo electrónico</p>
            <v-text-field
              class="input"
              ref="emailInput"
              type="text"
              v-model="email"
              variant="outlined"
              density="comfortable"
              color="var(--base-dark-blue)"
              :rules="editingRules.email"
            />
          </template>
        </div>
        <span v-if="!isEditingEmail" class="btn" @click="startEditing('email')">Edita</span>
        <div v-if="isEditingEmail">
          <button @click="saveField('email', 'isEditingEmail')" class="save-btn">Guardar</button>
          <button @click="cancelEdit('email', 'isEditingEmail')" class="cancel-btn">Cancelar</button>
        </div>
      </div>

      <!-- Número de teléfono -->
      <div :class="{'list-item': true, 'active': isEditingPhoneNumber}">
        <div class="info">
          <span class="label">Número de teléfono</span>
          <template v-if="!isEditingPhoneNumber">
            <span class="value">{{ phoneNumber }}</span>
          </template>
          <template v-else>
            <p class="description">Introduce tu número de teléfono</p>
            <v-text-field
              class="input"
              ref="phoneInput"
              type="text"
              v-model="phoneNumber"
              variant="outlined"
              density="comfortable"
              color="var(--base-dark-blue)"
              :rules="editingRules.phone"
            >
              <template #prepend>
                <div class="phone-container">
                  <v-avatar size="20" class="mr-2 flag-avatar">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Flag_of_Chile.svg/1920px-Flag_of_Chile.svg.png" alt="Chile Flag" />
                  </v-avatar>
                  <span class="phone-country-code">+56 9</span>
                </div>
              </template>
            </v-text-field>
          </template>
        </div>
        <span v-if="!isEditingPhoneNumber" class="btn" @click="startEditing('phoneNumber')">Edita</span>
        <div v-if="isEditingPhoneNumber">
          <button @click="saveField('phoneNumber', 'isEditingPhoneNumber')" class="save-btn">Guardar</button>
          <button @click="cancelEdit('phoneNumber', 'isEditingPhoneNumber')" class="cancel-btn">Cancelar</button>
        </div>
      </div>

      <!-- Estado de confirmación de correo -->
      <div class="list-item">
        <div class="info">
          <span class="label">Estado de confirmación de correo</span>
          <div class="d-flex align-center">
            <span class="value">{{ isEmailConfirmed ? 'Correo confirmado' : 'Correo no confirmado' }}</span>
            <v-icon
              :color="isEmailConfirmed ? 'success' : 'error'"
              class="ml-2"
            >
              {{ isEmailConfirmed ? 'mdi-check-circle' : 'mdi-alert-circle' }}
            </v-icon>
          </div>
        </div>
      </div>

      <!-- Profile Picture -->
      <div class="list-item">
        <div class="info">
          <span class="label">Foto de perfil</span>
          <div class="profile-picture-container">
            <div v-if="profilePicturePath" class="media-preview" @click="openPreview(profilePicturePath)">
              <img :src="profilePicturePath" alt="Profile Picture" class="profile-picture-preview" />
              <div class="media-overlay">
                <v-icon color="white">mdi-magnify</v-icon>
              </div>
            </div>
            <v-icon v-else size="64" color="grey">mdi-account-circle</v-icon>
            <input
              type="file"
              ref="fileInput"
              accept="image/*"
              @change="handleFileChange"
              class="file-input"
            />
            <button class="upload-btn" @click="triggerFileInput">
              {{ profilePicturePath ? 'Cambiar foto' : 'Subir foto' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Save All Changes Button -->
    <div class="save-all-container">
      <button 
        class="save-all-btn" 
        @click="saveAllChanges"
        :disabled="!hasChanges"
      >
        Guardar cambios
      </button>
    </div>
  </div>

  <!-- Media Preview Dialog -->
  <v-dialog v-model="previewDialog" max-width="90vw">
    <v-card class="preview-card">
      <v-card-actions class="preview-actions">
        <v-btn icon @click="previewDialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-actions>
      <div class="preview-content">
        <img v-if="isImage(previewUrl)" :src="previewUrl" class="preview-media" />
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import UserRepository from '~/repositories/userRepository';

const { $api } = useNuxtApp();
const router = useRouter();
const userStore = useUserStore();

const userRepository = new UserRepository($api);

definePageMeta({
  middleware: ['auth'],
  layout: 'default',
});

// Variables para guardar los valores originales
const originalValues = ref<{
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profilePicturePath: string;
}>({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  profilePicturePath: ''
});

// Variables para los valores editados
const firstName = ref(userStore.getFirstname);
const lastName = ref(userStore.getLastname);
const email = ref(userStore.getEmail);
const phoneNumber = ref(userStore.getPhoneLastEightDigits || '');
const profilePicturePath = ref(userStore.getProfilePicturePath || '');

// Estados de edición
const isEditingFirstName = ref(false);
const isEditingLastName = ref(false);
const isEditingEmail = ref(false);
const isEditingPhoneNumber = ref(false);

// Refs para los inputs
const firstNameInput = ref<{ validate: () => Promise<void>; isValid: boolean } | null>(null);
const lastNameInput = ref<{ validate: () => Promise<void>; isValid: boolean } | null>(null);
const emailInput = ref<{ validate: () => Promise<void>; isValid: boolean } | null>(null);
const phoneInput = ref<{ validate: () => Promise<void>; isValid: boolean } | null>(null);

const editingRules = {
  email: [
    (v: string) => !!v || 'El email es requerido',
    (v: string) => /.+@.+\..+/.test(v) || 'El email debe ser válido',
  ],
  firstName: [
    (v: string) => !!v || 'El nombre es requerido',
  ],
  lastName: [
    (v: string) => !!v || 'El apellido es requerido',
  ],
  phone: [
    (v: string) => !!v || 'El número de teléfono es requerido',
    (v: string) => v.length === 8 || 'El número debe tener 8 dígitos',
  ],
};

// Add isEmailConfirmed computed property
const isEmailConfirmed = computed(() => userStore.getIsEmailConfirmed);

// Función para iniciar la edición y guardar el valor original
const startEditing = (field: keyof typeof originalValues.value) => {
  const fieldRef = {
    firstName,
    lastName,
    email,
    phoneNumber,
    profilePicturePath
  }[field];
  
  if (fieldRef) {
    originalValues.value[field] = fieldRef.value || '';
  }
  
  type EditingState = {
    firstName: typeof isEditingFirstName;
    lastName: typeof isEditingLastName;
    email: typeof isEditingEmail;
    phoneNumber: typeof isEditingPhoneNumber;
  };

  const editingStateRef = {
    firstName: isEditingFirstName,
    lastName: isEditingLastName, 
    email: isEditingEmail,
    phoneNumber: isEditingPhoneNumber
  }[field as keyof EditingState];

  if (editingStateRef) {
    editingStateRef.value = true;
  }
};

// Función para guardar cualquier campo
const saveField = async (field: keyof typeof originalValues.value, editingState: string) => {
  let isValid = true;

  switch (field) {
    case 'firstName':
      if (firstNameInput.value) {
        await firstNameInput.value.validate();
        isValid = firstNameInput.value.isValid;
      }
      break;
    case 'lastName':
      if (lastNameInput.value) {
        await lastNameInput.value.validate();
        isValid = lastNameInput.value.isValid;
      }
      break;
    case 'email':
      if (emailInput.value) {
        await emailInput.value.validate();
        isValid = emailInput.value.isValid;
      }
      break;
    case 'phoneNumber':
      if (phoneInput.value) {
        await phoneInput.value.validate();
        isValid = phoneInput.value.isValid;
      }
      break;
  }

  if (isValid) {
    eval(editingState).value = false;
  } else {
    // Si no es válido, restablecer el valor original
    console.log('Campo inválido, restableciendo el valor original');
    const fieldRef = {
      firstName,
      lastName,
      email,
      phoneNumber,
      profilePicturePath
    }[field];
    
    if (fieldRef) {
      fieldRef.value = originalValues.value[field];
    }
    eval(editingState).value = false;
  }
};

// Función para cancelar la edición y restaurar el valor original
const cancelEdit = (field: keyof typeof originalValues.value, editingState: string) => {
  const fieldRef = {
    firstName,
    lastName,
    email,
    phoneNumber,
    profilePicturePath
  }[field];
  
  if (fieldRef) {
    fieldRef.value = originalValues.value[field];
  }
  eval(editingState).value = false;
};

const goBack = () => {
  router.push('/profile');
};

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const hasChanges = ref(false);

// Watch for changes in editable fields
watch([firstName, lastName, email, phoneNumber, selectedFile], () => {
  hasChanges.value = true;
}, { deep: true });

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    selectedFile.value = input.files[0];
    hasChanges.value = true;
  }
};

const saveAllChanges = async () => {
  try {
    const formData = new FormData();
    
    // Add all changed fields to formData
    if (firstName.value !== userStore.getFirstname) {
      formData.append('firstname', firstName.value);
    }
    if (lastName.value !== userStore.getLastname) {
      formData.append('lastname', lastName.value);
    }
    if (email.value !== userStore.getEmail) {
      formData.append('email', email.value);
    }
    if (phoneNumber.value !== userStore.getPhoneLastEightDigits) {
      formData.append('phonenumber', `+569${phoneNumber.value}`);
    }
    if (selectedFile.value) {
      formData.append('profile-picture', selectedFile.value);
    }

    // Call the API to update user
    await userRepository.update(userStore.getId.toString(), formData);
    
    // Update the store with new values
    userStore.updateUser({
      firstname: firstName.value,
      lastname: lastName.value,
      email: email.value,
      phonenumber: `+569${phoneNumber.value}`,
    });

    // Reset changes flag
    hasChanges.value = false;
    
    // Show success message
    alert('Cambios guardados exitosamente');
  } catch (error) {
    console.error('Error saving changes:', error);
    alert('Error al guardar los cambios');
  }
};

// Media handling
const previewDialog = ref(false);
const previewUrl = ref('');

const isImage = (url: string): boolean => {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
};

const openPreview = (url: string): void => {
  previewUrl.value = url;
  previewDialog.value = true;
};
</script>

<style scoped>
.container {
  font-family: Arial, sans-serif;
  max-width: 600px;
  margin: auto;
}

.header {
  padding-top: 20px;
  padding-left: 30px;
  font-size: 1.375rem !important;
  font-weight: 700 !important;
  line-height: 1.625rem !important;
  letter-spacing: -0.6px !important;
  color: inherit !important;
}

.info-section {
  margin: 20px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.list-item {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  gap: 10px;

  &.active {
    flex-direction: column;
  }
}

.list-item:last-child {
  border-bottom: none;
}

.info {
  display: flex;
  flex-direction: column;
}

.label {
  color: black;
}

.value {
  flex: 1;
  color: #666;
  font-size: 14px;
}

.input {
  margin-top: 10px;
}

.description {
  font-size: 12px;
  color: #666;
}

.back-button {
  color: black;
  padding: 20px;
}

.btn-container {
  display: flex;
  gap: 10px;
}

.btn, .save-btn, .cancel-btn {
  cursor: pointer;
  color: black;
  text-decoration: underline;
  font-size: 14px;
}

.save-btn {
  color: white;
  background-color: black;
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  margin-right: 5px;
}

.cancel-btn {
  color: #666;
  background-color: transparent;
  border: none;
  text-decoration: underline;
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

.profile-picture-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.profile-picture-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
}

.media-preview {
  position: relative;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
}

.media-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 50%;
}

.media-preview:hover .media-overlay {
  opacity: 1;
}

.preview-card {
  background: black;
  position: relative;
}

.preview-actions {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
}

.preview-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.preview-media {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
}

.file-input {
  display: none;
}

.upload-btn {
  background-color: transparent;
  border: 1px solid #666;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
}

.save-all-container {
  display: flex;
  justify-content: center;
  margin: 40px 0;
}

.save-all-btn {
  background-color: black;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.save-all-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
