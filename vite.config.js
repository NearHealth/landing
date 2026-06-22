import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'

// Stamps build metadata (UTC build time + latest commit SHA1) into the built
// index.html so the deployed version is identifiable. Hidden from the rendered
// page — surfaced via an HTML comment, <meta> tags, and a console banner /
// window.__BUILD__ global. Build-only; the dev server is left untouched.
function buildStamp() {
  return {
    name: 'build-stamp',
    apply: 'build',
    transformIndexHtml(html) {
      let commit = 'unknown'
      try {
        commit = execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
          .toString().trim()
      } catch { /* not a git checkout — leave as unknown */ }
      const now = new Date()
      const build = {
        time: now.toISOString(),     // 2026-06-12T18:30:11.123Z
        date: now.toUTCString(),     // Fri, 12 Jun 2026 18:30:11 GMT
        commit,                      // 40-char SHA1
        short: commit.slice(0, 7),   // a46195d
      }
      const comment =
        `<!-- build: ${build.time} | ${build.date} | commit ${build.commit} (${build.short}) -->`
      return {
        html: html.replace('</head>', `  ${comment}\n  </head>`),
        tags: [
          { tag: 'meta', attrs: { name: 'build-time',   content: build.time   }, injectTo: 'head' },
          { tag: 'meta', attrs: { name: 'build-date',   content: build.date   }, injectTo: 'head' },
          { tag: 'meta', attrs: { name: 'build-commit', content: build.commit }, injectTo: 'head' },
          {
            tag: 'script',
            children:
              `window.__BUILD__=${JSON.stringify(build)};` +
              `console.info("%c↗ build "+__BUILD__.short+" · "+__BUILD__.date,"color:#888")`,
            injectTo: 'head',
          },
        ],
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), buildStamp()],
  base: '/landing/',
  build: {
    rollupOptions: {
      // Multi-page app: the landing page (index.html) + the Terms page
      // (terms/index.html → served at /landing/terms/).
      input: {
        main: 'index.html',
        terms: 'terms/index.html',
        privacy: 'privacy/index.html',
      },
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
