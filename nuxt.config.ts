export default defineNuxtConfig({
  compatibilityDate: '2026-11-11',

  devtools: {
    enabled: true
  },

  modules: ['vuetify-nuxt-module'],

  css: [
    '~/assets/css/main.css',
    'cropperjs/dist/cropper.css'
  ],

  runtimeConfig: {
    public: {
      // Set NUXT_PUBLIC_GOOGLE_CLIENT_ID in your local .env file.
      googleClientId: ''
    }
  },

  app: {
    head: {
      title: 'Cropper Studio',
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1'
        },
        {
          name: 'description',
          content: 'A simple, modern image editor powered by Cropper.js'
        },
        {
          name: 'theme-color',
          content: '#f7f8fc'
        }
      ]
    }
  }
})
