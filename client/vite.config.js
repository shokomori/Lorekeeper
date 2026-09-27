import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const clientDir = path.dirname(fileURLToPath(import.meta.url))
const wallpaperDir = path.resolve(clientDir, '../project/wallpapers')
const wallpaperFiles = {
  'archive-gate.jpg': 'wallpaperflare.com_wallpaper.jpg',
  'forest-settlement.jpg': 'wallpaperflare.com_wallpaper (1).jpg',
}

function wallpaperAssets() {
  return {
    name: 'lorekeeper-wallpaper-assets',
    configureServer(server) {
      server.middlewares.use('/assets/wallpapers', (request, response, next) => {
        const requestedName = path.basename(request.url || '')
        const sourceName = wallpaperFiles[requestedName]
        if (!sourceName) return next()

        const sourcePath = path.join(wallpaperDir, sourceName)
        if (!fs.existsSync(sourcePath)) return next()
        response.setHeader('Content-Type', 'image/jpeg')
        fs.createReadStream(sourcePath).pipe(response)
      })
    },
    generateBundle() {
      for (const [outputName, sourceName] of Object.entries(wallpaperFiles)) {
        const sourcePath = path.join(wallpaperDir, sourceName)
        if (fs.existsSync(sourcePath)) this.emitFile({ type: 'asset', fileName: `assets/wallpapers/${outputName}`, source: fs.readFileSync(sourcePath) })
      }
    },
  }
}

// VITE_BASE_PATH is set by the Pages workflow to "/<repository-name>/", because
// a GitHub project page is served from a subfolder, not the root of the domain.
// Everywhere else (local dev, Vercel, Netlify, a custom domain) the root is
// correct, so the default is "/". Page 7 of content/extending-your-app explains
// what goes wrong without this: a blank white page and 404s on every asset.
export default defineConfig({
  plugins: [react(), wallpaperAssets()],
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    // Only used by `npm run dev`. It is NOT part of the production build, which
    // is why the deployed site needs CORS and this does not. See page 8.
    proxy: {
      '/api': 'http://localhost:4055',
    },
  },
})
