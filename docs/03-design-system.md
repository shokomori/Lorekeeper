# Design system

Lorekeeper uses a custom CSS design system built directly in [../client/src/styles.css](../client/src/styles.css). The theme is intentionally fantasy-inspired but highly legible, with a strong dark base and warm gold accents that create a campaign-planning atmosphere without sacrificing usability.

## Design principles

- keep the interface atmospheric without reducing clarity
- make primary actions obvious and high-contrast
- maintain consistency between campaign overview and form screens
- support both desktop and mobile layouts with one visual language
- preserve accessible focus states and readable contrast

## Colour palette

The following colours are the core palette used by the app.

### Dark theme

- Ink: `#08070a`
- Surface: `#16121c`
- Surface 2: `#1f1826`
- Line: `rgba(232,217,74,.16)`
- Line strong: `rgba(232,217,74,.34)`
- Gold: `#e8d94a`
- Gold bright: `#f5ee8c`
- Violet: `#8a5fd6`
- Violet soft: `rgba(138,95,214,.17)`
- Magenta: `#d5479f`
- Parchment: `#ece5d4`
- Muted: `#948a9c`
- Danger: `#b3563f`

### Light theme

- Ink: `#e9e8e4`
- Surface: `rgba(250,249,246,.72)`
- Surface 2: `rgba(244,241,236,.58)`
- Line: `rgba(76,67,71,.15)`
- Line strong: `rgba(105,82,67,.26)`
- Gold: `#92702d`
- Gold bright: `#795b21`
- Violet: `#705b99`
- Violet soft: `rgba(112,91,153,.12)`
- Magenta: `#9f708c`
- Parchment: `#29272d`
- Muted: `#625e68`
- Danger: `#a1484b`

## Typography

The interface uses a clean sans-serif stack with a stronger display face for headings and labels.

- Body text: `Inter`, `Segoe UI`, sans-serif
- Headings: `Segoe UI`, `Inter`, sans-serif
- UI labels and campaign metadata: `Segoe UI`, `Inter`, sans-serif

### Type scale

- Eyebrow label: `12px`, uppercase tracking, gold colour
- Body text: `15px`, default reading size
- Section headings: `24–36px`, weight 600-700
- Card titles: `18–22px`, strong weight
- Small metadata: `10–12px`, muted text, uppercase tracking when needed

## Spacing system

The project uses a consistent modular spacing scale based on small increments and tight, readable rhythm.

- 4px: micro spacing
- 8px: compact gaps inside chips and labels
- 12px: form control spacing
- 16px: standard component padding
- 20px: card internal spacing
- 24px: modal and panel padding
- 32px: section separation

This keeps the UI compact while still giving the layout enough breathing room.

## Components

### Buttons

Buttons use a strong border, rounded corners, and a clear hierarchy:

- Default: dark surface with muted border
- Primary: violet gradient with strong contrast text
- Gold: border emphasis for secondary or less critical actions
- Danger: reserved for destructive actions

States:

- default: subtle surface and border
- hover: border and background shift toward accent colours
- active: slightly brighter or more saturated appearance
- focus: visible outline matching the violet focus treatment
- disabled: reduced opacity and no hover emphasis

### Form fields

Fields are implemented as stacked inputs with:

- dark or soft background depending on theme
- thin border with accent on focus
- readable spacing and consistent height
- inline labels or text controls to match the app’s UI language

Focus state:

- `outline: 2px solid var(--violet)`
- offset around the element to ensure keyboard accessibility

### Cards and panels

Panels use subtle borders and layered surfaces to create structure without overwhelming the page.

- background: `var(--surface)` or `var(--surface-2)`
- border: `var(--line)` or `var(--line-strong)`
- radius: `var(--radius)`, set to 10px in the main theme
- shadow: minimal but present for popovers and modal depth

### Modal dialogs

Modals are clear overlays with a strong headline, action buttons, and stacked form fields. They are central to creating and editing NPCs, locations, and sessions.

## State design

The UI has dedicated treatment for the key states users encounter:

- Loading: button labels change to “Saving…” and actions are disabled
- Empty: large empty-state messages with clear guidance on what to do next
- Error: form validation messages and API feedback remain visible and specific
- Data: rows and cards present content in a way that is scannable and grouped by campaign

## Implementation notes

The design system is currently implemented in CSS custom properties. This is the right fit for the current codebase because it keeps the visual rules centralised and easy to adjust without introducing a React component library or build pipeline complexity.

The main tokens are defined in [../client/src/styles.css](../client/src/styles.css), and the interface consistently uses those tokens instead of hard-coded values in individual components.

## Accessibility considerations

These are design goals, not the result of a formal accessibility audit:

- maintain readable foreground/background contrast
- keep focus indicators visible for keyboard use
- give interactive elements clearly defined states
- do not communicate form labels or actions through colour alone

Contrast ratios, screen-reader behavior, and full keyboard navigation have not
been systematically tested. Verify them before claiming WCAG conformance.

## Summary

The Lorekeeper design language is intentionally atmospheric, compact, and readable. It blends a dark fantasy look with a practical GM dashboard structure so that the app feels themed without sacrificing function.
