import { defineConfig } from 'astro/config';

// The deployment workflow supplies the actual origin and repository base path.
// No repository name or account needs to be hard-coded into this project.
export default defineConfig({
  output: 'static',
  devToolbar: { enabled: false },
  site: process.env.SITE_URL || 'http://localhost:4321',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
