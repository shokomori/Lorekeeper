# Proposal

## Project summary

Lorekeeper is a full-stack campaign management app for tabletop RPG game masters. The core idea is to make campaign planning and continuity easier by giving the DM a single place to organise campaign content, track world details, and record session history.

This app is built around the needs of a GM who runs a long-running campaign and has to keep track of:

- campaign summaries and world details
- NPCs, their goals, and their relationships
- major locations and landmarks
- session notes and campaign recaps
- private, user-owned access to campaign material

## Problem

Tabletop RPG preparation typically sprawl across notebooks, spreadsheets, digital notes, and separate documents. That makes it difficult to maintain continuity between sessions, especially when a campaign lasts many months or has several major NPCs and locations.

Lorekeeper addresses this by centralising a GM’s campaign information in a structured application that is easy to update and browse during play.

## Target users

The primary users are:

- Dungeon Masters who run campaigns over several sessions
- Players who want a central place to track campaign lore and session summaries
- Casual hobbyists who want a lightweight campaign archive rather than a large all-in-one GM tool

## Core features

### Authentication and accounts

- User registration and login
- JWT-based session handling for secure API access
- Profile editing and password management
- User-scoped campaign ownership

### Campaign management

- Create campaigns with a name and description
- Switch between multiple campaigns per user
- Edit or delete campaigns when needed

### World-building records

- Manage NPCs per campaign
- Manage locations per campaign
- Store description, notes, role, and optional media references

### Session journaling

- Record session entries with date and title
- Add recap text for each session
- Browse session history in chronological order
- Keep campaign continuity across sessions

## Product vision

Lorekeeper is not trying to replace a full GM suite or a sprawling worldbuilding platform. Instead, it focuses on the most important workflow for an active campaign: storing world information and session notes in a way that is easy to maintain and revisit.

The product is intentionally scoped to a lightweight but complete DM dashboard.

## Technical approach

The app uses:

- React and Vite for the frontend
- Express for the backend API
- PostgreSQL for persistent storage
- bcrypt and JWT for secure authentication
- a local fallback repository in development when PostgreSQL is unavailable

This structure keeps the app modern and easy to extend while supporting a real data model for production use.

## Deployment plan

The production architecture is:

- frontend: GitHub Pages hosting the React/Vite client
- backend: Render-hosted Express API
- database: PostgreSQL instance managed by the deployment environment or a host provider
- environment variables kept in each host’s dashboard rather than committed to the repository

The deployed frontend is configured to call the Render API through its public base URL, while the backend keeps its own database connection and secret configuration in the server environment rather than in the browser bundle.

Live frontend: https://shokomori.github.io/Lorekeeper/

The project currently includes a working local development setup and a backend that can run against PostgreSQL or the in-memory fallback.

## Risks and mitigation

### Risk: incomplete campaign continuity tooling

The app currently focuses on the core management cycle rather than advanced features like AI-assisted summaries or campaign search. This risk is mitigated by keeping the core workflow reliable and complete before expanding into more advanced capabilities.

### Risk: authentication and data ownership complexity

Because each campaign belongs to a user, any API route that accesses campaign data must enforce ownership checks. This is handled by checking the authenticated user against the campaign record before returning or modifying data.

### Risk: database dependence in production

The app is designed to support PostgreSQL, but it also includes a local fallback for development when the database is not connected. This reduces local friction while keeping production requirements explicit.

## Current implementation status

The repository currently contains the completed core workflow:

- account creation and login
- JWT-authenticated routes
- campaign CRUD
- NPC and location management
- session journaling
- PostgreSQL support with schema setup and seed commands

## Stretch goals

The following ideas are valid future improvements but are not required for the core app:

- cross-session NPC and location relationship tracking
- richer campaign search and filtering
- AI-generated session summaries with human review
- import/export of campaign data
- richer media support for portraits and map thumbnails

## Conclusion

Lorekeeper is a focused, practical app for tabletop RPG campaign management. It solves a real organisational problem by helping GMs keep a clean archive of their campaign world and its history while providing the security and structure needed for long-term use.
