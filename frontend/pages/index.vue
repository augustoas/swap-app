<template>
  <div class="landing-container">
    <!-- Hero Section with Parallax Effect -->
    <div class="hero-section">
      <div class="parallax-container">
        <img 
          src="/landing-page.jpg"
          alt="Hero Image"
          class="parallax-image"
          ref="parallaxImage"
        />
        <div class="hero-content">
          <!-- Client Section -->
          <div class="hero-text-container client-container">
            <h1 class="hero-title">Expertos de confianza en tu hogar fácil y rápido</h1>
            <p class="hero-subtitle">
              Expertos del hogar verificados y a un click de distancia.
            </p>
            <div class="hero-buttons">
              <BaseButton 
                class="hero-button primary-button"
                text="Publica un trabajo"
                color="var(--button-light-blue)"
                @click="navigateTo('/post')"
              />
            </div>
          </div>
          
          <!-- Swapper Section - Only show if user is not already a swapper -->
          <div v-if="!isSwapper" class="hero-text-container swapper-container">
            <h1 class="hero-title">¿Quieres empezar a ganar dinero con nosotros?</h1>
            <p class="hero-subtitle">
              Es muy fácil, solo debes postular acá:
            </p>
            <div class="hero-buttons">
              <BaseButton 
                class="hero-button secondary-button"
                text="Quiero ser Swapper"
                color="white"
                @click="navigateTo('/profile/newswapper')"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Job Creation Section -->
    <div class="quick-job-section">
      <QuickJobCreate />
    </div>

    <!-- Services Carousel Section -->
    <div class="services-section">
      <h2 class="section-title">Nuestros servicios</h2>
      <div class="carousel-container" ref="carousel">
        <div class="carousel-track" ref="carouselTrack">
          <div v-for="(service, index) in services" :key="index" class="carousel-item" :class="{active: activeIndex === index}">
            <div class="service-card">
              <div class="service-icon-wrapper">
                <i :class="service.icon" class="service-icon"></i>
              </div>
              <span class="service-name">{{ service.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="features-section">
      <div class="features-container">
        <h2 class="section-title features-title">Seguridad y confianza para tu tranquilidad</h2>
        
        <div class="features-grid">
          <!-- Feature 1 -->
          <div class="feature-item" data-aos="fade-up" data-aos-delay="0">
            <div class="feature-icon">
              <img src="~/assets/Icons/icon-shield.png" alt="Pagos seguros">
            </div>
            <div class="feature-content">
              <h3 class="feature-title">Pagos seguros</h3>
              <p class="feature-description">Liberamos el pago cuando el trabajo se completa con éxito</p>
            </div>
          </div>

          <!-- Feature 2 -->
          <div class="feature-item" data-aos="fade-up" data-aos-delay="0">
            <div class="feature-icon">
              <img src="~/assets/Icons/icon-check.png" alt="Proveedores verificados">
            </div>
            <div class="feature-content">
              <h3 class="feature-title">Proveedores verificados</h3>
              <p class="feature-description">Validamos la identidad y expertiz antes de unirse a la plataforma</p>
            </div>
          </div>

          <!-- Feature 3 -->
          <div class="feature-item" data-aos="fade-up" data-aos-delay="0">
            <div class="feature-icon">
              <img src="~/assets/Icons/icon-star.png" alt="Calificaciones transparentes">
            </div>
            <div class="feature-content">
              <h3 class="feature-title">Calificaciones transparentes</h3>
              <p class="feature-description">Elige un experto según las reseñas reales de otros usuarios</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Call to Action Section -->
    <div class="cta-section">
      <div class="cta-container">
        <h2 class="cta-title">¿Listo para transformar tu hogar?</h2>
        <p class="cta-text">Encuentra al experto perfecto para cualquier proyecto en tu hogar</p>
        <BaseButton 
          text="Comenzar"
          color="var(--button-light-blue)"
          @click="navigateTo('/post')"
        />
      </div>
    </div>

    <!-- Footer Section -->
    <footer class="footer-section">
      <div class="footer-container">
        <div class="footer-top">
          <div class="footer-logo">
            <img src="~/assets/logos/swap-logo3.png" alt="Swap Logo" class="footer-logo-img">
          </div>
          <div class="footer-links">
            <div class="footer-links-column">
              <h3 class="footer-column-title">Servicios</h3>
              <ul class="footer-menu">
                <li><a href="#" class="footer-link">Electricidad</a></li>
                <li><a href="#" class="footer-link">Plomería</a></li>
                <li><a href="#" class="footer-link">Pintura</a></li>
                <li><a href="#" class="footer-link">Carpintería</a></li>
              </ul>
            </div>
            <div class="footer-links-column">
              <h3 class="footer-column-title">Empresa</h3>
              <ul class="footer-menu">
                <li><a href="#" class="footer-link">Sobre nosotros</a></li>
                <li><a href="#" class="footer-link">Términos y condiciones</a></li>
                <li><a href="#" class="footer-link">Política de privacidad</a></li>
                <li><a href="#" class="footer-link">Blog</a></li>
              </ul>
            </div>
            <div class="footer-links-column">
              <h3 class="footer-column-title">Contacto</h3>
              <ul class="footer-menu">
                <li><a href="mailto:soporte@swap.cl" class="footer-link">soporte@swap.cl</a></li>
                <li><a href="tel:+56912345678" class="footer-link">+56 9 1234 5678</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <div class="footer-copyright">
            <p>© 2025 Swap. Todos los derechos reservados.</p>
          </div>
          <div class="footer-social">
            <a href="#" class="social-icon-link"><i class="mdi mdi-instagram"></i></a>
            <a href="#" class="social-icon-link"><i class="mdi mdi-facebook"></i></a>
            <a href="#" class="social-icon-link"><i class="mdi mdi-whatsapp"></i></a>
            <a href="#" class="social-icon-link"><i class="mdi mdi-twitter"></i></a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigationStore } from '~/stores/navigationStore';
import heroImage from '~/assets/images/landing-page.jpg';
import QuickJobCreate from '~/components/landing/QuickJobCreate.vue';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Navigation store for routing
const navigationStore = useNavigationStore();
const userStore = useUserStore();
const router = useRouter();
const { isSwapper } = useSwapperView();

// Parallax effect refs
const parallaxImage = ref(null);
const heroImageSrc = heroImage;

// Carousel refs and state
const carousel = ref(null);
const carouselTrack = ref(null);
const activeIndex = ref(0);
const itemsPerView = ref(5); // Default for desktop
const autoplayInterval = ref(null);

// Services data
const services = [
  { name: 'Eléctrico', icon: 'mdi mdi-lightning-bolt' },
  { name: 'Maestro', icon: 'mdi mdi-hammer' },
  { name: 'Pintor', icon: 'mdi mdi-brush' },
  { name: 'Mascotas', icon: 'mdi mdi-paw' },
  { name: 'Gasfíter', icon: 'mdi mdi-pipe' },
  { name: 'Jardinería', icon: 'mdi mdi-flower' },
  { name: 'Limpieza', icon: 'mdi mdi-broom' },
  { name: 'Muebles', icon: 'mdi mdi-sofa' }
];

// Navigation function
const navigateTo = (path) => {
  // Check if user is trying to access /post and is not logged in
  if (path === '/post' && !userStore.isLoggedIn()) {
    router.push('/login');
    return;
  }
  
  // Update bottom tab if needed
  if (path === '/post') {
    navigationStore.setSelectedItem(2); // Assuming 2 is the index for the post tab
  }
  router.push(path);
};

// Carousel functions
const updateItemsPerView = () => {
  if (window.innerWidth < 600) {
    itemsPerView.value = 2;
  } else if (window.innerWidth < 960) {
    itemsPerView.value = 3;
  } else {
    itemsPerView.value = 5;
  }
};

const nextSlide = () => {
  const maxIndex = services.length - itemsPerView.value;
  activeIndex.value = Math.min(activeIndex.value + 1, maxIndex);
  updateCarouselPosition();
};

const prevSlide = () => {
  activeIndex.value = Math.max(activeIndex.value - 1, 0);
  updateCarouselPosition();
};

const goToSlide = (index) => {
  const groupIndex = Math.floor(index / itemsPerView.value) * itemsPerView.value;
  activeIndex.value = Math.min(groupIndex, services.length - itemsPerView.value);
  updateCarouselPosition();
};

const updateCarouselPosition = () => {
  if (carouselTrack.value) {
    const itemWidth = carouselTrack.value.firstElementChild?.offsetWidth;
    const gap = 16; // match with CSS gap
    gsap.to(carouselTrack.value, {
      x: -(activeIndex.value * (itemWidth + gap)),
      duration: 0.8,
      ease: 'power2.inOut' // Smoother transition
    });
  }
};

// Start autoplay for carousel
const startAutoplay = () => {
  autoplayInterval.value = setInterval(() => {
    const maxIndex = services.length - itemsPerView.value;
    if (activeIndex.value >= maxIndex) {
      // Smoothly scroll back to the beginning
      gsap.to(carouselTrack.value, {
        x: 0,
        duration: 1.2,
        ease: 'power2.inOut'
      });
      activeIndex.value = 0;
    } else {
      activeIndex.value++;
      updateCarouselPosition();
    }
  }, 3000); // Scroll every 3 seconds for a smooth experience
};

// Handle window resize
const handleResize = () => {
  updateItemsPerView();
  updateCarouselPosition();
  
  // Reinitialize parallax effect on resize
  initParallaxEffect();
};

// Initialize parallax effect
const initParallaxEffect = () => {
  if (parallaxImage.value) {
    gsap.to(parallaxImage.value, {
      y: '30%',
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }
};

// Lifecycle hooks
onMounted(() => {
  // Initialize animations
  initParallaxEffect();
  
  // Add scroll animations for features - ensure all feature-items animate correctly
  const featureItems = document.querySelectorAll('.feature-item');
  
  featureItems.forEach((feature, i) => {
    // Reset any existing animations that might be causing issues
    gsap.set(feature, { clearProps: 'all' });
    
    // Apply new animation
    gsap.from(feature, {
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: feature,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
      delay: i * 0.2
    });
  });
  
  // Initialize carousel
  updateItemsPerView();
  startAutoplay();
  
  // Add window resize listener
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  // Clean up
  window.removeEventListener('resize', handleResize);
  clearInterval(autoplayInterval.value);
});
</script>

<style lang="scss" scoped>
@font-face {
  font-family: 'Poppins';
  src: url('~/assets/fonts/Poppins/Poppins-SemiBold.ttf') format('truetype');
  font-weight: 600;
}

@font-face {
  font-family: 'Poppins';
  src: url('~/assets/fonts/Poppins/Poppins-Regular.ttf') format('truetype');
  font-weight: 400;
}

// Global styles
.landing-container {
  margin: 0;
  padding: 0;
  width: 100%;
  overflow-x: hidden;
  font-family: 'Poppins', sans-serif;
}

.section-title {
  font-family: 'Poppins', sans-serif;
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 32px;
  text-align: center;
  color: var(--base-dark-blue);
  
  &.features-title {
    color: white;
  }
}

// Hero Section with Parallax
.hero-section {
  position: relative;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  margin-left: calc(-50vw + 50%);
  margin-right: calc(-50vw + 50%);
  background-color: var(--base-dark-blue); /* Fallback color if image fails to load */
  background-image: url('/landing-page.jpg');
  background-size: cover;
  background-position: center;
}

.parallax-container {
  position: relative;
  height: 100%;
  width: 100%;
}

.parallax-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0; /* Changed from -1 to 0 */
  transform: scale(1.1);
  filter: brightness(0.8);
}

.hero-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 20px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6));
  z-index: 1;
  gap: 30px;
}

