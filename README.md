# COM6023M RecruitFlow

RecruitFlow is a COM6023M Advanced Web Development portfolio project containing two connected applications:

- `Source Code/RestAPI`: standalone RESTful API with PostgreSQL integration.
- `Source Code/WebClientApplication`: TypeScript React web client that consumes the API.

It supports candidates, jobs, applications, interviews, dashboard analytics, JWT authentication, protected routes, validation, error handling, search/filter/sort UI and deployment-ready configuration.

## Live Deployment

```text
Web client: https://advanced-web-dev.oliver-f6e.workers.dev
REST API:   https://two30072822-com6023m.onrender.com
Health:     https://two30072822-com6023m.onrender.com/health
```

The web client is hosted on Cloudflare Workers static assets. The API is hosted on Render and connects to a hosted Supabase PostgreSQL database using production environment variables.

## Required Deliverables

```text
230072822-COM6023M/
├── README.md
├── RecruitFlow-Documentation.docx
└── Source Code/
    ├── RestAPI-SQL.sql
    ├── package.json
    ├── RestAPI/
    └── WebClientApplication/
```

## Folder Structure

```text
230072822-COM6023M/
├── README.md
├── RecruitFlow-Documentation.docx
└── Source Code/
    ├── RestAPI-SQL.sql
    ├── package.json
    ├── RestAPI/
    │   ├── package.json
    │   ├── README.md
    │   ├── tests/
    │   └── src/
    │       ├── app.js
    │       ├── server.js
    │       ├── config/
    │       ├── db/
    │       ├── middleware/
    │       ├── routes/
    │       ├── services/
    │       └── utils/
    └── WebClientApplication/
        ├── package.json
        ├── README.md
        ├── wrangler.toml
        ├── index.html
        └── src/
            ├── api/
            ├── components/
            ├── context/
            ├── hooks/
            ├── pages/
            ├── routes/
            ├── schemas/
            ├── styles/
            ├── types/
            └── utils/
```

## Backend

```bash
cd "Source Code/RestAPI"
npm install
npm run dev
```

The API runs on `http://localhost:4000` by default.

Configure `Source Code/RestAPI/.env`, create a PostgreSQL database, and load the schema:

```bash
psql "$DATABASE_URL" -f ../RestAPI-SQL.sql
```

## Frontend

```bash
cd "Source Code/WebClientApplication"
npm install
npm run dev
```

The client runs on `http://localhost:5173` by default. Set `VITE_API_BASE_URL` to the REST API URL when using a deployed API.

## Production Commands

Backend on Render:

```bash
cd "Source Code/RestAPI"
npm ci
npm start
```

Frontend on Cloudflare Workers:

```bash
cd "Source Code/WebClientApplication"
npm ci
npm run typecheck
npm run build
npx wrangler deploy
```

Production environment:

```text
API: DATABASE_URL, JWT_SECRET, CORS_ORIGIN, NODE_ENV=production
Client build: VITE_API_BASE_URL=https://two30072822-com6023m.onrender.com
```

## Test Credentials

```text
Email: admin@recruitflow.dev
Password: RecruitFlow2026!
```

## Verification

Current verification commands:

```bash
npm test --prefix "Source Code/RestAPI"
npm run typecheck --prefix "Source Code/WebClientApplication"
npm run build --prefix "Source Code/WebClientApplication"
```

## AI Use Statement

I used ChatGPT to help brainstorm the project structure and API design.
