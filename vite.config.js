import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/ct-urban-agriculture-portal/',
  plugins: [react()],
})