.hero-text-container {
  max-width: 700px;
  padding: 35px;
  backdrop-filter: blur(3px);
  border-radius: 15px;
  background-color: rgba(0, 0, 0, 0.25);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  
  &.client-container {
    margin-bottom: 0;
  }
  
  &.swapper-container {
    margin-top: 0;
  }
}

.hero-title {
  font-family: 'Poppins', sans-serif;
  font-size: clamp(24px, 4.5vw, 42px);
  font-weight: 600;
  color: white;
  margin-bottom: 18px;
  line-height: 1.2;
  text-align: center;
}

.hero-subtitle {
  font-family: 'Poppins', sans-serif;
  font-size: clamp(14px, 2.2vw, 18px);
  font-weight: 400;
  color: white;
  margin-bottom: 35px;
  line-height: 1.4;
  text-align: center;
}

.hero-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  width: 100%;
  
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: center;
  }
}

.hero-button {
  min-width: 200px;
  height: 50px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  
  &.primary-button {
    background-color: var(--button-light-blue);
    color: white;
  }
  
  &.secondary-button {
    background-color: white;
    color: var(--base-dark-blue);
    border: 2px solid var(--base-dark-blue);
  }
}

// Services Carousel Section
.services-section {
  padding: 80px 20px 100px;
  background-color: #f9f9f9;
}

