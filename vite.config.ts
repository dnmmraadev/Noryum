import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// React Refresh injects an inline preamble; use normal module reload in dev
// to preserve the same restrictive script policy as the packaged application.
export default defineConfig(({command})=>({ base: './', plugins: command==='build'?[react()]:[], server: { host: '127.0.0.1' } }));
