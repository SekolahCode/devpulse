# Changelog

All notable changes are documented here. Each component follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

---

## Server — v1.0.0 · Browser SDK — v1.0.0 · Node SDK — v1.0.0 · PHP core — v2.0.0 · Laravel — v2.0.0 · WordPress — v2.0.0

> Released: 2026-04-04

### Breaking Changes

- **Ingest endpoint** — The API key is no longer part of the URL path. The previous endpoint
  `POST /api/ingest/{api_key}` has been replaced by `POST /api/ingest` with the key supplied
  in the `X-API-Key` request header.

  | Before (≤ 0.x) | After (1.0+) |
  |---|---|
  | `POST /api/ingest/<key>` | `POST /api/ingest` + `X-API-Key: <key>` header |

  All official SDKs handle this transparently — updating the package is sufficient.
  If you call the API directly, move the key to the header.

### New Features

- **Node.js SDK** (`@sekolahcode/devpulse-node` v1.0.0) — server-side error tracking for
  Node ≥ 18 with Express/Connect middleware, `uncaughtException` handler, and breadcrumbs.
- **Trace IDs** — every request now receives a UUID via `X-Trace-Id` response header,
  and callers may propagate their own ID by sending it as a request header.
- **Dead-letter queue** — failed worker jobs are stored in Redis (`devpulse:events:dead`,
  capped at 1 000 entries) and are visible in `/metrics`.
- **Prometheus metrics** — `devpulse_jobs_processed_total`, `devpulse_jobs_failed_total`,
  and DLQ depth added to the `/metrics` endpoint.
- **AI analysis** — multi-provider support (Anthropic, OpenAI, Google Gemini) with
  automatic model selection based on available keys.
- **Analytics dashboard** — Chart.js-powered charts via `/api/stats/chart`.
- **Release management** — `GET/POST /api/projects/{id}/releases` and
  `DELETE /api/releases/{id}` endpoints.
- **Alert management** — `GET/PATCH/DELETE` for alert rules in addition to create.
- **Update/delete projects** — `PATCH/DELETE /api/projects/{id}`.

### Security Fixes

- API key no longer appears in server access logs or browser history (URL → header).
- Browser SDK: query strings stripped from XHR/fetch breadcrumb URLs by default (set
  `captureQueryStrings: true` to opt in and preserve them).
- Browser SDK: DSN validated against private/loopback IP ranges to prevent SSRF.
- Laravel SDK: password-scrubbing regex extended to cover `pwd`, `pass`, and
  space-separated header variants.

### Bug Fixes

- Rate limiter INCR + EXPIRE race condition fixed with an atomic Lua script.
- CORS `allow_headers` now includes `X-API-Key` and `X-Trace-Id` (without this,
  cross-origin browser requests were silently blocked by preflight).
- Async tracing span now uses `.instrument()` instead of `span.enter()` across
  `.await` points (incorrect in Tokio's multi-threaded runtime).
- Laravel: removed accidental `return false` that suppressed Laravel's default
  exception reporter.

---

## Pre-1.0 History

### Server — v0.1.0 (initial release)

- Axum ingestion server with PostgreSQL and Redis.
- Rate limiting (per-API-key, 60-second sliding window).
- Event worker with queued processing.
- Vue 3 dashboard embedded in the binary.
- WebSocket live event stream.
- Email alerts via SMTP.

### Browser SDK — v0.3.0

- Auto-capture of uncaught errors and unhandled promise rejections.
- Core Web Vitals tracking (LCP, INP, CLS, TTFB, page load).
- Breadcrumbs: click trail, SPA navigation, console, XHR, fetch.
- Session sampling via `tracesSampleRate`.
- `beforeSend` hook for payload filtering/enrichment.

### Browser SDK — v0.2.0

- Added `addBreadcrumb()`, `setUser()`, `clearUser()`.
- Added `flush()` and `close()` lifecycle methods.

### Browser SDK — v0.1.0

- Initial release: `init()`, `capture()`, `captureMessage()`.

### WordPress plugin — v1.2.0 (last pre-2.0 release)

- PHP-side event capture for WordPress errors and exceptions.
- Browser SDK auto-injected into frontend via `wp_enqueue_script`.
- Admin settings page for DSN configuration.

### WordPress plugin — v1.1.0

- Added Livewire monitoring support.
- Fixed timeout handling on slow responses.

### WordPress plugin — v1.0.0

- Initial release.

---

## Upgrade Guide

### Upgrading server from 0.x → 1.0

No configuration changes required. The Docker image tag `sekolahcode/devpulse-server:1.0.0`
is the new stable release. Pull and restart:

```bash
docker compose pull
docker compose up -d
```

The database migration runs automatically on startup.

### Upgrading SDKs from 0.x → 1.0

1. Update the package:
   ```bash
   # Browser / Node
   npm install @sekolahcode/devpulse-browser@^1.0 @sekolahcode/devpulse-node@^1.0

   # Laravel
   composer require devpulse/laravel:^1.0

   # PHP core
   composer require devpulse/core:^1.0
   ```
2. No DSN format changes — your existing `https://<host>/api/ingest/<key>` DSN continues
   to work. The SDK extracts the key automatically.

### Keeping the old version

If you are not ready to upgrade, pin your packages to the last pre-1.0 release:

```bash
# npm — browser SDK
npm install @sekolahcode/devpulse-browser@0.3.0

# Composer — Laravel
composer require devpulse/laravel:0.x-dev   # or pin to the last 0.x git tag
```

For the server, use the Docker image digest of the last 0.x build or pin the tag:

```yaml
# docker-compose.yaml
image: sekolahcode/devpulse-server:0.x  # replace with the exact pre-1.0 tag
```

The 0.x server and 1.x server are **not API-compatible** — they expect the API key in
different places. Do not mix a 0.x server with 1.x SDKs or vice versa.
