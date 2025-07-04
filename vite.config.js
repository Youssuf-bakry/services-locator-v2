// vite.config.js
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

export default defineConfig({
    plugins: [preact()],
    
    // Inject environment variables at build time
    define: {
        __GOOGLE_MAPS_API_KEY__: JSON.stringify(process.env.local.VITE_GOOGLE_MAPS_API_KEY)
    },
    
    server: {
        host: '0.0.0.0', // Allow access from network
        port: 3000,
        open: true
    },
    
    css: {
        devSourcemap: true
    },
    
    // Handle environment variables
    envPrefix: 'VITE_',
    
    build: {
        sourcemap: false, // Disable sourcemaps in production for security
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['preact', 'leaflet']
                }
            }
        }
    }
})