.carousel-container {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  overflow: hidden;
  padding: 0 20px;
}

.carousel-track {
  display: flex;
  gap: 16px;
  transition: transform 0.8s ease-in-out;
  padding: 10px 0 20px; // Add some padding for hover effects
}

.carousel-item {
  flex: 0 0 auto;
  width: calc(20% - 13px); // Adjust based on itemsPerView
  
  @media (max-width: 960px) {
    width: calc(33.33% - 11px);
  }
  
  @media (max-width: 600px) {
    width: calc(50% - 8px);
  }
}

.service-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: white;
  border-radius: 12px;
  padding: 24px 16px;
  height: 140px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
}

.service-icon-wrapper {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--base-dark-blue);
  border-radius: 50%;
  color: white;
}

.service-icon {
  font-size: 24px;
}

.service-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--base-dark-blue);
  text-align: center;
}

// Features Section
.features-section {
  padding: 80px 20px;
  background: linear-gradient(to bottom, var(--base-dark-blue), var(--button-light-blue));
  color: white;
}

.features-container {
  max-width: 1200px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  margin-top: 40px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-5px);
  }
}

.feature-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.feature-content {
  flex-grow: 1;
}

.feature-title {
  color: white;
  font-family: 'Poppins', sans-serif;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

.feature-description {
  color: rgba(255, 255, 255, 0.9);
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
}

// Call to Action Section
.cta-section {
  padding: 80px 20px;
  background-color: #f9f9f9;
}

.cta-container {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cta-title {
  font-size: 36px;
  font-weight: 600;
  color: var(--base-dark-blue);
  margin-bottom: 16px;
  text-align: center;
}

.cta-text {
  font-size: 18px;
  color: #555;
  margin-bottom: 32px;
  text-align: center;
  max-width: 600px;
}

.cta-button {
  min-width: 200px;
  height: 50px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  background-color: var(--button-light-blue);
  color: white;
  margin: 0 auto;
  display: block;
}

// Footer Section
.footer-section {
  background-color: var(--base-dark-blue);
  color: white;
  padding: 64px 20px 32px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-top {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 48px;
  gap: 40px;
}

.footer-logo {
  flex: 0 0 200px;
}

.footer-logo-img {
  width: 100%;
  max-width: 150px;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  flex: 1;
  justify-content: space-around;
}

.footer-links-column {
  min-width: 160px;
}

.footer-column-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: white;
}

.footer-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-link {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 10px;
  transition: color 0.3s ease;
  
  &:hover {
    color: white;
  }
}

.footer-bottom {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 24px;
  gap: 20px;
}

.footer-copyright {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.footer-social {
  display: flex;
  gap: 16px;
}

.social-icon-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--button-light-blue);
    transform: translateY(-3px);
  }
  
  i {
    font-size: 20px;
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .footer-top {
    flex-direction: column;
    gap: 32px;
  }
  
  .footer-logo {
    text-align: center;
    flex: 0 0 100%;
  }
  
  .footer-links {
    justify-content: space-between;
  }
  
  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }
  
  .section-title {
    font-size: 28px;
  }
  
  .feature-item {
    padding: 20px;
  }
  
  .cta-title {
    font-size: 28px;
  }
}

@media (max-width: 480px) {
  .hero-content {
    gap: 20px;
    padding: 0 15px;
  }
  
  .hero-text-container {
    max-width: 100%;
    padding: 25px 20px;
    
    &.client-container, &.swapper-container {
      margin: 0;
    }
  }
  
  .hero-buttons {
    width: 100%;
    
    .hero-button {
      width: 100%;
    }
  }
  
  .feature-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .feature-icon {
    margin-bottom: 16px;
  }
  
  .footer-links {
    flex-direction: column;
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .hero-content {
    gap: 25px;
  }
  
  .hero-text-container {
    max-width: 90%;
    padding: 30px 25px;
  }
}

/* Quick Job Section */
.quick-job-section {
  padding: 0 20px;
  margin-top: -60px;
  margin-bottom: 40px;
  position: relative;
  z-index: 10;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

@media (min-width: 768px) {
  .quick-job-section {
    margin-top: -80px;
    margin-bottom: 60px;
  }
}

@media (max-width: 600px) {
  .quick-job-section {
    margin-top: -30px;
    margin-bottom: 30px;
    padding: 0 10px;
  }
}
</style>


