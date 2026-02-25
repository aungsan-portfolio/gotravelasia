# PostHog Events

## New / Updated Events

- `affiliate_cta_click`
  - Payload: `{ action, partner, utm, referrer, sessionId, url }`
  - Triggered from:
    - Flight widget Trip.com CTA
    - Hotel widget Agoda CTA

- `flight_search_step`
  - Payload includes: `{ step, origin, destination, departDate, returnDate, utm, referrer, sessionId, url }`
  - Triggered on flight search submit.

- `flight_search_abandonment`
  - Payload includes current search state + standard tracking metadata.
  - Triggered on unmount when user interacted but did not submit.

- `hotel_search_step`
  - Payload includes: `{ step, citySlug, checkInDate, checkOutDate, ...tracking metadata }`
  - Triggered on hotel search submit.

- `hotel_search_abandonment`
  - Payload includes partial state + standard tracking metadata.
  - Triggered on unmount when user did not submit.

- Existing calendar events now routed through centralized wrapper:
  - `green_date_clicked`
  - `calendar_tab_clicked`
  - `calendar_precision_changed`

- Existing flight search click event now routed through centralized wrapper:
  - `search_flights_clicked`
