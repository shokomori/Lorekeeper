# Security and privacy notes

**Review scope:** source-level review of the repository on 2026-10-10. This is
not a penetration test, a complete privacy assessment, or confirmation of the
Render and GitHub Pages dashboard settings. The public API health endpoint
responded during review, but that does not establish that every production
security control is configured correctly.

## Controls visible in the source

- Production startup requires `JWT_SECRET`; tokens are signed with an expiry.
- Passwords are hashed with `bcryptjs` using a cost factor of 12 on registration
  and password change.
- The campaign API is behind authentication middleware. Campaign queries scope
  access to the authenticated user, and routes for campaign records first check
  ownership of their parent campaign.
- PostgreSQL query values are passed as parameters in the repository functions
  reviewed.
- Request bodies are limited to 200 KB.
- CORS uses an origin allowlist. Local development origins are the defaults;
  production must set `CORS_ORIGINS` to the deployed frontend origin.
- Health endpoints are public and expose service/database status. Do not add
  credentials, personal data, or other sensitive details to their responses.

These observations describe the source, not the deployed environment. Recheck
the implementation when it changes.

## Risks and follow-up

- **Database TLS verification:** `server/db/pool.js` enables TLS for non-local
  database URLs but sets `rejectUnauthorized: false`. This encrypts the
  connection without verifying the server certificate, weakening protection
  against an impersonated database endpoint. Prefer a trusted CA certificate
  and normal certificate verification where the host supports it.
- **Browser token storage:** the API client stores its bearer token in
  `localStorage`. This is accessible to JavaScript running on the origin, so an
  XSS issue could expose it. Keep dependencies and rendering paths safe; assess
  an HttpOnly-cookie design if the authentication model is revised, including
  appropriate CSRF protection.
- **Request throttling:** no authentication rate limiter was found in the
  reviewed server routes. Consider adding and testing throttling for login and
  registration before relying on the service for significant public use.
- **Deployment settings:** confirm `JWT_SECRET`, `DATABASE_URL`,
  `CORS_ORIGINS`, `NODE_ENV=production`, and database backup/retention settings
  in the hosting dashboards. Never put server secrets in a `VITE_` variable or
  commit them to the repository.
- **Account lifecycle and privacy notice:** document how users can request
  account/data deletion, what data is retained, and how to contact the project
  owner. The API currently supports profile and password updates; users should
  not assume that profile editing deletes their account or stored campaign
  content.
- **Public demo material:** use fictional records and test accounts only.
  Review screenshots and the linked video for names, email addresses, tokens,
  private campaign notes, and browser/profile details before sharing.

## Data handled

The application uses account information (name, username, email, and a password
hash) and campaign records such as campaign descriptions, NPCs, locations, and
session notes. Treat campaign notes as private user content. Avoid adding
personal or sensitive details that are not necessary to run a campaign.

The exact hosting-provider retention, backup, and deletion behavior depends on
the configured services and has not been confirmed in this repository.

## Pre-release checklist

- [ ] Verify that no secrets or private user data are present in tracked files
  or screenshots.
- [ ] Check the live frontend's API URL and confirm the API allows only the
  intended frontend origin.
- [ ] Verify production environment variables and database TLS configuration
  in the hosting dashboard.
- [ ] Test login, invalid credentials, expired tokens, and attempts to access
  another user's campaign.
- [ ] Add and test rate limits for authentication endpoints, or document an
  accepted alternative control.
- [ ] Define a data deletion/contact process and publish an appropriate privacy
  notice before inviting general public use.
- [ ] Check database backups and recovery/retention expectations with the
  provider.
- [ ] Test contrast, keyboard navigation, and screen-reader labels; do not
  claim accessibility conformance without evidence.

## Summary

The source includes useful baseline controls, especially hashed passwords,
authenticated campaign routes, ownership checks, and parameterized PostgreSQL
queries. There are also concrete follow-ups: database certificate verification,
authentication throttling, account/data lifecycle guidance, and verification
of production host settings. This document is a scoped source review and must
not be presented as proof of a formal audit or complete production certification.
