---
name: Next.js dev manifest race crashes
description: Recurring transient runtime crash in this Next.js project's dev server, and how to confirm/fix it fast.
---

Symptom: user reports "Start application artifact crashed with a runtime error". Logs show one of:
- `⨯ SyntaxError: Unexpected end of JSON input at JSON.parse (<anonymous>) { page: '/some-route' }` followed by a single `GET /some-route 500`
- Browser console `unhandlederror: SyntaxError: Invalid or unexpected token` (often paired with `WebSocket ... webpack-hmr ... ERR_INVALID_HTTP_RESPONSE`, which is separately benign — proxied dev preview iframes can't do WS HMR here)

Root cause: `next dev --webpack` writes per-route build manifests to `.next/` on first compile. When multiple routes are requested concurrently right after a change/restart, a manifest read can race a still-being-written file and get truncated/empty JSON, producing a one-off crash that self-heals on the next request.

**Why:** confirmed across multiple sessions on this project — the 500 always recovers on the immediate next hit to the same route, and `rm -rf .next` + workflow restart + warming routes **sequentially** (not in parallel) eliminates it entirely.

**How to apply:** when this crash is reported, don't hunt for an app code bug first — `rm -rf .next`, restart the `Start application` workflow, then curl/screenshot key routes one at a time (small sleep between) to confirm 200s before concluding the fix worked. Only dig into app code if the same route keeps failing after a clean cache + sequential warm-up.
