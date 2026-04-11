# Premium Ribbon UI Upgrade — Phase 1 + Phase 2

Repository: `aungsan-portfolio/gotravelasia`
Target route: `/flights/results`
Active page: `client/src/pages/flights/WhiteLabelResultsBridge.tsx`
Primary toolbar file: `client/src/components/flights/search/CompactFlightToolbar.tsx`

## Objective

Upgrade the `/flights/results` experience to a premium, sticky ribbon design inspired by the *layout logic* of Cheapflights, while preserving GoTravel Asia brand identity.

Do **not** copy Cheapflights visually.
Do **not** convert the results flow to SPA.
Do **not** rewrite Travelpayouts internals.

Use this direction instead:
- Deep matte purple shell
- Gold primary CTA accents
- Clean light-neutral results canvas
- Sticky compact ribbon on results page only
- Homepage search card remains separate and unchanged in this task
- Redirect model remains unchanged
- Toolbar intelligence is shown in a slim strip below the ribbon, not inside the ribbon

---

## Architecture constraints

1. `WhiteLabelResultsBridge.tsx` is the active `/flights/results` page.
2. `CompactFlightToolbar.tsx` is the custom search UI used on the results page.
3. Travelpayouts is still responsible for rendering the results canvas (`#tpwl-tickets`).
4. Search submit must continue using the existing URL/redirect flow.
5. Avoid brittle DOM surgery inside Travelpayouts widgets.
6. Prefer modular extraction over giant inline files.

---

## Phase 1 — Safe cleanup and extraction

### Patch 1 — Add shared White Label bridge utilities
**Create file:** `client/src/lib/flights/whiteLabelBridge.ts`

Move shared logic here from `WhiteLabelResultsBridge.tsx` and/or `FlightResults.tsx`:
- `safeParam`
- `normalizeCode`
- `safeIsoDate`
- `parseFlightSearch`
- `buildInitFromQuery`
- `hasRenderedWeedles`
- `buildFallbackUrl`

Requirements:
- Keep function signatures simple and typed.
- Preserve current behavior.
- Export helpers individually.
- Add short doc comments for Travelpayouts-specific parsing assumptions.

### Patch 2 — Extract results page styles into dedicated CSS
**Create file:** `client/src/styles/white-label-results.css`

Move the giant inline `<style>` block out of `WhiteLabelResultsBridge.tsx`.

Requirements:
- Keep all selectors scoped to the results page as much as possible.
- Preserve current functional styling during extraction.
- Keep Travelpayouts theming conservative.
- Do not add aggressive selectors that depend on unstable hashed TP classnames.

### Patch 3 — Refactor `WhiteLabelResultsBridge.tsx` to use shared utils and external CSS
**Modify file:** `client/src/pages/flights/WhiteLabelResultsBridge.tsx`

Requirements:
- Import the extracted helpers from `client/src/lib/flights/whiteLabelBridge.ts`.
- Import `client/src/styles/white-label-results.css`.
- Remove duplicated helper definitions from the file.
- Remove stale `tpwl-search` cleanup/hide logic if `#tpwl-search` is not rendered by this page.
- Keep Travelpayouts mount logic for `#tpwl-tickets` intact.
- Keep weedle/fallback logic intact.
- Keep current analytics click tracking for stays/cars intact.
- Keep SEO intact.

### Patch 4 — Add a lightweight results meta strip component
**Create file:** `client/src/components/flights/results/FlightIntelligenceStrip.tsx`

Initial version should be lightweight and safe.

Render a slim strip directly below the sticky ribbon with concise trust/intelligence items such as:
- Compare fares from partner agencies
- Final booking happens on the partner site
- Prices may change before payment

Requirements:
- Responsive
- Compact height
- Visually matches premium dark toolbar / light results canvas transition
- Accept optional props for future dynamic intelligence content

### Patch 5 — Mount the meta strip in the results page
**Modify file:** `client/src/pages/flights/WhiteLabelResultsBridge.tsx`

Place `FlightIntelligenceStrip` directly below the toolbar section and above the Travelpayouts results canvas.

### Patch 6 — Mark legacy page as deprecated
**Modify file:** `client/src/pages/FlightResults.tsx`

Requirements:
- Add a top-level deprecation comment indicating that `/flights/results` uses `WhiteLabelResultsBridge`.
- Do not break imports.
- Do not spend time redesigning this file.

---

## Phase 2 — Premium ribbon redesign

### Patch 7 — Redesign `CompactFlightToolbar.tsx` as a sticky premium ribbon
**Modify file:** `client/src/components/flights/search/CompactFlightToolbar.tsx`

### Design goals
- Sticky premium ribbon for results page
- Desktop: single compact row
- Mobile: stacked premium sheet
- Visual language: matte deep purple shell, gold CTA, restrained use of glass/frost only for small surfaces/focus states
- Do not use full heavy glassmorphism across the whole toolbar

