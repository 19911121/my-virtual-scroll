import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export const ssrTransformCustomDir = () => {
  return {
    props: [],
    needRuntime: true
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue()
  ],
  
  resolve: {
    alias: [{ find: '@', replacement: '/src' }],
  },
});