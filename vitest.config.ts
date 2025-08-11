import { defineConfig } from 'vitest/config'
import dotenv from 'dotenv';
import react from '@vitejs/plugin-react'
import path from 'path'


dotenv.config({ path: '.env.test' });

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, 'src/components')
    }
  }
}) 