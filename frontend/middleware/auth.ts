export default defineNuxtRouteMiddleware((to, from) => {
  const userStore = useUserStore();
  if (process.client) {
    // If the user is not logged in, redirect to the login page
    if (!userStore.isLoggedIn()) {
      return navigateTo('/login');
    }
  }
})