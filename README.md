# Lorekeeper

Lorekeeper is a campaign archive for tabletop role-playing games. Game masters
can keep campaign details, characters, places, and session notes together in one
workspace.

## Features

- Create an account, sign in, and manage a profile
- Create and edit campaigns
- Record non-player characters and locations for each campaign
- Write and browse campaign session notes in the journal
- Protect campaign records with authenticated, owner-scoped API routes

## Tech stack

- React 18 and Vite for the client
- Express for the HTTP API
- PostgreSQL for persistent storage
- JWT authentication and bcrypt password hashing

In development, the server falls back to an in-memory repository when
PostgreSQL is unavailable. Data in this fallback is temporary and is lost when
the server restarts. Production requires PostgreSQL.

## Run locally

Requires Node.js 20 or newer. Start the API and client in separate terminals.

Start the API:

```sh
cd server
npm install
npm start
```

The API listens on `http://localhost:3000`. Its health endpoint is
`http://localhost:3000/healthz`. To use PostgreSQL, copy `server/.env.example` to
`server/.env`, set `DATABASE_URL`, and run `npm run db:reset` from `server/` to
create the schema and load the sample data.

Start the client in another terminal:

```sh
cd client
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`. The Vite
development server proxies `/api` requests to the API on port 3000.

## Configuration

The server reads its environment from `server/.env`. `DATABASE_URL` configures
PostgreSQL; `CORS_ORIGINS` optionally sets the allowed browser origins. Set
`NODE_ENV=production` and provide a strong `JWT_SECRET` when running in
production. The server's default JWT secret is for local development only.

For a deployed client, set `VITE_API_BASE_URL` to the public API URL when building
the client, and configure `CORS_ORIGINS` on the API to allow the deployed site.
Values prefixed with `VITE_` are included in the public client bundle and must
never contain secrets.

## Project layout

```text
client/       React application and Vite configuration
server/       Express API, repositories, and database schema
docs/         Project proposal, design notes, and weekly reports
project/      Mockup and local visual assets
```

## License

See [LICENSE](LICENSE).
