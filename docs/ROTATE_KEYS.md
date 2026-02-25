# GEMINI_API_KEY Rotation Runbook

The previously exposed Gemini key has been removed from client-side code and Gemini requests now use server-side environment variables only.

## Manual rotation steps (Google AI Studio / Google Cloud)

1. Sign in to Google AI Studio or Google Cloud Console with access to the current Gemini API project.
2. Locate the existing API key currently used by production.
3. Create a **new API key** with the minimum required permissions for Gemini content generation.
4. Restrict the new key:
   - Restrict API usage to Gemini/Generative Language APIs.
   - Restrict by application/network where possible (server egress IPs / backend only).
5. Update deployment secrets:
   - `GEMINI_API_KEY` in all environments (production, staging, preview, CI if needed).
6. Redeploy the application.
7. Validate:
   - POST `/api/gemini` returns successful responses.
   - No key appears in client bundle artifacts.
8. Revoke/delete the old exposed key immediately.
9. Audit logs for suspicious usage of the old key and set alerts for abnormal quota spikes.

## Operational note

`/api/gemini` currently uses in-memory per-instance rate limiting (10 requests/IP/hour). In multi-instance deployments, limits are not globally shared and should be moved to a centralized store (Redis, KV, or API gateway limiter).
