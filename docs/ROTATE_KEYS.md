# GEMINI API Key Rotation Runbook

> Manual operator action required. This repository now reads `GEMINI_API_KEY` from server environment variables only.

## When to rotate
- Immediately after any suspected exposure.
- As part of regular credential hygiene (recommended quarterly).

## Steps (Google AI Studio / Google Cloud)
1. Open the Google AI Studio / Google Cloud project that owns the Gemini key.
2. Revoke or delete the currently active key.
3. Create a new API key with the minimum required permissions.
4. Restrict the key:
   - Application restriction: server-side usage only.
   - API restriction: Gemini Generative Language API only.
5. Update your deployment secrets:
   - `GEMINI_API_KEY=<new_key>`
6. Redeploy the application.
7. Verify the `/api/gemini` endpoint responds successfully in production.
8. Monitor logs for unexpected 401/403/429 responses after rotation.

## Notes
- The Gemini key must never be committed to source code or exposed in client-side bundles.
- Build now fails when `GEMINI_API_KEY` is missing.
