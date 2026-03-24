# @alikhan-devs/watchtower-sdk

Lightweight Express monitoring middleware for [WatchTower](https://github.com/AliKhan-Devs/WatchTower).

Drop it into your app and it will automatically:

- Track response time for every request
- Capture status codes and error-rate data
- Normalize route patterns like `/users/123` to `/users/:id`
- Batch metrics and send them to your WatchTower API
- Flush in the background without keeping your Node process alive

## Installation

```bash
npm install @alikhan-devs/watchtower-sdk
```

This package has a peer dependency on Express:

```bash
npm install express
```

## Requirements

- Node.js 18+ recommended
- Express 4.18+ or 5+
- A WatchTower app `apiKey` from your dashboard
- Your WatchTower API base URL

## Quick Start

### CommonJS

```js
const express = require('express');
const { watchTower } = require('@alikhan-devs/watchtower-sdk');

const app = express();

app.use(watchTower({
  apiKey: 'your-app-api-key',
  host: 'http://localhost:3000'
}));

app.get('/users/:id', (req, res) => {
  res.json({ id: req.params.id });
});

app.listen(4000);
```

### ESM / TypeScript

```ts
import express from 'express';
import { watchTower } from '@alikhan-devs/watchtower-sdk';

const app = express();

app.use(watchTower({
  apiKey: 'your-app-api-key',
  host: 'http://localhost:3000'
}));

app.get('/health', (_req, res) => {
  res.send('ok');
});

app.listen(4000);
```

## How It Works

The middleware listens for each response `finish` event, records:

- `route`
- `method`
- `statusCode`
- `responseTime`
- `timestamp`

It then batches those metrics and sends them to:

```http
POST /api/ingest
```

with:

```http
x-api-key: <your-app-api-key>
```

## API

### `watchTower(options)`

Creates the Express middleware and starts the background flusher.

```ts
import { watchTower } from '@alikhan-devs/watchtower-sdk';

const middleware = watchTower({
  apiKey: 'your-app-api-key',
  host: 'http://localhost:3000',
  flushIntervalMs: 10000,
  maxBatchSize: 100,
  debug: false
});
```

### Options

| Option | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `apiKey` | `string` | Yes | - | App API key from WatchTower dashboard |
| `host` | `string` | No | `http://localhost:3000` | Base URL of your WatchTower API |
| `flushIntervalMs` | `number` | No | `10000` | Flush queued metrics every N milliseconds |
| `maxBatchSize` | `number` | No | `100` | Flush immediately once queue reaches this size |
| `debug` | `boolean` | No | `false` | Log SDK flush activity to console |

## Graceful Shutdown

The returned middleware includes a `.stop()` method so you can flush remaining metrics before process exit.

```ts
import express from 'express';
import { watchTower } from '@alikhan-devs/watchtower-sdk';

const app = express();
const monitoring = watchTower({
  apiKey: 'your-app-api-key',
  host: 'http://localhost:3000'
});

app.use(monitoring);

process.on('SIGTERM', async () => {
  await monitoring.stop?.();
  process.exit(0);
});
```

## What Gets Ignored

The middleware skips:

- `/health`
- `/favicon`

## Route Normalization

If Express provides the matched route, the SDK uses it directly.

Examples:

- `/users/123` -> `/users/:id`
- `/orders/550e8400-e29b-41d4-a716-446655440000` -> `/orders/:id`
- Long cuid-style IDs are also normalized to `:id`

This keeps your dashboard clean and prevents route-cardinality explosions.

## Advanced Exports

If you need more control, the package also exports:

```ts
import { WatchTowerClient, createMiddleware } from '@alikhan-devs/watchtower-sdk';
```

## Dependencies

### Runtime dependencies

This package currently has no direct runtime dependencies.

### Peer dependencies

- `express`: `^4.18.0 || ^5.0.0`

That means users should install `express` in their own app:

```bash
npm install express
```

## Troubleshooting

### No metrics appearing

- Make sure `host` points to your WatchTower API, not the dashboard URL
- Make sure `apiKey` is the app API key from WatchTower
- Enable `debug: true` to inspect flush behavior
- Confirm your WatchTower API is reachable from the monitored app

### Using Node below 18

This SDK relies on `fetch`. If you are on an older Node version, upgrade Node or provide a compatible fetch polyfill in your environment.

## License

MIT
