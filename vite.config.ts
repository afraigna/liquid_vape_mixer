import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Chemin de base pour GitHub Pages : github.com/afraigna/liquid_vape_mixer
  base: '/liquid_vape_mixer/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Le proxy vers Express n'est plus nécessaire (localStorage remplace l'API)
  },
})
