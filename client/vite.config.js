import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { defaultSeoTags, organizationLd } from './src/lib/site-head.js'

// Fills the site-wide <head> tags from Site settings, so the domain, contact details
// and share image always match what is published from the admin panel.
function siteHead() {
  return {
    name: 'site-head',
    transformIndexHtml(html) {
      return html.replace('<!--site-seo-->', defaultSeoTags()).replace('<!--site-ld-->', organizationLd())
    },
  }
}

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), siteHead()],
  server: {
    // Local API (npm run server) — same /api path the live site uses
    proxy: { '/api': 'http://localhost:4000' },
    // The content model lives in ../shared, outside this folder
    fs: { allow: ['..'] },
  },
  // CommonJS package: bundle it into the prerender build instead of importing it from Node
  ssr: { noExternal: ['react-helmet-async'] },
  build: {
    rollupOptions: {
      output: {
        // The prerender bundle (scripts/prerender.mjs) keeps dependencies external
        manualChunks: isSsrBuild
          ? undefined
          : {
              vendor: ['react', 'react-dom'],
              router: ['react-router-dom'],
              seo: ['react-helmet-async'],
            },
      },
    },
    minify: isSsrBuild ? false : 'terser',
    terserOptions: {
      compress: { drop_console: true, drop_debugger: true },
    },
    chunkSizeWarningLimit: 500,
  },
}))
