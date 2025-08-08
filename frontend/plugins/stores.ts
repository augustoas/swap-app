export default defineNuxtPlugin((nuxtApp) => {
  // Initialize navigation store with view mode
  const navigationStore = useNavigationStore();
  const userStore = useUserStore();

  // Initialize the user store first (to get user data)
  if (userStore.isLoggedIn()) {
    userStore.setUserFromLocalStorage();
  }

  // Only run client-side operations
  if (process.client) {
    // Initialize navigation store components
    navigationStore.updateScreenSize();
    navigationStore.initializeSelectedItem();
    navigationStore.initializeViewMode();

    // Default to client view if not a swapper
    if (!userStore.isSwapper()) {
      navigationStore.setViewMode('client');
    }

    // Handle window resize
    window.addEventListener('resize', () => {
      navigationStore.updateScreenSize();
    });
  }
}); 