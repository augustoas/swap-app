<template>
  <div class="media-gallery-example">
    <h2>Ejemplo de MediaGallery</h2>
    
    <div class="example-section">
      <h3>Galería con imágenes de ejemplo</h3>
      <BaseMediaGallery 
        :media="sampleImages"
        title="Imágenes de ejemplo"
        @download-error="handleDownloadError"
        @download-success="handleDownloadSuccess"
      />
    </div>
    
    <div class="example-section">
      <h3>Galería sin título</h3>
      <BaseMediaGallery 
        :media="sampleMixed"
        :show-title="false"
        @download-error="handleDownloadError"
      />
    </div>
    
    <div class="example-section">
      <h3>Galería sin botón de descarga</h3>
      <BaseMediaGallery 
        :media="sampleImages"
        title="Solo vista previa"
        :show-download="false"
      />
    </div>
    
    <div class="controls">
      <v-btn @click="addSampleImage" color="primary">
        Agregar imagen de ejemplo
      </v-btn>
      <v-btn @click="clearImages" color="secondary" class="ml-2">
        Limpiar galería
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import BaseMediaGallery from './MediaGallery.vue';

const sampleImages = ref([
  'https://picsum.photos/400/300?random=1',
  'https://picsum.photos/400/300?random=2',
  'https://picsum.photos/400/300?random=3',
  'https://picsum.photos/400/300?random=4',
  'https://picsum.photos/400/300?random=5',
  'https://picsum.photos/400/300?random=6'
]);

const sampleMixed = ref([
  'https://picsum.photos/400/300?random=7',
  'https://picsum.photos/400/300?random=8'
]);

const handleDownloadError = (error) => {
  console.error('Error al descargar:', error);
  alert('Error al descargar el archivo');
};

const handleDownloadSuccess = (url) => {
  console.log('Descarga exitosa:', url);
  alert('Archivo descargado exitosamente');
};

const addSampleImage = () => {
  const randomId = Math.floor(Math.random() * 1000);
  sampleImages.value.push(`https://picsum.photos/400/300?random=${randomId}`);
};

const clearImages = () => {
  sampleImages.value = [];
};
</script>

<style lang="scss" scoped>
.media-gallery-example {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.example-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f9f9f9;
}

.example-section h3 {
  margin-top: 0;
  color: var(--base-dark-blue);
  font-size: 18px;
  margin-bottom: 16px;
}

.controls {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    gap: 8px;
  }
}
</style> 