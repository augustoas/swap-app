export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ["vuetify-nuxt-module", "@vite-pwa/nuxt", "@pinia/nuxt"],
  vuetify: {
    moduleOptions: {
      /* module specific options */
    },
    vuetifyOptions: {
      /* vuetify options */
      labComponents: true
    }
  },
  css: [
    '~/assets/scss/main.scss'
  ],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/assets/scss/variables.scss";`
        }
      }
    }
  },
  pwa: {
    manifest: {
      name: 'Swap App',
      short_name: 'Swap',
      lang: 'es',
      display: 'standalone',
      theme_color: '#293A44',
      background_color: '#ffffff',
      icons: [
        {
          src: '/icon.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    }
  },
})