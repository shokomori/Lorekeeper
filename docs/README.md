# Documentation index

This folder contains the project documentation that accompanies the Lorekeeper codebase. These files track the product direction, the interface design, the delivery process, and the project’s compliance work.

## Contents

- [01-proposal.md](01-proposal.md) — project proposal and product scope
- [02-mockup.md](02-mockup.md) — interface mockup and screen-by-screen design notes
- [03-design-system.md](03-design-system.md) — colours, typography, spacing, and component standards
- [04-weekly-reports.md](04-weekly-reports.md) — retrospective progress-report drafts that need author verification
- [05-demo-video.md](05-demo-video.md) — live app, API health, recorded demo, and review guidance
- [06-security-and-privacy.md](06-security-and-privacy.md) — scoped source review, privacy notes, and pre-release checklist

The current UI captures are collected in [02-mockup.md#screenshot-gallery](02-mockup.md#screenshot-gallery); image files are stored in [assets/](assets).

## Remaining sign-off items

The core documentation set is present, but a few items require evidence or
decisions from the project owner before the docs can be treated as fully
verified:

- Verify or correct the dates, weekly progress, blockers, and hours in
  [04-weekly-reports.md](04-weekly-reports.md) against actual notes.
- Complete the unchecked release checks in
  [06-security-and-privacy.md](06-security-and-privacy.md), especially the
  production host settings, account/data deletion process, privacy contact,
  database backup expectations, and authentication throttling decision.
- Capture the authenticated workspace at a real mobile viewport, or explicitly
  accept that the current mobile gallery covers only the public landing page.
  The status is documented in [02-mockup.md](02-mockup.md).
- Confirm that the Google Drive video is accessible to its intended audience
  and review the recording for private information, as described in
  [05-demo-video.md](05-demo-video.md).

An API reference and end-user guide are not separate files in this folder.
The root [README](../README.md) covers local setup and lists the main API
routes; add dedicated guides only if the intended handoff or assessment
requires more detailed request/response examples or step-by-step user
instructions.

## Project context

Lorekeeper is a campaign management tool for tabletop RPG game masters. It helps users track their campaigns, NPCs, locations, and session journals in a single application, with account-based access to keep each user’s campaign data private.

## Deployment context

The project is deployed with a static frontend on GitHub Pages and a backend API hosted on Render. The frontend uses a public API base URL configured at build time, while the server keeps its own secrets and database configuration in the Render environment.

- Live app: [https://shokomori.github.io/Lorekeeper/](https://shokomori.github.io/Lorekeeper/)
- API health check: [https://lorekeeper-api-cad9.onrender.com/healthz](https://lorekeeper-api-cad9.onrender.com/healthz)

## Current status

The codebase includes the core workflow: registration and login, campaign CRUD, NPC management, location tracking, and session journaling. The project documentation has been aligned to the app as it currently exists in this repository.

## Reference files

- Main project overview: [../README.md](../README.md)
- Project assets and mockup materials: [../project/README.md](../project/README.md)
