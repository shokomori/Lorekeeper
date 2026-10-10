# Lorekeeper

Live site: [https://shokomori.github.io/Lorekeeper/](https://shokomori.github.io/Lorekeeper/)

API health: [https://lorekeeper-api-cad9.onrender.com/healthz](https://lorekeeper-api-cad9.onrender.com/healthz)

Lorekeeper is a full-stack campaign management app for tabletop RPG game masters. It brings together campaign planning, NPC tracking, location notes, and session journals in one organised workspace so the GM can keep continuity across a long-running story.

## Screenshots

![Lorekeeper live landing page](docs/assets/lorekeeper-landing-cover.png)

See [the screenshot gallery](docs/02-mockup.md#screenshot-gallery) for the public sign-in and registration screens, campaign dashboard, and sample NPC, location, and session views. The authenticated examples use fictional local development data.

## Why this project exists

Running a campaign creates a lot of moving parts:

- campaign summaries and plot threads
- NPC personalities, motives, and backstory
- locations, landmarks, and key settings
- session recaps and continuity notes
- long-term worldbuilding that must stay consistent over time

Lorekeeper gives the GM a single place to manage those details without scattering them across notebooks, spreadsheets, and disconnected notes.

## Core features

### Authentication and user accounts

- registration and login
- JWT-based API security
- profile management
- password updates
- per-user ownership checks for campaign data

### Campaign management

- create, edit, and delete campaigns
- switch between multiple campaigns in one account
- keep campaign notes and world data separated by campaign

### NPC and location tracking

- create and manage NPCs per campaign
- track roles, descriptions, notes, and optional media references
- add and update campaign locations
- keep world information organised and easy to revisit

### Session journaling

- write session entries with a title and date
- store recap text for each session
- browse campaign history by date
- maintain a reliable record of what happened across sessions

### Security and reliability

- protected API routes for authenticated users
- database-backed storage for production use
- local fallback repository for development when PostgreSQL is unavailable
- input validation and password hashing in the backend

## Tech stack

- Frontend: React 18 + Vite
- API: Node.js + Express
- Database: PostgreSQL
- Auth: JWT + bcrypt
- Development support: in-memory fallback repository when PostgreSQL is not available

## Application architecture

```text
Frontend: GitHub Pages (static React/Vite build)
API: Render-hosted Express backend
Database: PostgreSQL (hosted service or local development database)
Repository: GitHub source for the project and documentation
```

```text
client/     React client for the campaign dashboard and forms
server/     Express API, repositories, validation, and database access
project/    Mockups, supporting artwork, and project assets
docs/       Planning, design, documentation, and review files
```

## Deployment status

This project is deployed as:

- Frontend: GitHub Pages
- Backend API: Render
- Production app flow: the static client calls the hosted render API through `VITE_API_BASE_URL`

The GitHub Pages workflow builds the client and injects the runtime API base URL from the repository Actions variables, so the deployed frontend is connected to the Render backend without committing secrets.

## Local setup

### Requirements

- Node.js 20 or newer
- npm
- PostgreSQL for the production-style database flow

### 1. Install the API dependencies

```bash
cd server
npm install
cp .env.example .env
```

Then populate `server/.env` with your database settings before starting the app.

### 2. Set up the database schema

```bash
npm run db:reset
```

This creates the schema and loads the initial seed data.

### 3. Start the server

```bash
npm run dev
```

The server runs at:

```text
http://localhost:3000
```

Useful endpoints:

- `GET /healthz` — app health check
- `GET /readyz` — PostgreSQL readiness check
- `POST /api/auth/register` — create a new user
- `POST /api/auth/login` — sign in and receive a JWT
- `GET /api/campaigns` — list the authenticated user's campaigns

### 4. Run the client

Open a second terminal:

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

The client usually runs at:

```text
http://localhost:5173
```

If the app is meant to use the real API instead of the mock backend, set:

```env
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:3000
```

## Environment variables

### Server

`server/.env` should include values such as:

```env
DATABASE_URL=postgres://user:password@host:5432/lorekeeper
CORS_ORIGINS=http://localhost:5173
JWT_SECRET=your-development-secret
NODE_ENV=development
```

Notes:

- `DATABASE_URL` is required for PostgreSQL-backed storage.
- `CORS_ORIGINS` defines the allowed frontend origins.
- `JWT_SECRET` should be a strong secret in production.
- If PostgreSQL is unavailable, the server falls back to a local in-memory repo for development only.

### Client

`client/.env` may include:

```env
VITE_USE_MOCK_API=true
VITE_API_BASE_URL=http://localhost:3000
```

Values beginning with `VITE_` are compiled into the frontend bundle and must never contain secrets.

## API overview

The backend exposes the main application routes under `/api`.

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/change-password`
- `GET /api/auth/me`
- `POST /api/auth/google` (in configured setups)

### Campaign endpoints

- `GET /api/campaigns`
- `POST /api/campaigns`
- `GET /api/campaigns/:id`
- `PUT /api/campaigns/:id`
- `DELETE /api/campaigns/:id`

### Campaign entity endpoints

- `GET /api/campaigns/:campaignId/npcs`
- `POST /api/campaigns/:campaignId/npcs`
- `PUT /api/campaigns/:campaignId/npcs/:npcId`
- `DELETE /api/campaigns/:campaignId/npcs/:npcId`
- `GET /api/campaigns/:campaignId/locations`
- `POST /api/campaigns/:campaignId/locations`
- `PUT /api/campaigns/:campaignId/locations/:locationId`
- `DELETE /api/campaigns/:campaignId/locations/:locationId`
- `GET /api/campaigns/:campaignId/sessions`
- `POST /api/campaigns/:campaignId/sessions`
- `PUT /api/campaigns/:campaignId/sessions/:sessionId`
- `DELETE /api/campaigns/:campaignId/sessions/:sessionId`

## Data model

The main persistence layer stores campaign content by user and campaign, which ensures each account only sees its own records.

Core tables include:

- `users`
- `campaigns`
- `npcs`
- `locations`
- `sessions`
- `session_npcs`
- `session_locations`

## Current project status

The repository contains the core working workflow:

- user registration and login
- campaign creation and management
- NPC and location CRUD
- session journaling
- PostgreSQL support with a safe local fallback
- public-facing documentation and project planning files

## Documentation set

This repository includes supporting project documentation in the following locations:

- [docs/](docs) — planning, design, and project review materials
- [project/](project) — mockup assets, supporting files, and visual references
- [LICENSE](LICENSE) — project licensing information

## Roadmap and future improvements

Planned enhancements for later iterations include:

- session-to-NPC and session-to-location relationship tracking
- better campaign search and filtering
- AI-generated session summaries with human review
- richer media support for portraits and maps
- polished deployment workflow for a hosted frontend and API

## License

See [LICENSE](LICENSE).
