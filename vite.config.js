// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
    // Inject environment variables at build time
    define: {
        __GOOGLE_MAPS_API_KEY__: JSON.stringify(process.env.VITE_GOOGLE_MAPS_API_KEY)
    },
    server: {
        host: '0.0.0.0', 
        port: 3000,
        open: true
    },
    css: {
        devSourcemap: true
    },
    envPrefix: 'VITE_',
    build: {
        sourcemap: false, // Disable sourcemaps in production for security
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['leaflet']
                }
            }
        }
    }
})