### Desktop spec
- Outer shell: dark matte purple / plum background
- Width: centered `max-w-screen-xl`
- Height feel: slimmer than homepage card, denser than current mobile card
- Branding (if shown): compact logo + subtle divider
- Search tabs: segmented control with restrained contrast
- Main search ribbon:
  - Trip type segment
  - From field
  - Swap control
  - To field
  - Date range field
  - Travellers/cabin field
- Search CTA:
  - solid gold
  - strongest visual emphasis in the toolbar
  - slightly rounded pill/button
- Alerts CTA:
  - hide or disable if not implemented
  - do not leave as `href="#"`

### Mobile spec
- Keep top brand row compact
- Replace generic card feel with premium stacked sheet feel
- Stronger spacing rhythm
- Better section grouping
- Search button full-width gold CTA
- Retain existing expand/collapse logic
- Maintain usability for route/date/traveller editing

### Interaction rules
- Keep current submit flow using `actions.submit()` and redirect on success.
- Keep current route prefill behavior from `initialState`.
- Preserve validation behavior.
- Add subtle pressed/hover/focus states.
- Add optional `isSubmitting` state support if easy and low-risk.

### Non-goals
- Do not convert to client-side SPA search updates.
- Do not add complex async fetching in the toolbar.
- Do not couple toolbar state to Travelpayouts widget internals.

### Patch 8 — Polish mobile floating modify-search pill
**Modify file:** `client/src/components/flights/results/MobileSummaryPill.tsx`

Requirements:
- Dark glass capsule look
- Better spacing and shadow
- More refined typography
- Keep current behavior and click target
- Keep it mobile-only

### Patch 9 — Unify results shell visuals
**Modify file:** `client/src/pages/flights/WhiteLabelResultsBridge.tsx`
**Modify file:** `client/src/styles/white-label-results.css`

Requirements:
- Ensure ribbon, intelligence strip, results canvas, cross-sell cards, and footer feel like one coherent system.
- Keep Travelpayouts result styling conservative.
- Focus on spacing, background transitions, and CTA consistency.

---

## Finalized redesign spec for `CompactFlightToolbar.tsx`

### Purpose
A compact, premium, sticky search refinement ribbon for the results page.

### Must keep
- Existing `useFlightSearch(initialState)` usage
- Existing `actions.submit()` redirect flow
- Existing route/date/traveller/cabin editing behavior
- Existing desktop/mobile split

### Must change
- Replace flat yellow toolbar styling with matte premium results-toolbar styling
- Make desktop row feel denser and cleaner
- Make mobile form feel more premium and structured
- Make Search CTA the clear focal point
- Remove placeholder alerts action if not implemented

### Visual tokens
Use these approximate tokens unless the codebase already has better equivalents:
- Shell background: `#24103A` to `#160B26` range
- Accent purple: `#5B0FA8`
- Gold primary: `#F5A623`
- Gold hover: `#D4881A`
- Soft text on dark: `rgba(255,255,255,0.72)`
- Muted dividers: `rgba(255,255,255,0.10)`
- Input background: `#FFFFFF`
- Input ring: `rgba(0,0,0,0.08)`

### Desktop layout target
`[Brand] [Flight/Hotel tabs] [Trip type | From ⇄ To | Dates | Travellers] [Search]`

Notes:
- Avoid excessive height.
- Avoid noisy icons.
- Keep dividers subtle.
- Use compact paddings.
- Ensure CTA is visually dominant.

### Mobile layout target
`[Brand row]`
`[Tabs]`
`[Trip type]`
`[From / To with swap]`
`[Dates | Travellers]`
`[Search CTA]`

Notes:
- Preserve current flow.
- Improve visual grouping.
- Keep tap targets comfortable.
- Keep collapse/summary behavior.

### Acceptance criteria for `CompactFlightToolbar.tsx`
- No regression in submit behavior
- No regression in field state prefill
- No `href="#"` placeholder actions left visible
- Desktop ribbon remains sticky and compact
- Mobile sheet remains easy to edit
- CTA is visually stronger than all secondary actions
- Design reads as GoTravel Asia premium, not Cheapflights clone

---

## Acceptance criteria for the whole Phase 1 + Phase 2 set

1. `/flights/results` still works with current redirect/query flow.
2. Travelpayouts results still render inside `#tpwl-tickets`.
3. Toolbar is visibly redesigned into a premium sticky ribbon.
4. Intelligence/trust strip exists below the ribbon.
5. Mobile summary pill matches the new premium language.
6. No stale `tpwl-search` logic remains if unused.
7. Duplicate helper logic is reduced.
8. Styling is moved out of the giant inline block.
9. Changes are modular and readable.

---

## Suggested delivery order for Codex

Please implement in this exact order:
1. Patch 1
2. Patch 2
3. Patch 3
4. Patch 4
5. Patch 5
6. Patch 6
7. Patch 7
8. Patch 8
9. Patch 9

After coding, run type checks and fix any import/type issues.
Keep changes focused on Phase 1 and Phase 2 only.
Do not redesign unrelated pages.

---

## Codex execution instruction

Codex: implement the patches above directly in the repository on the current working branch. Prefer minimal-risk edits, preserve existing search behavior, and optimize for production-safe maintainability rather than flashy hacks.
