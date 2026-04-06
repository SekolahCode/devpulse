# SDK Documentation

DevPulse provides official SDKs for multiple platforms. This guide covers each SDK's features and configuration options.

## Table of Contents

- [Browser JavaScript SDK](#browser-javascript-sdk)
- [Node.js SDK](#nodejs-sdk)
- [Laravel SDK](#laravel-sdk)
- [WordPress Plugin](#wordpress-plugin)
- [PHP Core](#php-core)

---

## Browser JavaScript SDK

Zero-dependency browser SDK for frontend error tracking and Core Web Vitals monitoring.

### Installation

**Via npm:**

```bash
npm install @sekolahcode/devpulse-browser
```

**Via script tag:**

```html
<script
  src="https://your-devpulse-host/devpulse.js"
  data-dsn="https://your-devpulse-host/api/ingest/YOUR_API_KEY"
  data-env="production"
></script>
```

### Initialization

```javascript
import { DevPulse } from "@sekolahcode/devpulse-browser";

DevPulse.init({
  dsn: "https://your-devpulse-host/api/ingest/YOUR_API_KEY",
  environment: "production",
  release: "1.0.0",
  enabled: true,
  trackVitals: true,
  tracesSampleRate: 1.0,
});
```

### Configuration Options

| Option             | Default        | Description                      |
| ------------------ | -------------- | -------------------------------- |
| `dsn`              | _(required)_   | Ingest endpoint URL with API key |
| `environment`      | `"production"` | Environment name                 |
| `release`          | `null`         | Release/version tag              |
| `enabled`          | `true`         | Enable/disable SDK               |
| `trackVitals`      | `true`         | Auto-track Core Web Vitals       |
| `tracesSampleRate` | `1.0`          | Sample rate (0.0-1.0)            |
| `maxBreadcrumbs` | `20` | Maximum breadcrumbs retained per event |
| `captureQueryStrings` | `false` | Include query strings in XHR/fetch breadcrumb URLs |
| `beforeSend` | `null` | Hook to inspect, modify, or drop events before sending |

### API Reference

#### `DevPulse.init(config)`

Initialize the SDK with configuration.

#### `DevPulse.capture(error, extra?)`

Manually capture an Error object:

```javascript
try {
  riskyOperation();
} catch (err) {
  DevPulse.capture(err, { userId: 42 });
}
```

#### `DevPulse.captureMessage(message, level?)`

Capture a plain string message:

```javascript
DevPulse.captureMessage("Quota limit approaching", "warning");
```

Levels: `debug`, `info`, `warning`, `error`, `fatal`

#### `DevPulse.setUser(user)`

Attach user identity:

```javascript
DevPulse.setUser({ id: "123", email: "user@example.com", name: "Alice" });
```

Call `DevPulse.clearUser()` on logout.

### Core Web Vitals

When `trackVitals: true`, the SDK automatically tracks:

| Metric | Description |
|---|---|
| `lcp` | Largest Contentful Paint (ms) |
| `inp` | Interaction to Next Paint (ms) |
| `cls` | Cumulative Layout Shift (0–1) |
| `ttfb` | Time to First Byte (ms) |
| `page_load` | Total page load time (ms) |

---

## Node.js SDK

Zero-dependency Node.js SDK for server-side error tracking and performance monitoring.

### Installation

```bash
npm install @sekolahcode/devpulse-node
```

### Initialization

```javascript
const { DevPulse } = require('@sekolahcode/devpulse-node');

DevPulse.init({
  dsn: 'https://your-devpulse-host/api/ingest/YOUR_API_KEY',
  environment: 'production',
  release: '1.0.0',
});
```

### Configuration Options

| Option | Default | Description |
|---|---|---|
| `dsn` | *(required)* | Ingest endpoint URL with API key |
| `environment` | `"production"` | Environment name |
| `release` | `null` | Release/version tag |
| `enabled` | `true` | Enable/disable SDK |
| `timeout` | `3000` | HTTP timeout in milliseconds |
| `beforeSend` | `null` | Hook to inspect, modify, or drop events before sending |

### API Reference

#### `DevPulse.captureException(error, extra?)`

```javascript
try {
  await riskyOperation();
} catch (err) {
  DevPulse.captureException(err, { orderId: 42 });
}
```

#### `DevPulse.captureMessage(message, level?, extra?)`

```javascript
DevPulse.captureMessage('Quota approaching', 'warning', { usage: 0.9 });
```

Levels: `debug`, `info`, `warning`, `error`, `fatal`

#### `DevPulse.setUser(user)` / `DevPulse.clearUser()`

```javascript
DevPulse.setUser({ id: '123', email: 'user@example.com' });
DevPulse.clearUser();
```

### Express Integration

```javascript
const { DevPulse, devpulseErrorHandler } = require('@sekolahcode/devpulse-node');

DevPulse.init({ dsn: '...' });

// Register as the last middleware
app.use(devpulseErrorHandler());
```

### `beforeSend` Hook

Return `null` or `false` to drop an event:

```javascript
DevPulse.init({
  dsn: '...',
  beforeSend(event) {
    if (event.user?.email?.endsWith('@internal.example.com')) return null;
    return event;
  },
});
```

---

## Laravel SDK

Real-time error tracking for Laravel applications with automatic capture of exceptions, logs, slow queries, and more.

### Installation

```bash
composer require devpulse/laravel
php artisan vendor:publish --tag=devpulse-config
```

### Configuration

Add to `.env`:

```env
DEVPULSE_DSN=https://your-devpulse-host/api/ingest/YOUR_API_KEY
DEVPULSE_ENV=production
DEVPULSE_RELEASE=1.4.2
```

### Configuration Options

| Variable                   | Default               | Description             |
| -------------------------- | --------------------- | ----------------------- |
| `DEVPULSE_DSN`             | —                     | Ingest URL with API key |
| `DEVPULSE_ENABLED`         | `true`                | Master on/off switch    |
| `DEVPULSE_ENV`             | `APP_ENV`             | Environment name        |
| `DEVPULSE_RELEASE`         | `APP_VERSION`/git SHA | Release version         |
| `DEVPULSE_ASYNC`           | `true`                | Fire-and-forget HTTP    |
| `DEVPULSE_TIMEOUT`         | `2`                   | HTTP timeout (seconds)  |
| `DEVPULSE_SAMPLE_RATE`     | `1.0`                 | Sample rate (0.0-1.0)   |
| `DEVPULSE_SLOW_QUERY_MS`   | `1000`                | Slow query threshold    |
| `DEVPULSE_SLOW_REQUEST_MS` | `3000`                | Slow request threshold  |
| `DEVPULSE_MIN_LOG_LEVEL`   | `error`               | Minimum log level       |
| `DEVPULSE_USER_CONTEXT`    | `true`                | Attach auth user        |

### Capture Toggles

| Variable                          | Default | Description              |
| --------------------------------- | ------- | ------------------------ |
| `DEVPULSE_CAPTURE_EXCEPTIONS`     | `true`  | Unhandled exceptions     |
| `DEVPULSE_CAPTURE_LOGS`           | `true`  | Log::error/critical      |
| `DEVPULSE_CAPTURE_SLOW_QUERIES`   | `true`  | Slow DB queries          |
| `DEVPULSE_CAPTURE_SLOW_REQUESTS`  | `true`  | Slow HTTP requests       |
| `DEVPULSE_CAPTURE_QUEUE_FAILURES` | `true`  | Failed queue jobs        |
| `DEVPULSE_CAPTURE_COMMANDS`       | `true`  | Artisan command failures |

### What's Captured Automatically

- **Exceptions** - All unhandled exceptions
- **Log errors** - `Log::error()` and above
- **Slow queries** - Queries exceeding threshold + breadcrumbs
- **Slow requests** - Requests exceeding threshold (middleware required)
- **Queue failures** - Failed jobs with context
- **Artisan failures** - Commands with non-zero exit
- **User context** - Authenticated user info

### Slow Request Middleware

**Laravel 10** (`app/Http/Kernel.php`):

```php
protected $middleware = [
    \DevPulse\Laravel\Http\Middleware\DevPulseContext::class,
];
```

**Laravel 11** (`bootstrap/app.php`):

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->append(\DevPulse\Laravel\Http\Middleware\DevPulseContext::class);
})
```

### Manual Capture

```php
use DevPulse\Laravel\DevPulseFacade as DevPulse;

// Capture exception
try {
    riskyOperation();
} catch (\Throwable $e) {
    DevPulse::capture($e, ['order_id' => $orderId]);
    throw $e;
}

// Capture message
DevPulse::captureMessage('Payment timeout', 'warning', [
    'gateway' => 'stripe',
    'amount' => $amount,
]);
```

### Testing

```php
use DevPulse\Laravel\DevPulseFacade as DevPulse;

public function test_order_failure_is_tracked(): void
{
    $fake = DevPulse::fake();

    $this->post('/orders', ['invalid' => 'data']);

    $fake->assertCaptured(\App\Exceptions\PaymentFailedException::class);
}

public function test_nothing_sent_for_health(): void
{
    $fake = DevPulse::fake();

    $this->get('/health');

    $fake->assertNothingCaptured();
}
```

### Ignored Exceptions

The following are ignored by default:

- `ValidationException`
- `AuthenticationException`
- `AuthorizationException`
- `ModelNotFoundException`
- `NotFoundHttpException`
- `ThrottleRequestsException`
- `TokenMismatchException`

---

## WordPress Plugin

Error tracking plugin for WordPress sites.

### Installation

1. Copy `sdks/wordpress` to `wp-content/plugins/devpulse`
2. Activate in **Plugins → Installed Plugins**
3. Configure in **Settings → DevPulse**

### Configuration

**Option A: Admin Settings**
Go to **Settings → DevPulse** and enter your DSN and environment.

**Option B: wp-config.php Constants**

```php
define('DEVPULSE_DSN', 'https://your-devpulse-host/api/ingest/YOUR_API_KEY');
define('DEVPULSE_ENV', 'production');
define('DEVPULSE_ENABLED', true);
```

Constants take precedence over admin settings.

### What's Captured

- **PHP errors** - Warnings, notices, fatal errors
- **Unhandled exceptions** - Via WordPress hooks
- **Admin context** - Whether error occurred in wp-admin

---

## PHP Core

Low-level PHP SDK - the foundation used by Laravel integration.

### Installation

```bash
composer require devpulse/core
```

### Basic Usage

```php
use DevPulse\Client;

$client = new Client([
    'dsn' => 'https://your-devpulse-host/api/ingest/YOUR_API_KEY',
    'environment' => 'production',
    'release' => '1.0.0',
    'enabled' => true,
    'async' => true,
    'timeout' => 2,
]);

$client->register();
```

After `register()`, all unhandled exceptions and PHP errors are captured.

### Manual Capture

```php
try {
    riskyOperation();
} catch (\Throwable $e) {
    $client->captureException($e);
}

$client->captureMessage('Something noteworthy', 'warning');
```

### Static Facade

```php
use DevPulse\DevPulse;

DevPulse::init([
    'dsn' => 'https://your-devpulse-host/api/ingest/YOUR_API_KEY',
]);

DevPulse::captureException($e);
DevPulse::captureMessage('hello');
```
