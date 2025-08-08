export default defineNuxtPlugin((nuxtApp) => {
  // Access the user store to check the authentication status and retrieve the user token
  const userStore = useUserStore();
  // Create a customized API instance using $fetch
  const api = $fetch.create({
    baseURL: 'http://localhost:4000/backend/', // Base URL for API requests
    // baseURL: 'http://34.23.210.192/backend',
    // This hook is executed before every request
    onRequest({ request, options, error }) {
      // Check if the user is logged in
      if (userStore.isLoggedIn()) {
        // Ensure headers exist in the request options
        const headers = options.headers ||= {}
        // Add the Authorization header to the request depending on the headers type
        if (Array.isArray(headers)) {
          // If headers are an array, push a new Authorization header
          headers.push(['Authorization', `Bearer ${userStore.getToken}`])
        } else if (headers instanceof Headers) {
          // If headers are a Headers object, use the set method
          headers.set('Authorization', `Bearer ${userStore.getToken}`)
        } else {
          // For plain object headers, add Authorization directly
          headers.Authorization = `Bearer ${userStore.getToken}`
        }
      }
    },
    // This hook is executed if a response error occurs
    async onResponseError({ response }) {
      // If the server responds with a 401 (Unauthorized), redirect the user to the login page
      if (response.status === 401) {
        await nuxtApp.runWithContext(() => navigateTo('/login'))
      }
    }
  });
  // Provide the API instance globally so it can be accessed across the application
  return {
    provide: {
      api,
    }
  }
});
