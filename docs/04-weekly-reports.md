# Weekly reports

These notes record the project’s progress, practical blockers, and development decisions as the app was built.

> **Author verification needed:** The weekly entries below are retrospective drafts, not verified time records. Confirm each week's dates, work completed, blockers, and hours against your own notes before submitting them as historical reports. Remove or correct anything you cannot verify; do not present estimated hours as measured time.

---

## Week of 2026-09-06

**Done.** Initial project direction was defined around a fantasy campaign management dashboard. The app scope was narrowed to campaign records, NPCs, locations, and session journaling. The repository structure was clarified and the project was set up for a React frontend and Express backend.

**Stuck.** The main challenge at this stage was deciding how much scope to keep in the first release without losing the core value of the app. The project needed to stay focused on reliable DM tooling rather than broad worldbuilding extras.

**Hours.** Approximately 4–6 hours.

**Next.** Finalise the app feature set and begin implementing the authentication and campaign flow.

---

## Week of 2026-09-13

**Done.** The frontend shell and campaign-based layout were established, and the design direction moved toward a styled fantasy dashboard with a dark theme and strong accent colours. The backend started taking shape with Express route planning and the first version of the data model.

**Stuck.** The project had to balance visual polish with practical implementation time. Some decorative UI ideas were intentionally simplified to keep the app functional and manageable.

**Hours.** Approximately 5–7 hours.

**Next.** Implement registration/login and the first campaign CRUD flow.

---

## Week of 2026-09-20

**Done.** Authentication was implemented with JWT and password hashing. The campaign system was added so users could create, store, and switch between multiple campaigns. Core server validation and response handling were also refined.

**Stuck.** A few edge cases emerged around ownership checks and API validation, especially ensuring that a user could not access another user’s campaign via route parameters.

**Hours.** Approximately 6–8 hours.

**Next.** Add NPC, location, and session records to complete the main campaign workflow.

---

## Week of 2026-09-27

**Done.** The app gained campaign-specific NPC and location management, including create, update, and delete flows. Session entries were added so users could track recaps and campaign history by date.

**Stuck.** The biggest issue was keeping the data model consistent between the local in-memory repository and the PostgreSQL-backed repository. This required careful alignment of function names and return formats so the API behaviour stayed stable.

**Hours.** Approximately 7–9 hours.

**Next.** Validate the full stack locally, confirm PostgreSQL setup, and document the project clearly for handoff and final review.

---

## Week of 2026-10-04

**Draft status (verify dates).** The project reached a working end-to-end state: users can register, create campaigns, manage NPCs and locations, and log sessions. PostgreSQL support and the project documentation were reviewed.

**Stuck.** Production configuration still needs to be checked in the hosting dashboards, including the API's allowed frontend origin, secret settings, and database backup/retention arrangements. The public frontend and API health endpoint were verified on 2026-10-10; that check does not verify every production setting or the full authenticated workflow.

**Hours.** Replace with the actual time recorded, or omit if not known.

**Next.** Verify this report against contemporaneous notes and complete any outstanding deployment, security, and privacy checks.
