// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/i18n'],
  i18n: {
    locales: [
      { code: 'ja', language: 'ja-JP', name: '日本語' },
      { code: 'en', language: 'en-US', name: 'English' },
    ],
    defaultLocale: 'ja',
    strategy: 'no_prefix',

    // 重要：langDir/file 方式をやめて、ここから読み込む
    vueI18n: './i18n.config.ts',
  },
  runtimeConfig: {
    public: {
      partyKitHost: process.env.PARTYKIT_HOST || 'localhost:1999',
    },
  },
})