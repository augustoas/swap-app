<template>
  <v-dialog scrollable :fullscreen="fullScreen">
    <template v-slot:activator="{ props: activatorProps }">
      <NotificationButton v-bind="activatorProps"/>
    </template>

    <template v-slot:default="{ isActive }">
      <NotificationContent 
        v-if="isActive" 
        @close="isActive.value = false" 
        @toggleFullScreen="toggleFullScreen()" 
        :is-fullscreen="fullScreen"
      />
    </template>
  </v-dialog>
</template>

<script lang="ts" setup>
  const fullScreen = ref(false);
  const toggleFullScreen = () => fullScreen.value = !fullScreen.value;
</script>