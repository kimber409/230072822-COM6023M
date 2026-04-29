# RecruitFlow REST API

Standalone REST API for candidate, job and application management.

## Live API

```text
Base URL: https://two30072822-com6023m.onrender.com
Health:   https://two30072822-com6023m.onrender.com/health
```

The production API is hosted on Render and connects to a hosted Supabase PostgreSQL database.

## Architecture

- Express application factory in `src/app.js`
- Route modules in `src/routes`
- Validation schemas using Zod
- Business logic in `src/services`
- PostgreSQL access through `src/db/pool.js`
- Centralized JSON error handling in `src/middleware/errorHandler.js`
- JWT authentication and password hashing

## Run Locally

```bash
npm install
cp .env.example .env
createdb recruitflow
psql "$DATABASE_URL" -f ../RestAPI-SQL.sql
npm run dev
```

The API runs on `http://localhost:4000` by default.

## Production

Render settings:

```text
Root directory: Source Code/RestAPI
Build command: npm ci
Start command: npm start
```

Required environment variables:

```text
DATABASE_URL
JWT_SECRET
CORS_ORIGIN=https://advanced-web-dev.oliver-f6e.workers.dev
NODE_ENV=production
```

## Security

- Passwords are hashed with bcrypt.
- Protected routes require JWT bearer tokens.
- Helmet configures common HTTP security headers.
- CORS is restricted by `CORS_ORIGIN`.
- Rate limiting is enabled.
- All request bodies/query strings are validated before service logic runs.
