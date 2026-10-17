import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { processTommoChat } from './src/server/tommoApi.ts';

function tommoApiPlugin(): Plugin {
  return {
    name: 'tommo-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/tommo/chat' && req.method === 'POST') {
          let bodyStr = '';
          req.on('data', chunk => {
            bodyStr += chunk;
          });
          req.on('end', async () => {
            try {
              const payload = bodyStr ? JSON.parse(bodyStr) : {};
              const result = await processTommoChat(payload);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify(result));
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err?.message || 'Server error' }));
            }
          });
          return;
        }

        if (req.url === '/api/tommo/status' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(
            JSON.stringify({
              status: 'ONLINE',
              engine: 'TOMMO 1.0 INDEPENDENT SUPER ENGINE',
              version: '1.0.0-standalone',
              liveEngineEnabled: true,
              mode: 'PROPRIETARY_INDEPENDENT_AI',
              apiKeyStatus: 'NO_EXTERNAL_KEYS_REQUIRED',
              protocols: ['COGNITIVE_4_STAGE', 'ZERO_FLUFF', 'OWASP_SOLID', 'SECURITY_SHIELD'],
            })
          );
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), tommoApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

