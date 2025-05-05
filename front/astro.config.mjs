// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  output: 'static', // o 'server' si vas a usar adaptador Node
  build: {
    format: 'directory', // recomendado para producción
  },

});