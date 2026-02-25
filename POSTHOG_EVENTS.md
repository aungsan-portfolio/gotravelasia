# PostHog Events

## New / Updated Events
- `affiliate_cta_clicked`
  - Payload: `{ action, partner, utm, referrer, sessionId, url }`
  - Triggered from global affiliate link click listener and direct CTA handlers.
- `search_flights_clicked`
  - Payload includes route/date fields plus `referrer`, `sessionId`.
- `flight_search_step`
  - Payload: `{ step, value, referrer, sessionId }`.
- `flight_search_abandoned`
  - Payload includes current draft search details and default wrapper fields.
- `hotel_search_step`
  - Payload: `{ step, value, referrer, sessionId }`.
- `hotel_search_submitted`
  - Payload: `{ citySlug, checkInDate, checkOutDate, referrer, sessionId }`.
- `hotel_search_abandoned`
  - Payload includes wrapper metadata.
- Existing calendar events now flow through centralized wrapper:
  - `green_date_clicked`
  - `calendar_tab_clicked`
  - `calendar_precision_changed`
- `ui_error_boundary_triggered`
  - Payload: `{ message, name, referrer, sessionId }`.
