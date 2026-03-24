<div align="center">

<br/>

```
██╗    ██╗ █████╗ ████████╗ ██████╗██╗  ██╗    ████████╗ ██████╗ ██╗    ██╗███████╗██████╗
██║    ██║██╔══██╗╚══██╔══╝██╔════╝██║  ██║    ╚══██╔══╝██╔═══██╗██║    ██║██╔════╝██╔══██╗
██║ █╗ ██║███████║   ██║   ██║     ███████║       ██║   ██║   ██║██║ █╗ ██║█████╗  ██████╔╝
██║███╗██║██╔══██║   ██║   ██║     ██╔══██║       ██║   ██║   ██║██║███╗██║██╔══╝  ██╔══██╗
╚███╔███╔╝██║  ██║   ██║   ╚██████╗██║  ██║       ██║   ╚██████╔╝╚███╔███╔╝███████╗██║  ██║
 ╚══╝╚══╝ ╚═╝  ╚═╝   ╚═╝    ╚═════╝╚═╝  ╚═╝       ╚═╝    ╚═════╝  ╚══╝╚══╝╚══════╝╚═╝  ╚═╝
```

**Self-hosted application monitoring & alerting — drop 2 lines into any Express app and get full observability.**

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)

<!-- <br/>

[**Live Demo**](#) · [**Documentation**](#) · [**Report a Bug**](issues) · [**Request a Feature**](issues)

<br/> -->

</div>

---

## 🗼 What Is WatchTower?

WatchTower is a **lightweight, self-hosted alternative to Datadog and Better Uptime**. Install the SDK in any Express app, and within seconds you have:

- 📊 **Response time & error rate dashboards** with historical charts
- ⚡ **Real-time metrics feed** over WebSocket — no polling
- 🔔 **Threshold-based alerting** via Slack, Discord, or email
- 📡 **Uptime monitoring** — pings your URLs every 60 seconds
- 🔑 **Multi-tenant** — each user has their own workspace and apps
- 📦 **Published npm SDK** — `npm i @alikhan-devs/watchtower-sdk`, 2 lines of code

> **Your data never leaves your server.** WatchTower runs entirely on your own infrastructure.

---

## ✨ Quick Start

### 1 · Clone & configure

```bash
git clone https://github.com/AliKhan-Devs/WatchTower.git
cd watchtower
cp .env.example .env   # fill in JWT secrets and DB password
```

### 2 · Start everything

```bash
docker compose up -d
```

| Service       | URL                    |
|---------------|------------------------|
| API           | http://localhost:3000  |
| Dashboard     | http://localhost:3001  |

### 3 · Monitor your Express app

```bash
npm i @alikhan-devs/watchtower-sdk
```

```js
const { watchTower } = require('@alikhan-devs/watchtower-sdk');
OR 
import { watchTower } from '@alikhan-devs/watchtower-sdk';

// That's it. Add these 2 lines to your Express app.
app.use(watchTower({
  apiKey: 'your-api-key-from-dashboard',
  host:   'http://localhost:3000',
}));
```

Your app is now fully monitored. Open the dashboard and watch metrics flow in.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  Your Express App                                                   │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  app.use(watchTower({ apiKey, host }))  ← 2 lines of code   │  │
│  └──────────────────────┬───────────────────────────────────────┘  │
└─────────────────────────┼───────────────────────────────────────────┘
                          │  POST /api/ingest  (batched every 10s)
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      WatchTower API  (Express + TypeScript)         │
│                                                                     │
│   ┌─────────────────┐    ┌──────────────────┐    ┌──────────────┐  │
│   │  Ingest Handler │───▶│   Redis Buffer   │───▶│  PostgreSQL  │  │
│   │  (API key auth) │    │  (metrics:list)  │    │  (bulk write │  │
│   └─────────────────┘    └──────────────────┘    │   every 5s)  │  │
│                                                   └──────┬───────┘  │
│   ┌─────────────────┐    ┌──────────────────┐           │          │
│   │  Alert Engine   │◀───│  Threshold Check │◀──────────┘          │
│   │  (BullMQ queue) │    │  (post-flush)    │                      │
│   └────────┬────────┘    └──────────────────┘                      │
│            │  webhook / email dispatch                              │
│            ▼                                                        │
│   ┌─────────────────┐    ┌──────────────────┐                      │
│   │  Uptime Pinger  │    │  Socket.IO Server│                      │
│   │  (node-cron 60s)│    │  (live feed)     │                      │
│   └─────────────────┘    └────────┬─────────┘                      │
└────────────────────────────────────┼────────────────────────────────┘
                                     │  WebSocket
                                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  Next.js Dashboard                                  │
│   Recharts graphs · Real-time feed · Alert config · App switcher   │
└─────────────────────────────────────────────────────────────────────┘
```

### Why This Architecture?

| Pattern | Why It's Here |
|---|---|
| **Redis write buffer** | Metrics arrive in high-frequency bursts. Buffering in Redis and bulk-writing every 5s reduces DB load by ~100x vs. writing each request individually. |
| **BullMQ alert queue** | Alerts need retries, deduplication, and cooldown logic. A queue guarantees at-least-once delivery without spamming. |
| **WebSocket over polling** | Polling a metrics API every second creates unnecessary load. Socket.IO pushes only when new data arrives. |
| **Separate SDK package** | The monitored app should have zero knowledge of WatchTower internals. The SDK is a clean, versioned contract. |

---

## 🧰 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Backend** | Node.js · Express · TypeScript | REST API, ingest, auth |
| **Database** | PostgreSQL + Prisma | Persistent metrics & config storage |
| **Cache / Buffer** | Redis (ioredis) | Metric write buffer + BullMQ backend |
| **Queue** | BullMQ | Alert dispatch with retries & cooldown |
| **Real-time** | Socket.IO | Live metrics push to dashboard |
| **Scheduler** | node-cron | Uptime URL pinger (every 60s) |
| **Auth** | JWT + refresh token rotation | Stateless, secure sessions |
| **SDK** | TypeScript → npm package | Express middleware for monitored apps |
| **Frontend** | Next.js 15 · Tailwind CSS · Recharts | Dashboard UI |
| **DevOps** | Docker Compose · GitHub Actions | Local dev + CI/CD to EC2 |

---

## 📦 Repository Structure

```
watchtower/
├── apps/
│   ├── api/                 # Express backend
│   │   ├── src/
│   │   │   ├── modules/     # auth · workspace · apps · ingest · metrics · alerts · uptime
│   │   │   ├── workers/     # metrics flusher · alert checker · uptime pinger
│   │   │   ├── queues/      # BullMQ alert queue
│   │   │   ├── websocket/   # Socket.IO server
│   │   │   └── config/      # Prisma · Redis clients
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── Dockerfile
│   │
│   ├── dashboard/           # Next.js frontend
│   │   ├── app/
│   │   │   ├── (auth)/      # login · register pages
│   │   │   └── dashboard/   # overview · app detail pages
│   │   ├── components/      # charts · ui · layout
│   │   ├── lib/             # api client · socket · hooks
│   │   └── Dockerfile
│   │
│   └── sdk/                 # npm package: watchtower-sdk
│       └── src/
│           ├── client.ts    # HTTP client with batching
│           ├── middleware.ts # Express middleware
│           └── index.ts     # Public API
│
├── docker-compose.yml
├── .env.example
└── .github/
    └── workflows/
        └── deploy.yml       # Type check + SSH deploy to EC2
```

---

## 🔌 API Reference

### Authentication

```http
POST /api/auth/register    Body: { name, email, password }
POST /api/auth/login       Body: { email, password }
POST /api/auth/refresh     Body: { refreshToken }
POST /api/auth/logout      Body: { refreshToken }
```

### Apps  `🔒 JWT`

```http
GET    /api/apps
POST   /api/apps             Body: { name, description? }
GET    /api/apps/:id
PATCH  /api/apps/:id
DELETE /api/apps/:id
POST   /api/apps/:id/rotate-key
```

### Ingest  `🔑 API Key`

```http
POST /api/ingest
x-api-key: <app-api-key>

[{ route, method, statusCode, responseTime, timestamp? }]   # up to 100 per request
```

### Metrics  `🔒 JWT`

```http
GET /api/metrics/:appId/overview        ?hours=24
GET /api/metrics/:appId/response-time   ?hours=24
GET /api/metrics/:appId/error-rate      ?hours=24
GET /api/metrics/:appId/top-routes      ?hours=24
```

### Alerts  `🔒 JWT`

```http
POST   /api/alerts           Body: { appId, type, threshold, cooldownMins?, webhookUrl?, email? }
GET    /api/alerts/:appId
PATCH  /api/alerts/:id
DELETE /api/alerts/:id
```

### Uptime  `🔒 JWT`

```http
POST   /api/uptime           Body: { appId, url }
GET    /api/uptime/:appId
DELETE /api/uptime/:id
GET    /api/uptime/:appId/history   ?hours=24
```

---

## ⚙️ Configuration

Copy `.env.example` to `.env` and set these values:

```env
# ── Database ──────────────────────────────────────────────
POSTGRES_USER=watchtower
POSTGRES_PASSWORD=          # strong password
POSTGRES_DB=watchtower

# ── Auth ──────────────────────────────────────────────────
# Generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=
JWT_REFRESH_SECRET=

# ── Frontend ──────────────────────────────────────────────
FRONTEND_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3000

# ── Email alerts (optional) ───────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=                  # Gmail: use App Password, not account password
SMTP_FROM=watchtower@yourdomain.com
```

---

## 🚀 Deployment

### Docker Compose (recommended)

```bash
# Production — all 4 services: postgres, redis, api, dashboard
docker compose up -d

# View logs
docker compose logs -f api

# Update to latest
git pull && docker compose build --no-cache && docker compose up -d
```

### GitHub Actions CI/CD

The included workflow (`.github/workflows/deploy.yml`) automatically:

1. **Type-checks** both the API and dashboard on every push to `main`
2. **SSH deploys** to your EC2 instance if type checks pass

Add these secrets to your GitHub repo (`Settings → Secrets → Actions`):

| Secret | Value |
|---|---|
| `EC2_HOST` | Your EC2 public IP address |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | Contents of your `.pem` private key file |

---

## 📡 SDK Reference

```bash
npm install @alikhan-devs/watchtower-sdk
```

```js
const { watchTower } = require('@alikhan-devs/watchtower-sdk');

app.use(watchTower({
  apiKey:          'your-api-key',          // required — from WatchTower dashboard
  host:            'https://wt.yourdomain.com', // required — your WatchTower API URL
  flushIntervalMs: 10000,                   // optional — default 10s
  maxBatchSize:    100,                     // optional — default 100
  debug:           false,                   // optional — logs flush activity
}));
```

The SDK automatically:
- Intercepts every Express request with zero config
- Normalises route patterns (e.g. `/users/123` → `/users/:id`)
- Batches metrics and sends them in bulk
- Retries failed flushes and puts metrics back in queue on error
- Unrefs the flush timer so it never keeps your process alive

---

## 🗺️ Roadmap

- [ ] Retention policy — auto-delete metrics older than N days
- [ ] Multiple uptime checks per app
- [ ] PagerDuty and Opsgenie alert channels
- [ ] Public status page per workspace
- [ ] Fastify + Koa SDK support
- [ ] Metrics export (CSV / JSON)
- [ ] Dark/light theme toggle in dashboard

---

## 🤝 Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change.

```bash
# Run the API in dev mode
cd apps/api && npm run dev

# Run the dashboard in dev mode
cd apps/dashboard && npm run dev -- --port 3001

# Start backing services only
docker compose up postgres redis -d
```

---

## 📄 License

[MIT](LICENSE) — built by **Ali Khan**.

---

<div align="center">

**If this project helped you, please consider giving it a ⭐**
