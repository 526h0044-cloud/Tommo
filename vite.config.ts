import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { processTommoChat } from './src/server/tommoApi.ts';
import { validateTommoApiKey } from './src/utils/tommoApiKey.ts';

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
              const apiKey = req.headers['x-tommo-api-key'] || payload.apiKey;

              if (apiKey && !validateTommoApiKey(apiKey as string)) {
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 401;
                res.end(
                  JSON.stringify({
                    success: false,
                    error: 'Tommo API Key không hợp lệ! Định dạng yêu cầu: tmm-xxxxxxxxxxxxxxxxxxxx (20 ký tự chữ hoa, chữ thường, số).',
                  })
                );
                return;
              }

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
              engine: 'TOMMO 1.0',
              version: '1.0.0-super',
              liveEngineEnabled: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
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
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

