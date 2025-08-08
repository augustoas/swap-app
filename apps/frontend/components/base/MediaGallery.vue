<template>
  <div class="media-gallery">
    <h3 v-if="showTitle" class="gallery-title">{{ title }}</h3>
    
    <!-- Thumbnails carousel -->
    <div class="thumbnails-container" v-if="media.length > 0">
      <div class="thumbnails-carousel" ref="carouselRef">
        <div 
          v-for="(item, index) in media" 
          :key="index"
          class="thumbnail-item"
          @click="openPreview(index)"
        >
          <div class="thumbnail">
            <img v-if="isImage(item)" :src="item" alt="Thumbnail" />
            <video v-else-if="isVideo(item)" :src="item" muted></video>
            <div v-else class="file-thumbnail">
              <v-icon color="#666">mdi-file-document</v-icon>
              <span class="file-extension">{{ getFileExtension(item) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Scroll buttons -->
      <button 
        v-if="canScrollLeft" 
        class="scroll-btn scroll-left" 
        @click="scrollCarousel('left')"
      >
        <v-icon>mdi-chevron-left</v-icon>
      </button>
      <button 
        v-if="canScrollRight" 
        class="scroll-btn scroll-right" 
        @click="scrollCarousel('right')"
      >
        <v-icon>mdi-chevron-right</v-icon>
      </button>
    </div>

    <!-- Download all button -->
    <div v-if="showDownload && media.length > 1" class="download-all">
      <v-btn variant="outlined" size="small" @click="downloadAll">
        Descargar todo
      </v-btn>
    </div>
  </div>

  <!-- Preview Modal -->
  <v-dialog v-model="previewDialog" fullscreen hide-overlay class="preview-dialog">
    <div class="modal-overlay" @click="previewDialog = false">
      <!-- Close button - TOP RIGHT -->
      <button class="close-button" @click="previewDialog = false">
        <v-icon>mdi-close</v-icon>
      </button>

      <!-- Main image -->
      <div class="image-container" @click.stop>
        <img 
          v-if="isImage(currentMedia)" 
          :src="currentMedia" 
          class="main-image"
          @click="nextMedia"
        />
        <video 
          v-else-if="isVideo(currentMedia)" 
          :src="currentMedia" 
          controls 
          class="main-video"
        />
        <div v-else class="file-preview">
          <v-icon size="64" color="white">mdi-file-document</v-icon>
          <p>{{ getFileName(currentMedia) }}</p>
        </div>
      </div>

      <!-- Bottom controls -->
      <div class="bottom-controls">
        <!-- Navigation and download buttons -->
        <div class="controls-row">
          <button 
            v-if="media.length > 1"
            class="control-btn" 
            @click="previousMedia"
            :disabled="currentIndex === 0"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </button>
          
          <button 
            v-if="showDownload"
            class="control-btn download-btn" 
            @click="downloadMedia(currentMedia)"
            :disabled="downloading"
          >
            <v-icon>{{ downloading ? 'mdi-loading mdi-spin' : 'mdi-download' }}</v-icon>
          </button>
          
          <button 
            v-if="media.length > 1"
            class="control-btn" 
            @click="nextMedia"
            :disabled="currentIndex === media.length - 1"
          >
            <v-icon>mdi-chevron-right</v-icon>
          </button>
        </div>

        <!-- Counter -->
        <div v-if="media.length > 1" class="counter">
          {{ currentIndex + 1 }} / {{ media.length }}
        </div>
      </div>
    </div>
  </v-dialog>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue';

const props = defineProps({
  media: {
    type: Array,
    required: true,
    default: () => []
  },
  title: {
    type: String,
    default: 'Archivos adjuntos'
  },
  showTitle: {
    type: Boolean,
    default: true
  },
  showDownload: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['download-start', 'download-success', 'download-error']);

// Refs
const previewDialog = ref(false);
const currentIndex = ref(0);
const downloading = ref(false);
const carouselRef = ref(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

// Computed
const currentMedia = computed(() => props.media[currentIndex.value]);

// Utils
const isImage = (url) => {
  return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
};

const isVideo = (url) => {
  return /\.(mp4|webm|ogg|mov|avi)$/i.test(url);
};

const getFileName = (url) => {
  try {
    return url.split('/').pop() || 'archivo';
  } catch {
    return 'archivo';
  }
};

const getFileExtension = (url) => {
  try {
    const fileName = url.split('/').pop();
    const extension = fileName.split('.').pop();
    return extension.toUpperCase();
  } catch {
    return 'FILE';
  }
};

// Preview functions
const openPreview = (index) => {
  currentIndex.value = index;
  previewDialog.value = true;
};

const nextMedia = () => {
  if (currentIndex.value < props.media.length - 1) {
    currentIndex.value++;
  }
};

const previousMedia = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};

// Carousel functions
const scrollCarousel = (direction) => {
  const carousel = carouselRef.value;
  if (!carousel) return;
  
  const scrollAmount = 120;
  const currentScroll = carousel.scrollLeft;
  
  if (direction === 'left') {
    carousel.scrollTo({
      left: currentScroll - scrollAmount,
      behavior: 'smooth'
    });
  } else {
    carousel.scrollTo({
      left: currentScroll + scrollAmount,
      behavior: 'smooth'
    });
  }
  
  setTimeout(updateScrollButtons, 300);
};

const updateScrollButtons = () => {
  const carousel = carouselRef.value;
  if (!carousel) return;
  
  canScrollLeft.value = carousel.scrollLeft > 0;
  canScrollRight.value = carousel.scrollLeft < (carousel.scrollWidth - carousel.clientWidth);
};

// Download functions
const downloadMedia = async (url) => {
  try {
    downloading.value = true;
    emit('download-start', url);
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al descargar el archivo');
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = getFileName(url);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
    emit('download-success', url);
  } catch (error) {
    console.error('Error downloading media:', error);
    emit('download-error', { url, error: error.message });
  } finally {
    downloading.value = false;
  }
};

const downloadAll = async () => {
  for (const mediaUrl of props.media) {
    await downloadMedia(mediaUrl);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};

// Lifecycle
onMounted(() => {
  nextTick(() => {
    updateScrollButtons();
    
    const carousel = carouselRef.value;
    if (carousel) {
      carousel.addEventListener('scroll', updateScrollButtons);
    }
  });
});
</script>

<style lang="scss" scoped>
.media-gallery {
  margin-top: 16px;
}

.gallery-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
}

/* Thumbnails carousel */
.thumbnails-container {
  position: relative;
  margin-bottom: 12px;
}

.thumbnails-carousel {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 4px 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.thumbnails-carousel::-webkit-scrollbar {
  display: none;
}

.thumbnail-item {
  flex-shrink: 0;
  cursor: pointer;
}

.thumbnail {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid transparent;
  transition: border-color 0.2s ease;
}

.thumbnail:hover {
  border-color: var(--base-light-blue);
}

.thumbnail img,
.thumbnail video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-thumbnail {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
}

.file-extension {
  font-size: 10px;
  font-weight: 500;
  color: #666;
  margin-top: 2px;
}

/* Scroll buttons */
.scroll-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease;
  z-index: 2;
}

.scroll-btn:hover {
  background: #f5f5f5;
}

.scroll-left {
  left: -16px;
}

.scroll-right {
  right: -16px;
}

/* Download all button */
.download-all {
  text-align: center;
  margin-top: 8px;
}

/* =========================
   MODAL STYLES
   ========================= */

.preview-dialog {
  .v-overlay__content {
    height: 100%;
    width: 100%;
    margin: 0;
    max-height: none;
    max-width: none;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Close button - TOP RIGHT CORNER */
.close-button {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;
  z-index: 1000;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

/* Image container - CENTER */
.image-container {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 90vw;
  max-height: 80vh;
}

.main-image,
.main-video {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  cursor: pointer;
}

.file-preview {
  text-align: center;
  color: white;
  padding: 40px;
}

.file-preview p {
  margin: 16px 0;
  font-size: 18px;
}

/* Bottom controls - BOTTOM CENTER */
.bottom-controls {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  z-index: 1000;
}

.controls-row {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(0, 0, 0, 0.8);
  padding: 12px 20px;
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.control-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;
}

.control-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.control-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: none;
}

.download-btn {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
}

.counter {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.mdi-spin {
  animation: spin 1s linear infinite;
}

/* Responsive */
@media (max-width: 768px) {
  .thumbnail {
    width: 60px;
    height: 60px;
  }
  
  .close-button {
    top: 15px;
    right: 15px;
    width: 40px;
    height: 40px;
  }
  
  .control-btn {
    width: 40px;
    height: 40px;
  }
  
  .controls-row {
    gap: 12px;
    padding: 10px 16px;
  }
  
  .image-container {
    max-width: 95vw;
    max-height: 75vh;
  }
}

@media (max-width: 480px) {
  .thumbnail {
    width: 50px;
    height: 50px;
  }
  
  .close-button {
    width: 36px;
    height: 36px;
  }
  
  .control-btn {
    width: 36px;
    height: 36px;
  }
  
  .controls-row {
    gap: 10px;
    padding: 8px 12px;
  }
  
  .counter {
    font-size: 12px;
    padding: 6px 12px;
  }
}
</style> 