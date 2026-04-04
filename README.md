# DevPulse

Self-hosted error tracking and performance monitoring for developers.
Like Sentry, but free and runs locally via Docker.

> **v1.0 — breaking change:** The ingest API key moved from the URL to an
> `X-API-Key` header. Upgrade all SDKs together with the server.
> See [CHANGELOG.md](CHANGELOG.md) for the full upgrade guide.

## Quick Start

```bash
docker compose up -d
```

Open [http://localhost:8000](http://localhost:8000)

## SDKs

| Package   | Install                                            |
| --------- | -------------------------------------------------- |
| Laravel   | `composer require devpulse/laravel`                |
| WordPress | Drop plugin into `wp-content/plugins/`             |
| Browser   | `npm install @sekolahcode/devpulse-browser`        |
| Node.js   | `npm install @sekolahcode/devpulse-node`           |

## Repos

- [server/](server/) — Rust + Axum ingestion server
- [sdks/php-core/](sdks/php-core/) — PHP core SDK
- [sdks/laravel/](sdks/laravel/) — Laravel package
- [sdks/wordpress/](sdks/wordpress/) — WordPress plugin
- [sdks/browser/](sdks/browser/) — Browser JS SDK
- [sdks/node/](sdks/node/) — Node.js SDK

## Clone (Including Submodules)

```bash
git clone --recurse-submodules git@github.com:SekolahCode/devpulse.git
```

## Daily Workflow

```bash
# Work in a submodule (e.g. server)
cd server
git add .
git commit -m "fix: improve fingerprinting"
git push origin main

# Update main repo to point to latest submodule commit
cd ..
git add server
git commit -m "chore: update server submodule"
git push origin main
```

```bash
# Pull latest changes from all submodules
git submodule update --remote --merge
```
