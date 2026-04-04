# API Reference

This document covers the DevPulse server API endpoints and authentication.

## Base URL

```
http://localhost:8000
```

## Authentication

Protected routes require an `Authorization` header:

```http
Authorization: Bearer <ADMIN_TOKEN>
```

Set `ADMIN_TOKEN` in your `.env` file. For development, you can leave it blank.

## Public Endpoints

### Health Check

```http
GET /health
```

Response:

```json
{
  "status": "ok",
  "version": "0.1.0"
}
```

### Ingest Events

```http
POST /api/ingest/{api_key}
Content-Type: application/json

{
  "type": "event",
  "payload": {
    "message": "Error message",
    "exception": {
      "type": "Exception",
      "message": "Error details",
      "stacktrace": [...]
    },
    "environment": "production",
    "release": "1.0.0",
    "timestamp": "2024-01-15T10:30:00Z",
    "user": {
      "id": "123",
      "email": "user@example.com"
    },
    "extra": {
      "key": "value"
    }
  }
}
```

### WebSocket - Live Event Stream

```javascript
const ws = new WebSocket("ws://localhost:8000/ws");

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("New event:", data);
};
```

## Protected Endpoints

### List Projects

```http
GET /api/projects
Authorization: Bearer <ADMIN_TOKEN>
```

Response:

```json
{
  "projects": [
    {
      "id": "abc123",
      "name": "My Laravel App",
      "platform": "laravel",
      "dsn": "http://localhost:8000/api/ingest/abc123",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Create Project

```http
POST /api/projects
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "name": "New Project",
  "platform": "laravel"
}
```

### Get Project Issues

```http
GET /api/issues?project_id=abc123
Authorization: Bearer <ADMIN_TOKEN>
```

Query parameters:

- `project_id` - Filter by project
- `status` - Filter by status (open, resolved, ignored)
- `environment` - Filter by environment
- `limit` - Number of results (default: 50)
- `offset` - Pagination offset

### Get Single Issue

```http
GET /api/issues/{id}
Authorization: Bearer <ADMIN_TOKEN>
```

### Update Issue

```http
PATCH /api/issues/{id}
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "status": "resolved",
  "assigned_to": "user@example.com"
}
```

### Delete Issue

```http
DELETE /api/issues/{id}
Authorization: Bearer <ADMIN_TOKEN>
```

### Create Alert Rule

```http
POST /api/projects/{project_id}/alerts
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "name": "High Error Rate",
  "condition": "error_count > 10",
  "environment": "production",
  "actions": ["email"]
}
```

### Get Statistics

```http
GET /api/stats?project_id=abc123
Authorization: Bearer <ADMIN_TOKEN>
```

Response:

```json
{
  "total_events": 1500,
  "total_issues": 45,
  "events_by_day": [{ "date": "2024-01-15", "count": 120 }],
  "top_errors": [{ "message": "Connection refused", "count": 50 }]
}
```

## Event Payload Format

### Exception Event

```json
{
  "type": "event",
  "payload": {
    "timestamp": "2024-01-15T10:30:00Z",
    "level": "error",
    "message": "Connection refused to database",
    "environment": "production",
    "release": "1.4.2",
    "platform": "php",
    "exception": {
      "type": "PDOException",
      "message": "SQLSTATE[08006] Connection refused",
      "stacktrace": [
        {
          "filename": "/var/www/html/app/Models/User.php",
          "lineno": 42,
          "function": "connect",
          "context": ["line 40", "line 41", "line 42"]
        }
      ]
    },
    "user": {
      "id": "123",
      "email": "user@example.com",
      "ip_address": "192.168.1.1"
    },
    "request": {
      "method": "GET",
      "url": "https://example.com/users",
      "headers": {
        "User-Agent": "Mozilla/5.0..."
      }
    },
    "breadcrumbs": [
      { "timestamp": "10:25:00", "message": "Query executed", "type": "query" },
      { "timestamp": "10:26:00", "message": "User logged in", "type": "info" }
    ],
    "extra": {
      "db_host": "localhost",
      "db_port": 5432
    }
  }
}
```

### Message Event

```json
{
  "type": "event",
  "payload": {
    "timestamp": "2024-01-15T10:30:00Z",
    "level": "warning",
    "message": "Slow database query detected",
    "environment": "production",
    "release": "1.4.2",
    "platform": "php",
    "extra": {
      "query": "SELECT * FROM users WHERE...",
      "duration_ms": 2500
    }
  }
}
```

### Performance Event (Browser)

```json
{
  "type": "event",
  "payload": {
    "timestamp": "2024-01-15T10:30:00Z",
    "level": "info",
    "environment": "production",
    "release": "1.0.0",
    "platform": "browser",
    "vitals": {
      "lcp": 2500,
      "fid": 50,
      "cls": 0.1,
      "fcp": 800,
      "ttfb": 400
    },
    "url": "https://example.com/dashboard",
    "user_agent": "Mozilla/5.0..."
  }
}
```

## Error Codes

| Code | Description                             |
| ---- | --------------------------------------- |
| 400  | Bad Request - Invalid payload           |
| 401  | Unauthorized - Invalid or missing token |
| 403  | Forbidden - Insufficient permissions    |
| 404  | Not Found - Resource doesn't exist      |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Internal Server Error                   |
