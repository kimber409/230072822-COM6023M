# COM6023M RecruitFlow

RecruitFlow is a COM6023M Advanced Web Development portfolio project containing two connected applications:

- `/RestAPI`: standalone RESTful API with PostgreSQL integration.
- `/WebClientApplication`: TypeScript React web client that consumes the API.

It supports candidates, jobs, applications, interviews, dashboard analytics, JWT authentication, protected routes, validation, error handling, search/filter/sort UI and deployment-ready configuration.

## Required Deliverables

```text
COM6023M-RecruitFlow/
├── RestAPI/
├── WebClientApplication/
├── RestAPI-SQL.sql
├── Documentation.md
├── VideoDemoScript.md
└── README.md
```

## Backend

```bash
cd RestAPI
npm install
npm run dev
```

The API runs on `http://localhost:4000` by default.

Configure `RestAPI/.env`, create a PostgreSQL database, and load the schema:

```bash
psql "$DATABASE_URL" -f ../RestAPI-SQL.sql
```

## Frontend

```bash
cd WebClientApplication
npm install
npm run dev
```

The client runs on `http://localhost:5173` by default.

## Production Commands

Backend:

```bash
cd RestAPI
npm start
```

Frontend:

```bash
cd WebClientApplication
npm run typecheck
npm run build
npm run preview
```

## Test Credentials

```text
Email: admin@recruitflow.dev
Password: RecruitFlow2026!
```

## Verification

Current verification commands:

```bash
npm test --prefix RestAPI
npm run typecheck --prefix WebClientApplication
npm run build --prefix WebClientApplication
```

## AI Use Statement

I used ChatGPT to help brainstorm the project structure, API design, and documentation template. I used Codex to assist with generating and debugging code. I reviewed, tested, and adapted the generated output myself.
