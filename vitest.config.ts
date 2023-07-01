import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      100: true
    },
    environment: 'happy-dom'
  }
})
