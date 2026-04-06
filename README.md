# DevPulse

Self-hosted error tracking and performance monitoring for developers.
Like Sentry, but free and runs locally via Docker.

## Quick Start

```bash
cp server/.env.example server/.env   # set ADMIN_TOKEN and passwords
docker compose up -d
```

Open [http://localhost:8000](http://localhost:8000)

## SDKs

| Platform  | Package                         | Install                                     |
|-----------|---------------------------------|---------------------------------------------|
| Laravel   | `devpulse/laravel`              | `composer require devpulse/laravel`         |
| WordPress | devpulse-wp                     | Drop into `wp-content/plugins/`             |
| Browser   | `@sekolahcode/devpulse-browser` | `npm install @sekolahcode/devpulse-browser` |
| Node.js   | `@sekolahcode/devpulse-node`    | `npm install @sekolahcode/devpulse-node`    |
| PHP       | `devpulse/core`                 | `composer require devpulse/core`            |

## Repos

| Directory | Description |
|---|---|
| [server/](server/) | Rust + Axum ingestion server + Vue 3 dashboard |
| [sdks/browser/](sdks/browser/) | Browser JS SDK |
| [sdks/node/](sdks/node/) | Node.js SDK |
| [sdks/laravel/](sdks/laravel/) | Laravel package |
| [sdks/php-core/](sdks/php-core/) | PHP core SDK |
| [sdks/wordpress/](sdks/wordpress/) | WordPress plugin |

## Versions

| Component | Version | Breaking changes from previous |
|---|---|---|
| Server | 1.0.1 | API key moved from URL to `X-API-Key` header (v1.0.0) |
| Browser SDK | 1.0.1 | DSN transport rewritten — update alongside server (v1.0.0) |
| Node SDK | 1.0.2 | Initial release (v1.0.0) |
| PHP core | 2.0.1 | DSN transport rewritten (v2.0.0) |
| Laravel SDK | 2.0.1 | DSN transport rewritten (v2.0.0) |
| WordPress plugin | 2.0.1 | DSN transport rewritten, IP spoofing fixed (v2.0.0) |

See [CHANGELOG.md](CHANGELOG.md) for the full history and upgrade guide.

## Clone (Including Submodules)

```bash
git clone --recurse-submodules git@github.com:SekolahCode/devpulse.git
```

## Daily Workflow

```bash
# Work in a submodule (e.g. server)
cd server
git add .
git commit -m "fix: ..."
git push origin main     # all repos use main

# Update the monorepo pointer
cd ..
git add server
git commit -m "chore: bump server"
git push origin main
```

```bash
# Pull latest from all submodules
git submodule update --remote --merge
```
