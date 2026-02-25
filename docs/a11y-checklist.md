# Accessibility Checklist (Audit v2)

- [x] Replaced blocking `alert()` validation in flight/hotel widgets with inline error text.
- [x] Added `aria-live="polite"` status regions for validation feedback.
- [x] Bound hotel form labels with `htmlFor` / `id`.
- [x] Error boundary now shows safe user-facing text (no stack trace exposure).
- [ ] Passenger selector full dialog semantics/focus trap review.
- [ ] Lighthouse accessibility verification target >=95 in deployment environment.
