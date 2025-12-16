// vite.config.js (Corrected for GitHub Pages Deployment)
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load environment variables (needed if you use VITE_API_BASE_URL_DEV in the proxy)
  const env = loadEnv(mode, process.cwd(), '');

  const isDevelopment = mode === 'development';

  const config = {
    plugins: [react()],

    // CRITICAL FIX: Set the base path to your repository name for GitHub Pages to find assets (CSS, JS).
    base: "/Daily-Mental-Health-Check-in", // Must end with a trailing slash
    
    server: {
      proxy: {}, 
    },
  };

  // Keep the proxy only for local development when using localhost backend
  if (isDevelopment && !env.VITE_API_BASE_URL) {
    config.server.proxy = {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    };
  }
  
  return config;
});