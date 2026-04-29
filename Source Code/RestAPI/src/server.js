import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

// This file only starts the HTTP server; app setup lives in app.js for testing.
app.listen(env.port, () => {
  console.log(`RecruitFlow REST API listening on port ${env.port}`);
});
