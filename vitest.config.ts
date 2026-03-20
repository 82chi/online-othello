import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.test.ts'],
    alias: {
      '~/': resolve(__dirname, './app/'),
    },
  },
})
