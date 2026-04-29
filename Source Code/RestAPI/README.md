# RecruitFlow REST API

Standalone REST API for candidate, job and application management.

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

## Security

- Passwords are hashed with bcrypt.
- Protected routes require JWT bearer tokens.
- Helmet configures common HTTP security headers.
- CORS is restricted by `CORS_ORIGIN`.
- Rate limiting is enabled.
- All request bodies/query strings are validated before service logic runs.
