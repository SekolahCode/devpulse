# Development Guide

This guide covers setting up a local development environment for DevPulse.

## Repository Structure

```
devpulse/
├── server/           # Rust API server (Axum)
│   ├── src/          # Rust source code
│   ├── dashboard/    # Vue 3 dashboard
│   ├── migrations/   # Database migrations
│   └── docker/       # Docker initialization scripts
├── sdks/
│   ├── browser/      # JavaScript browser SDK
│   ├── node/         # Node.js SDK
│   ├── laravel/      # Laravel package
│   ├── php-core/     # PHP core SDK
│   └── wordpress/    # WordPress plugin
├── docs/             # Documentation
└── LICENSE
```

## Git Submodules

This project uses Git submodules. Clone with:

```bash
git clone --recurse-submodules git@github.com:SekolahCode/devpulse.git
```

To update submodules:

```bash
git submodule update --remote --merge
```

## Server Development

### Prerequisites

- Rust toolchain (rustup)
- Docker and Docker Compose
- PostgreSQL (via Docker)
- Redis (via Docker)

### Starting Infrastructure

```bash
cd server
docker compose -f docker-compose.dev.yaml up -d
```

This starts:

- PostgreSQL on port **5433** (host) → 5432 (container)
- Redis on port 6379
- Mailpit SMTP on port 1025, web UI on http://localhost:8025

Set `SMTP_HOST=localhost SMTP_PORT=1025` in your `.env` to test alert emails locally.
Docker Compose reads `.env` automatically — copy `.env.example` and adjust values.

### Running the Server

```bash
cd server
cargo run
```

The server runs on http://localhost:8000

### Running the Dashboard (Hot Reload)

```bash
cd server/dashboard
npm install
npm run dev
```

The dashboard runs on http://localhost:5173 with hot module replacement.

### Database Migrations

Migrations are in `server/migrations/`. SQLx handles migrations automatically on startup.

To create a new migration:

```bash
cd server
cargo sqlx migrate add --initial create_events_table
```

## SDK Development

### Browser SDK

```bash
cd sdks/browser
npm install
npm run build    # Build for production
npm run dev      # Watch mode
npm test         # Run tests
```

### Laravel SDK

```bash
cd sdks/laravel
composer install
vendor/bin/phpunit        # Run tests
vendor/bin/phpstan analyse # Static analysis
```

### PHP Core

```bash
cd sdks/php-core
composer install
vendor/bin/phpunit
vendor/bin/phpstan analyse
```

### Node.js SDK

```bash
cd sdks/node
npm install
npm test
```

### WordPress Plugin

```bash
cd sdks/wordpress
composer install
composer analyse   # PHPStan static analysis
composer test      # PHPUnit unit tests
```

To test the plugin end-to-end:

1. Copy to a WordPress installation's `wp-content/plugins/`
2. Activate and configure

## Code Style

### Rust

- Follow Rust style guidelines
- Use `cargo fmt` before commits
- Run `cargo clippy` to catch common mistakes

```bash
cargo fmt
cargo clippy
```

### JavaScript/TypeScript

- Follow ESLint rules
- Use Prettier for formatting

```bash
npm run lint
npm run format
```

### PHP

- Follow PSR-12 coding standard
- Use PHPStan for static analysis

```bash
vendor/bin/phpstan analyse
```

## Testing

### Server

```bash
cd server
cargo test
```

### Browser SDK

```bash
cd sdks/browser
npm test
```

### Laravel SDK

```bash
cd sdks/laravel
vendor/bin/phpunit
```

### PHP Core

```bash
cd sdks/php-core
vendor/bin/phpunit
```

## Pull Request Workflow

1. Create a feature branch:

   ```bash
   git checkout -b feature/my-feature
   ```

2. Make changes and commit:

   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. Push and create PR:

   ```bash
   git push origin feature/my-feature
   ```

4. For submodules, after merging:
   ```bash
   cd server
   git pull origin main
   cd ..
   git add server
   git commit -m "chore: update server submodule"
   git push origin main
   ```

## Building Docker Image

```bash
cd server
docker build -t devpulse-server:local .
```

## Running in Production Mode

```bash
cd server
docker compose up -d
```

## Working with Submodules

### Update Single Submodule

```bash
git submodule update --remote --merge server
```

### Change Submodule URL

1. Edit `.gitmodules`
2. Run `git submodule sync`
3. Commit changes
