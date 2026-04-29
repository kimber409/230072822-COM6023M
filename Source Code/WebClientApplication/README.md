# RecruitFlow Web Client Application

Browser-based React client for the RecruitFlow REST API.

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
