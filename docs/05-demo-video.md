# Demo video plan

This file captures the structure and requirements for the project walkthrough video. The goal is to show the product in action, explain the value it provides, and briefly highlight a technical decision that demonstrates ownership of the work.

## Demo link

Demo URL: https://shokomori.github.io/Lorekeeper/

API health check: https://lorekeeper-api-cad9.onrender.com/healthz

Recorded demo video: [Watch the Lorekeeper demo](https://drive.google.com/file/d/1OT0XDwGSCEMLMQwboSVOhQAtva0kMmIA/view?usp=sharing)

The recording link was supplied by the project owner. Confirm that viewers with the intended audience can open it in Google Drive; the file's sharing permissions and video contents have not been independently reviewed.

## Recommended recording length

For a future replacement or updated recording, aim for 3 to 5 minutes total. Keep it concise, polished, and focused on the main user flow.

## Video structure

### 1. App introduction and value statement (30–45 seconds)

Open on the app itself rather than a slide. Show the project name and a quick use-case explanation: a dungeon master organising a campaign with NPCs, locations, and session notes.

Suggested framing:

- “Lorekeeper helps game masters organise campaign continuity.”
- “Instead of scattering notes across documents and spreadsheets, everything lives in one structured workspace.”

### 2. End-to-end walkthrough of the core flow (2–3 minutes)

Show a realistic, pre-seeded campaign with:

- an existing campaign profile
- a few NPCs
- a few locations
- one or more session entries

Walk through:

- account registration or sign-in
- creating or selecting a campaign
- creating an NPC
- creating a location
- creating a session recap
- reviewing the dashboard and campaign data

The point is to demonstrate the complete campaign management workflow rather than a blank-slate example.

### 3. Technical highlight (30–45 seconds)

Open one file or code area and explain a meaningful implementation decision. This could include:

- the Express API’s authentication and ownership checks
- use of PostgreSQL with a local fallback repository
- the custom CSS design system used for the app theme
- how the frontend routes and campaign views are structured

This is where the viewer should see that the project is more than a template and that the decisions were made intentionally.

### 4. Honest reflection (30 seconds)

End by saying one thing the project would improve with more time. This strengthens the presentation and shows judgement rather than overclaiming.

Example:

- “If I had more time, I would add richer search and campaign relationship tracking between NPCs, locations, and session events.”

## Recording review checklist

Use this checklist when reviewing the linked recording or preparing an updated version:

- [ ] Confirm the deployed site is live and working
- [ ] Check that the recording link is accessible to its intended audience
- [ ] Ensure no personal information or private campaign content is visible
- [ ] Use realistic, fictional sample data rather than a blank workspace
- [ ] Cover sign-in, the campaign workflow, and a concise technical highlight
- [ ] Keep narration clear and pace steady

## Backup plan

If the live deployment is unavailable, use one of these fallback options in order of preference:

1. a working demo-mode build of the client
2. a recording of the local app running without issues
3. screenshots of the key workflow with a short explanation

A video with a small clear failure is better than a polished recording that hides the fact the app is not functioning.

## Presentation quality guidance

- keep narration crisp and practical
- focus on user value and workflow clarity
- show the actual app rather than a slide deck walkthrough
- avoid long pauses and avoid reading out form labels one-by-one
- make sure the final sequence ends with a clear statement of what Lorekeeper does
