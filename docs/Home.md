# DevPulse Documentation

Welcome to the DevPulse documentation. DevPulse is a self-hosted error tracking and performance monitoring solution for developers. Like Sentry, but free and runs locally via Docker.

## What is DevPulse?

DevPulse provides:

- **Error Tracking** - Capture and track exceptions from your applications
- **Performance Monitoring** - Monitor Core Web Vitals and slow requests
- **Real-time Notifications** - Get alerts via email when issues occur
- **Self-hosted** - Complete control over your data with Docker deployment

## v1.0 — Breaking Changes

**Upgrading from pre-1.0?** The ingest endpoint and authentication have changed:

- The API key is no longer part of the URL. Update your DSN from `https://<host>/api/ingest/<key>` — the key is now sent automatically as an `X-API-Key` header by all official SDKs.
- All official SDKs (Browser, Node.js, PHP, Laravel, WordPress) have been updated and send the header transparently. No application code changes are required — only update the SDK packages.

## Quick Start

```bash
# Clone the repository
git clone --recurse-submodules git@github.com:SekolahCode/devpulse.git

# Start the server
cd devpulse
docker compose up -d

# Open the dashboard
open http://localhost:8000
```

## Supported Platforms

DevPulse offers SDKs for multiple platforms:

| Platform  | Package                         | Installation                                |
| --------- | ------------------------------- | ------------------------------------------- |
| Laravel   | `devpulse/laravel`              | `composer require devpulse/laravel`         |
| WordPress | devpulse-wp                     | Drop into `wp-content/plugins/`             |
| Browser   | `@sekolahcode/devpulse-browser` | `npm install @sekolahcode/devpulse-browser` |
| Node.js   | `@sekolahcode/devpulse-node`    | `npm install @sekolahcode/devpulse-node`    |
| PHP       | `devpulse/core`                 | `composer require devpulse/core`            |

## Architecture

DevPulse consists of:

- **Rust Server** - High-performance ingestion API built with Axum
- **PostgreSQL** - Primary database for storing events and issues
- **Redis** - Rate limiting and caching
- **Vue 3 Dashboard** - Embedded web interface for viewing issues

## Next Steps

- [Getting Started](Getting-Started) - Detailed setup guide
- [Server Setup](Server-Setup) - Configure the DevPulse server
- [SDK Documentation](SDKs) - Integrate with your applications
- [API Reference](API-Reference) - API endpoints and authentication
