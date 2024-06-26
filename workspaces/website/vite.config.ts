import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  ssr: {
    noExternal: ['react-helmet-async', 'react-use'],
  },
  server: {
    fs: {
      allow: ['..'],
    },
  },
});
