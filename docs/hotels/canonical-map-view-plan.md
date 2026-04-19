# Hotel Search Canonical URL Specification

GoTravelAsia uses a SEO-friendly, canonical path pattern for hotel search results, inspired by major metasearch platforms like canonical.

## URL Contract

The canonical path follows this pattern:
`/hotels/{destination-pid}/{checkIn}/{checkOut}/{occupancy};{view}`

### Parameters

- **`destination-pid`**: A slugified destination label followed by an optional `-pid` suffix (e.g., `bangkok-pid18056`).
- **`checkIn` / `checkOut`**: ISO 8601 formatted dates (`YYYY-MM-DD`).
- **`occupancy`**: A semicolon-separated list of tokens describing the party. Currently supports:
  - `{N}adults` (e.g., `2adults`)
  - `{N}rooms` (e.g., `1rooms`)
- **`view`**: The layout mode, either `list` or `map`.

### Example
`/hotels/bangkok-pid18056/2026-06-16/2026-06-30/2adults;map`

---

## Integration Architecture

### 1. Route Definition (`App.tsx`)
The canonical route is defined at the top of the hotels routing section to ensure it takes precedence over generic destination slugs.

### 2. State Management (`useHotelRouteState.ts`)
A centralized hook is responsible for:
- Detecting if the current URL is canonical or legacy (query-string).
- Resolving the human-readable destination label to a technical city slug used by the backend.
- Merging path-based parameters with optional query parameters (like `sort` or `page`).

### 3. Shared Library (`canonicalPattern.ts`)
Pure utility functions to handle the string-level parsing and building of paths, ensuring consistency between the frontend routing and search navigation.

---

## Maintenance & Evolution

- **Adding Occupancy Tokens**: To support children or multiple room types, update the `parsePartyToken` logic in `canonicalPattern.ts` and the `partyMatch` logic in `useHotelRouteState.ts`.
- **Fuzzy Resolution**: The city resolver in `useHotelRouteState.ts` includes fallback strategies for labels that don't match slug patterns exactly. Always update the `cities.ts` registry when adding new destination metadata.
