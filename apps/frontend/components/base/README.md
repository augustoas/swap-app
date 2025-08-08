# Base Components

## MediaGallery.vue

Un componente moderno y reutilizable para mostrar galerías de imágenes, videos y archivos.

### Características

- ✨ **Diseño minimalista**: Interfaz limpia y sin elementos sobrecargados
- 🖼️ **Carrusel de miniaturas**: Vista horizontal compacta con scroll
- 🔍 **Vista previa ampliada**: Modal simple con navegación entre medios
- ⬅️➡️ **Navegación**: Botones para ir a imagen anterior/siguiente
- 📱 **Responsive**: Adaptable a diferentes tamaños de pantalla
- ⬇️ **Descarga**: Botón centrado abajo con solo ícono, sin texto
- 🎨 **Personalizable**: Props para personalizar título y funcionalidades

### Uso

```vue
<template>
  <BaseMediaGallery 
    :media="jobImages"
    title="Archivos del trabajo"
    :show-download="true"
    @download-error="handleError"
  />
</template>

<script setup>
import BaseMediaGallery from '~/components/base/MediaGallery.vue';

const jobImages = [
  'https://example.com/image1.jpg',
  'https://example.com/video1.mp4',
  'https://example.com/document.pdf'
];

const handleError = (error) => {
  console.error('Error:', error);
};
</script>
```

### Props

| Prop | Tipo | Valor por defecto | Descripción |
|------|------|-------------------|-------------|
| `media` | `Array` | `[]` | Lista de URLs de archivos multimedia |
| `title` | `String` | `'Archivos adjuntos'` | Título de la galería |
| `showTitle` | `Boolean` | `true` | Mostrar/ocultar título |
| `showDownload` | `Boolean` | `true` | Mostrar/ocultar botón de descarga |

### Eventos

| Evento | Parámetros | Descripción |
|--------|------------|-------------|
| `download-start` | `url` | Se emite cuando inicia la descarga |
| `download-success` | `url` | Se emite cuando la descarga es exitosa |
| `download-error` | `{url, error}` | Se emite cuando hay error en la descarga |

### Formatos soportados

- **Imágenes**: JPG, JPEG, PNG, GIF, WebP, SVG
- **Videos**: MP4, WebM, OGG, MOV, AVI
- **Archivos**: Cualquier otro formato se mostrará como documento

### Responsive

- **Desktop**: Miniaturas de 80x80px con carrusel horizontal
- **Tablet**: Miniaturas de 60x60px con botones de navegación más pequeños
- **Mobile**: Miniaturas de 50x50px optimizadas para pantallas pequeñas 