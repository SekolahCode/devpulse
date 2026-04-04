# Server Setup

This guide covers advanced server configuration and deployment options for DevPulse.

## Docker Deployment

### Quick Start

```bash
git clone --recurse-submodules git@github.com:SekolahCode/devpulse.git
cd devpulse/server
cp .env.example .env
docker compose up -d
```

### Environment Variables

Configure the server by editing the `.env` file:

| Variable               | Default              | Description                          |
| ---------------------- | -------------------- | ------------------------------------ |
| `DATABASE_URL`         | —                    | PostgreSQL connection string         |
| `REDIS_URL`            | —                    | Redis connection string              |
| `SERVER_PORT`          | `8000`               | Host port                            |
| `ADMIN_TOKEN`          | _(empty)_            | Bearer token for protected routes    |
| `RUST_LOG`             | `info`               | Log level                            |
| `INGEST_RATE_LIMIT`    | `120`                | Max events per API key per 60s       |
| `EVENT_RETENTION_DAYS` | `90`                 | Auto-delete events older than N days |
| `SMTP_HOST`            | _(empty)_            | SMTP host for email alerts           |
| `SMTP_PORT`            | `587`                | SMTP port                            |
| `SMTP_USER`            | —                    | SMTP username                        |
| `SMTP_PASS`            | —                    | SMTP password                        |
| `SMTP_FROM`            | `devpulse@localhost` | From address for alerts              |

### Using Pre-built Image

The default `docker-compose.yaml` uses the pre-built image from Docker Hub:

```yaml
services:
  devpulse:
    image: sekolahcode/devpulse-server:latest
```

### Building from Source

To build the server from source instead:

```yaml
services:
  devpulse:
    build:
      context: .
      dockerfile: Dockerfile
```

Then run:

```bash
docker compose build
docker compose up -d
```

## Production Deployment

### Security Recommendations

1. **Set ADMIN_TOKEN**: Generate a secure token for API authentication

   ```bash
   openssl rand -hex 32
   ```

2. **Enable SSL/TLS**: Use a reverse proxy like nginx with Let's Encrypt

3. **Configure Firewall**: Only expose necessary ports

4. **Regular Backups**: Backup the PostgreSQL database regularly

### Example Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name devpulse.example.com;

    ssl_certificate /etc/letsencrypt/live/devpulse.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/devpulse.example.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Database Backup

```bash
# Backup
docker exec devpulse-postgres-1 pg_dump -U devpulse > backup.sql

# Restore
docker exec -i devpulse-postgres-1 psql -U devpulse < backup.sql
```

## Docker Compose Variants

### Development Mode

Start infrastructure services only (for local Rust development):

```bash
docker compose -f docker-compose.dev.yaml up -d
```

This starts PostgreSQL, Redis, and Mailpit for email previews.

### Production Mode

For production, consider:

1. Using named volumes for data persistence
2. Enabling health checks
3. Setting resource limits
4. Using secrets for sensitive data

## Troubleshooting

### Container Won't Start

Check logs:

```bash
docker compose logs devpulse
```

### Database Connection Issues

Verify DATABASE_URL format:

```
postgresql://username:password@hostname:5432/devpulse
```

### Rate Limiting

If you're hitting rate limits, check:

- `INGEST_RATE_LIMIT` value in .env
- Redis is running properly
- API key is correct

### Email Alerts Not Working

1. Verify SMTP settings in .env
2. Check logs: `docker compose logs devpulse`
3. Test SMTP connection from container:
   ```bash
   docker exec devpulse-devpulse-1 telnet smtp.example.com 587
   ```
