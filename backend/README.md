# HLO Tracking Backend

Express + TypeScript API bridging the Vite frontend, 17TRACK, and Supabase.

## Setup

1. Copy `.env.example` to `.env` and fill in values:

```text
PORT=3001
TRACKING_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
CORS_ORIGIN=http://localhost:5173
OPS_API_KEY=
```

2. Run SQL in the Supabase SQL editor:

- New project: `backend/sql/schema.sql`
- Existing project: `backend/sql/migration_hanz_reference.sql`
- If shipment create fails with tracking_number NOT NULL: `backend/sql/migration_tracking_number_nullable.sql`

3. Install and start:

```bash
npm install
npm run dev
```

## Endpoints

- `GET /health`
- `POST /api/track` `{ "trackingNumber": "HANZ-... or AWB" }`
- `POST /api/shipments` create Hanz shipment (`hanz_reference` + optional `awb`)
- `POST /api/webhooks/17track`

Optional: set `OPS_API_KEY` and send `x-ops-key` (or Bearer token) for `POST /api/shipments`.

Configure the 17TRACK dashboard webhook URL to point at your public `/api/webhooks/17track` endpoint.

## Hanz reference format

`HANZ-YYMMDD-####` (UTC day + daily sequence), e.g. `HANZ-260825-0001`.

## Vercel

The Express app is exported from `src/app.ts`. Local `npm run dev` / `npm start` still use `src/server.ts` (`app.listen`).

On Vercel (Services mode), root `vercel.json` defines:

- `frontend` — Vite app at repo root (`dist` output)
- `backend` — Express service rooted at `backend/` (`src/app.ts` entrypoint)

Top-level rewrites send `/api/*` and `/health` to the backend service, and everything else to the frontend (same-origin `/api`). Set production env vars in the Vercel project (never commit `.env`).
