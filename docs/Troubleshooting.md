# Troubleshooting & FAQ

Common issues and their solutions when using DevPulse.

## General Issues

### "Connection Refused" Error

**Symptoms:** SDK cannot connect to DevPulse server

**Solutions:**

1. Verify the server is running:

   ```bash
   docker compose ps
   ```

2. Check the DSN is correct:

   ```
   http://localhost:8000/api/ingest/YOUR_API_KEY
   ```

3. Ensure the API key matches a project in the dashboard

### Events Not Appearing in Dashboard

**Symptoms:** Errors are thrown but don't show up in DevPulse

**Solutions:**

1. Check SDK is initialized before errors occur
2. Verify `enabled` configuration is not set to `false`
3. Check browser console for JavaScript errors
4. Check server logs: `docker compose logs devpulse`

### Rate Limiting Errors

**Symptoms:** Getting 429 Too Many Requests errors

**Solutions:**

1. Check `INGEST_RATE_LIMIT` in server .env (default: 120 per minute)
2. Reduce `tracesSampleRate` in SDK config
3. Implement client-side sampling

## Docker Issues

### Container Won't Start

**Solutions:**

1. Check logs: `docker compose logs devpulse`
2. Verify .env file exists: `cp .env.example .env`
3. Check ports are not in use: `lsof -i :8000`

### Database Connection Failed

**Symptoms:** Server logs show "connection refused" to PostgreSQL

**Solutions:**

1. Ensure PostgreSQL container is running: `docker compose ps`
2. Check DATABASE_URL format in .env
3. Restart containers: `docker compose restart`

### Out of Disk Space

**Solutions:**

1. Clean up Docker:

   ```bash
   docker system prune -a
   ```

2. Enable event retention:
   ```
   EVENT_RETENTION_DAYS=30
   ```

## SDK-Specific Issues

### Laravel SDK

#### Exceptions Not Captured

Ensure the service provider is registered. In `config/app.php`, verify:

```php
'providers' => [
    // ...
    DevPulse\Laravel\DevPulseServiceProvider::class,
],
```

#### Slow Queries Not Reported

1. Enable slow query capture in .env:

   ```
   DEVPULSE_CAPTURE_SLOW_QUERIES=true
   DEVPULSE_SLOW_QUERY_MS=1000
   ```

2. Add the database query log in `AppServiceProvider`:

   ```php
   use DevPulse\Laravel\Facades\DevPulse;
   use Illuminate\Support\Facades\DB;

   DB::listen(function ($query) {
       if ($query->time > 1000) {
           DevPulse::captureMessage('Slow query: ' . $query->sql, 'warning', [
               'time' => $query->time,
               'sql' => $query->sql,
           ]);
       }
   });
   ```

#### Slow Requests Not Captured

Ensure the middleware is registered. See [SDKs Documentation](SDKs#slow-request-middleware).

### Browser SDK

#### Source Maps Not Working

DevPulse doesn't process source maps automatically. Use a build tool plugin like `@sentry/webpack-plugin` or upload source maps to your own server.

#### CORS Errors

If seeing CORS errors, ensure your server allows requests from your application domain. The ingest endpoint accepts requests from any origin by default.

### WordPress Plugin

#### Plugin Not Showing in Admin

1. Ensure the folder name is `devpulse` (not `devpulse-wp`)
2. Check file permissions
3. Verify WordPress version is 6.0+

#### Errors Not Being Captured

Check that PHP error reporting is enabled:

```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

## Performance Issues

### High Memory Usage

1. Reduce event retention: `EVENT_RETENTION_DAYS=30`
2. Enable sampling in SDK: `tracesSampleRate: 0.1`
3. Exclude noisy errors in SDK config

### Slow Server Response

1. Check database indexes: Run `EXPLAIN` on slow queries
2. Enable Redis caching
3. Monitor server resources: `docker stats`

## Security

### How to Secure My DevPulse Installation?

1. **Use HTTPS** - Set up a reverse proxy with SSL
2. **Set ADMIN_TOKEN** - Generate a secure token
3. **Firewall** - Only expose necessary ports
4. **Regular Backups** - Backup the database

### Is My Data Encrypted?

PostgreSQL data is stored unencrypted by default. For production:

1. Enable PostgreSQL encryption
2. Use a private network
3. Enable TLS for Redis

## Frequently Asked Questions

### What is a DSN?

DSN (Data Source Name) is the URL your SDK uses to send events. It includes the server address and API key. Format:

```
http://SERVER/api/ingest/API_KEY
```

### How Do I Create Multiple Projects?

1. Open the DevPulse dashboard
2. Click "New Project"
3. Enter name and select platform
4. Copy the generated DSN

### Can I Use DevPulse in Production?

Yes! DevPulse is designed for production use. See [Server Setup](Server-Setup) for production recommendations.

### How Do I Upgrade?

```bash
git pull --recurse-submodules
docker compose pull
docker compose up -d
```

### Can I Migrate from Sentry?

Currently, there's no automated migration. You'll need to:

1. Create new projects in DevPulse
2. Update SDK DSN configurations
3. Historical data stays in Sentry

### What's the Difference Between Events and Issues?

- **Event** - A single occurrence (an error, a warning, a performance measurement)
- **Issue** - A group of similar events (e.g., all "NullPointerException" errors are grouped into one issue)

### How Does Grouping Work?

Events are grouped by:

1. Exception type
2. Stack trace fingerprint
3. Message similarity

### How Long Is Data Retained?

Configure with `EVENT_RETENTION_DAYS` in server .env. Default is 90 days. Set to 0 to disable auto-deletion.

## Get Help

- GitHub Issues: https://github.com/SekolahCode/devpulse/issues
- Discussions: https://github.com/SekolahCode/devpulse/discussions
