import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/landing/',
  build: {
    rollupOptions: {
      output: {
        // Split heavy third-party libs into parallel chunks so the React app
        // shell can hydrate without waiting on GSAP / Lottie / Lenis to parse.
        // Rolldown (Vite 8) requires manualChunks as a function, not an object.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          // Intentionally NOT grouping @lottiefiles/dotlottie-react — leaving it
          // unnamed lets Vite emit it as a true async chunk (no modulepreload),
          // so React.lazy() actually defers the ~330 KB Lottie runtime past
          // first paint. Naming it would re-add it to the static preload graph.
          if (id.includes('/gsap/')) return 'gsap'
          if (id.includes('/lenis/')) return 'lenis'
          if (id.includes('/react-dom/') || id.includes('/react/')) return 'react'
        },
      },
    },
  },
})
