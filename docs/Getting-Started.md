# Getting Started with DevPulse

This guide will walk you through setting up DevPulse and integrating it with your applications.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- A supported SDK based on your tech stack

## Step 1: Start the DevPulse Server

```bash
# Clone the repository with submodules
git clone --recurse-submodules git@github.com:SekolahCode/devpulse.git
cd devpulse

# Copy the environment example file
cp server/.env.example server/.env

# Start the server
docker compose up -d
```

The server will start three containers:

| Container | Service         | Purpose                         |
| --------- | --------------- | ------------------------------- |
| devpulse  | Rust API Server | Ingestion API and web dashboard |
| postgres  | PostgreSQL 16   | Database                        |
| redis     | Redis 7         | Caching and rate limiting       |

## Step 2: Access the Dashboard

Open [http://localhost:8000](http://localhost:8000) in your browser.

## Step 3: Create a Project

1. Click "New Project" in the dashboard
2. Enter a project name (e.g., "My Laravel App")
3. Select the platform (Laravel, WordPress, Browser, etc.)
4. Copy the generated DSN (Data Source Name)

The DSN format is:

```
http://localhost:8000/api/ingest/YOUR_API_KEY
```

## Step 4: Install the SDK

Choose your platform:

### Laravel

```bash
composer require devpulse/laravel

# Publish config
php artisan vendor:publish --tag=devpulse-config
```

Add to your `.env`:

```env
DEVPULSE_DSN=http://localhost:8000/api/ingest/YOUR_API_KEY
DEVPULSE_ENV=production
```

### WordPress

1. Copy `sdks/wordpress` to `wp-content/plugins/devpulse`
2. Activate in WordPress admin
3. Go to **Settings → DevPulse** and enter your DSN

Or add to `wp-config.php`:

```php
define('DEVPULSE_DSN', 'http://localhost:8000/api/ingest/YOUR_API_KEY');
define('DEVPULSE_ENV', 'production');
```

### Browser/JavaScript

Via npm:

```bash
npm install @sekolahcode/devpulse-browser
```

```javascript
import { DevPulse } from "@sekolahcode/devpulse-browser";

DevPulse.init({
  dsn: "http://localhost:8000/api/ingest/YOUR_API_KEY",
  environment: "production",
  release: "1.0.0",
});
```

Via script tag:

```html
<script src="http://localhost:8000/devpulse.js"></script>
<script>
  DevPulse.init({
    dsn: "http://localhost:8000/api/ingest/YOUR_API_KEY",
    environment: "production",
  });
</script>
```

### PHP Core

```bash
composer require devpulse/core
```

```php
use DevPulse\Client;

$client = new Client([
    'dsn' => 'http://localhost:8000/api/ingest/YOUR_API_KEY',
    'environment' => 'production',
]);

$client->register();
```

## Step 5: Verify Integration

Trigger an error in your application to test the integration:

```php
// Laravel/PHP example
throw new \Exception('Test error from DevPulse!');
```

```javascript
// Browser example
throw new Error("Test error from DevPulse!");
```

You should see the error appear in your DevPulse dashboard within seconds.

## Next Steps

- [Server Setup](Server-Setup) - Configure environment variables and options
- [SDK Configuration](SDKs) - Advanced SDK options
- [API Reference](API-Reference) - Integrate via API
