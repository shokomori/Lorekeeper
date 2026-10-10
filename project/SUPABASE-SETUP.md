# Optional Supabase setup for Lorekeeper

The deployed API is hosted on Render and currently uses PostgreSQL. This guide
describes how to connect a separate Supabase Postgres project if you choose to
use Supabase instead. The `YOUR_PROJECT_REF` values below are examples to
replace with the reference for your own Supabase project.

## 1) Create the Supabase project

1. Go to https://supabase.com
2. Create a new project
3. Note the project URL and database password
4. In the project dashboard, open SQL Editor

## 2) Run the schema

Copy the contents of [server/db/lorekeeper-schema.sql](../server/db/lorekeeper-schema.sql) into the Supabase SQL editor and run it.

This creates:
- users
- campaigns
- npcs
- locations
- sessions
- session_npcs
- session_locations

## 3) Set the environment variable

In [server/.env](../server/.env), replace the placeholder values with your real Supabase connection string:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
CORS_ORIGINS=http://localhost:5173
NODE_ENV=development
```

If using the classic connection string format from Supabase, it will look like:

```env
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
```

## 4) Start the app

From the repo root:

```bash
cd server
npm install
node server.js
```

Then in another terminal:

```bash
cd client
npm install
npm run dev -- --host 0.0.0.0
```

## 5) Optional: Supabase auth on the client

If you want browser auth later, add these values in the client environment:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

## 6) Notes

- Supabase gives you a hosted Postgres instance and a SQL editor.
- The app is ready for PostgreSQL as soon as the real connection string is provided.
- The current fallback in-memory repository remains only as a local development fallback while the remote database is not connected.
