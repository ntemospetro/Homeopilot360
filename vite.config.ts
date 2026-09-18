import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function countryDetectionFallbackPlugin(): Plugin {
  return {
    name: 'country-detection-fallback',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';
        if (url === '/api/detect-country' || url === '/api/detect-country/') {
          const acceptLang = (req.headers['accept-language'] as string) || '';
          let countryCode = 'DE';
          let language = 'de';
          if (acceptLang.includes('el') || acceptLang.includes('gr')) {
            countryCode = 'GR';
            language = 'el';
          } else if (acceptLang.includes('fr')) {
            countryCode = 'FR';
            language = 'fr';
          } else if (acceptLang.includes('es')) {
            countryCode = 'ES';
            language = 'es';
          } else if (acceptLang.includes('it')) {
            countryCode = 'IT';
            language = 'it';
          } else if (acceptLang.includes('ru')) {
            countryCode = 'RU';
            language = 'ru';
          } else if (acceptLang.includes('en')) {
            countryCode = 'GB';
            language = 'en';
          }
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ countryCode, language }));
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), countryDetectionFallbackPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
