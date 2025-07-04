// vite.config.js - Simplified and safer
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

export default defineConfig({
    plugins: [preact()],
    
    server: {
        host: '0.0.0.0', // Allow access from network
        port: 3000,
        open: true
    },
    
    css: {
        devSourcemap: true
    },
    
    // Vite automatically handles VITE_ prefixed environment variables
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