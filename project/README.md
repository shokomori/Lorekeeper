# Lorekeeper

**Repository:** https://github.com/shokomori/Lorekeeper

**Live site:** https://shokomori.github.io/Lorekeeper/

**API:** Render-hosted backend used by the deployed GitHub Pages frontend

**Project type:** DM campaign management app

Lorekeeper is a responsive web campaign companion for tabletop RPG Dungeon Masters. It currently helps authenticated users manage campaigns, NPCs, locations, and session notes.

## Core goal

Create a full-stack app that demonstrates:

- React/Vite web frontend
- Express REST API
- PostgreSQL database
- Email/password authentication

## Current stack

- Frontend: React + Vite hosted on GitHub Pages
- API: Node.js / Express hosted on Render
- Database: PostgreSQL backed storage for real data
- Auth: Email/password + JWT-based secure session handling

## Main features

- Campaign CRUD
- NPC management
- Location management
- Session journaling
- User-owned, secure campaign data access

## Future features

- Session-to-NPC and session-to-location relationship management
- RPG compendium search
- AI session summary assistant with a review step

## Status

The core campaign management workflow is implemented. The app supports authentication, campaign creation, NPC and location management, and session journaling through a working full-stack workflow deployed across GitHub Pages and Render.

## Notes

This project is intended as a polished, practical campaign archive for game masters who want a single place to organise campaign continuity and session records.
