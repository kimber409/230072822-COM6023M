# RecruitFlow Web Client Application

Browser-based React client for the RecruitFlow REST API.

## Live Client

```text
Web client: https://advanced-web-dev.oliver-f6e.workers.dev
REST API:   https://two30072822-com6023m.onrender.com
```

The production client is hosted on Cloudflare Workers static assets.

## Features

- JWT login flow.
- Dashboard consuming aggregate API data.
- Candidate creation, listing, filtering, status updates and deletion.
- Job creation, listing, status updates and deletion.
- Application creation, listing, stage updates, filtering and deletion.
- Responsive layout and accessible form labels/buttons.

## Run Locally

```bash
npm install
cp .env.example .env
npm run dev
```

Set `VITE_API_BASE_URL` to the REST API URL.

## Production

Cloudflare Workers settings:

```text
Root directory: Source Code/WebClientApplication
Build command: npm ci && npm run build
Deploy command: npx wrangler deploy
```

Build variable:

```text
VITE_API_BASE_URL=https://two30072822-com6023m.onrender.com
```
