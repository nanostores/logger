import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      all: false,
      thresholds: {
        lines: 100
      }
    },
    environment: 'happy-dom'
  }
})
