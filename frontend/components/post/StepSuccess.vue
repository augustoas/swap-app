<template>
  <div class="success-step">
    <img
      src="~/assets/logos/success-icon.png"
      alt="Logo"
      class="success-step__img"
    />
    <div class="success-step__div" v-if="formState.pendingJob">
      <p>
        Para que <strong>la tarea quede publicada</strong> se requiere 
        <span class="highlight-red">validar un teléfono de contacto</span>.
      </p>
      <NuxtLink style="text-decoration: none;" :to="{ path: '/profile', query: { redirect: '/post' } }" @click="handleBottomTabUpdate(4)">
        <BaseButton text="Validar Teléfono" />
      </NuxtLink>
    </div>
    <div class="success-step__div" v-if="!formState.pendingJob">
      <p>Tu tarea ya quedó publicada. Puedes revisar tus publicaciones en tu agenda</p>
      <NuxtLink style="text-decoration: none;" :to="{ path: '/schedule' }" @click="handleBottomTabUpdate(3)">
        <BaseButton text="Mi Agenda" />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  postForm: {
    type: Object,
    required: true
  }
});

const { formState } = props.postForm;
const navigationStore = useNavigationStore();

const handleBottomTabUpdate = (index) => {
  navigationStore.setSelectedItem(index);
};
</script>

<style lang="scss" scoped>
.success-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  h2 {
    font-size: 24px;
    margin-bottom: 20px;
  }

  .success-step__img {
    max-height: 150px;
    margin-bottom: 20px;
  }

  .success-step__div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
  }
}

.highlight-red {
  color: rgb(176,0,32);
  font-weight: 600;
}
</style> 