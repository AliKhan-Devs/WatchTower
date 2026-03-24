# 🗼 WatchTower

A self-hosted application monitoring and alerting platform. Drop two lines into any Express app and get real-time metrics, uptime monitoring, and instant alerts.

## Architecture
```
Your App (SDK installed)
        │
        │  POST /api/ingest (batched metrics)
        ▼
┌──────────────────────────────────────────┐
│            WatchTower API                │
│                                          │
│  Ingest → Redis buffer                   │
│         → flush to PostgreSQL (5s)       │
│                                          │
│  Alert Engine (BullMQ)                   │
│  ├── threshold checker                   │
│  ├── cooldown logic (Redis TTL)          │
│  └── webhook / email dispatcher          │
│                                          │
│  Uptime Pinger (node-cron)               │
│  └── pings registered URLs every 60s    │
│                                          │
│  WebSocket Server (Socket.IO)            │
│  └── pushes live metrics to dashboard   │
└──────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────┐
│       React Dashboard (Next.js)          │
│  • Recharts graphs                       │
│  • Real-time feed (Socket.IO client)     │
│  • Alert configuration UI               │
│  • Multi-app switcher                    │
└──────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL + Prisma |
| Cache / Buffer | Redis |
| Queue | BullMQ |
| Real-time | Socket.IO |
| Cron | node-cron |
| Auth | JWT + refresh token rotation |
| SDK | npm package (watchtower-sdk) |
| Frontend | Next.js, Tailwind CSS, Recharts |
| DevOps | Docker Compose, GitHub Actions |

## Quick Start

### Prerequisites
- Docker + Docker Compose
- Node.js 20+

### 1. Clone the repo
```bash
git clone https://github.com/alikhan-devs/watchtower.git
cd watchtower
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Start everything
```bash
docker compose up -d
```

- API → http://localhost:3000
- Dashboard → http://localhost:3001

### 4. Install the SDK in your Express app
```bash
npm install watchtower-sdk
```
```javascript
const { watchTower } = require('watchtower-sdk');

app.use(watchTower({
  apiKey: 'your-api-key-from-dashboard',
  host: 'http://localhost:3000'
}));
```

That's it. Your app is now monitored.

## Features

- **SDK** — 2-line Express middleware, auto-batches metrics
- **Metrics Dashboard** — response time, error rate, request volume charts
- **Real-time Feed** — live metrics via WebSocket, no polling
- **Alerting** — threshold-based alerts via webhook (Slack/Discord) or email
- **Uptime Monitoring** — pings your URLs every 60s, alerts on 3 consecutive failures
- **Multi-tenant** — each user has their own workspace and apps
- **JWT Auth** — access token + refresh token rotation

## API Reference

### Ingest (SDK → API)
```
POST /api/ingest
x-api-key: <your-app-api-key>

[{ route, method, statusCode, responseTime, timestamp }]
```

### Metrics
```
GET /api/metrics/:appId/overview?hours=24
GET /api/metrics/:appId/response-time?hours=24
GET /api/metrics/:appId/error-rate?hours=24
GET /api/metrics/:appId/top-routes?hours=24
```

### Alerts
```
POST   /api/alerts
GET    /api/alerts/:appId
PATCH  /api/alerts/:id
DELETE /api/alerts/:id
```

### Uptime
```
POST   /api/uptime
GET    /api/uptime/:appId
DELETE /api/uptime/:id
GET    /api/uptime/:appId/history
```

## Project Structure
```
watchtower/
├── apps/
│   ├── api/          # Express backend
│   ├── dashboard/    # Next.js frontend
│   └── sdk/          # npm package
├── docker-compose.yml
└── .github/
    └── workflows/
        └── deploy.yml
```

## License

MIT