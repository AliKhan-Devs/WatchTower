🗼

**WatchTower**

User Manual

_Self-Hosted Application Monitoring & Alerting Platform_

Version 1.0 · 2026

# **Table of Contents**

1\. Introduction 3

2\. Getting Started 4

2.1 Prerequisites 4

2.2 Installation 4

2.3 First Login 5

3\. Dashboard Overview 6

4\. Managing Apps 7

4.1 Creating an App 7

4.2 API Key 7

4.3 Deleting an App 7

5\. Installing the SDK 8

5.1 Installation 8

5.2 Configuration Options 8

5.3 Testing the SDK 9

6\. Reading Your Metrics 10

6.1 Overview Cards 10

6.2 Response Time Chart 10

6.3 Error Rate Chart 11

6.4 Top Routes Table 11

7\. Uptime Monitoring 12

7.1 Adding an Uptime Check 12

7.2 Understanding Status 12

8\. Alerts 13

8.1 Creating an Alert 13

8.2 Alert Types 13

8.3 Slack & Discord Webhooks 14

8.4 Email Alerts 14

8.5 Managing Alerts 14

9\. Real-Time Live Feed 15

10\. API Reference 16

11\. Troubleshooting 17

12\. Architecture Overview 18

# **1\. Introduction**

WatchTower is a self-hosted application monitoring and alerting platform. Once deployed, it gives you full visibility into how your Express.js applications are performing - response times, error rates, request volumes, uptime, and more.

Unlike SaaS tools such as Datadog or New Relic, WatchTower runs entirely on your own infrastructure. Your metrics data never leaves your server.

### **What WatchTower Does**

- Tracks every HTTP request made to your Express apps automatically
- Displays real-time and historical metrics in a clean dashboard
- Pings your URLs every 60 seconds to monitor uptime
- Fires alerts via Slack, Discord, or email when thresholds are breached
- Streams live metrics to your dashboard via WebSocket

### **Key Concepts**

| **Term**     | **What It Means**                                                        |
| ------------ | ------------------------------------------------------------------------ |
| App          | A monitored Express application. Each app gets a unique API key.         |
| Workspace    | Your personal space - contains all your apps and settings.               |
| SDK          | A small npm package installed in your Express app that sends metrics.    |
| Metric       | A single HTTP request record: route, method, status code, response time. |
| Uptime Check | A URL that WatchTower pings every 60 seconds to verify it is reachable.  |
| Alert        | A rule that fires a notification when a metric crosses a threshold.      |
| Ingest API   | The endpoint the SDK posts metrics to. Authenticated by API key.         |

# **2\. Getting Started**

## **2.1 Prerequisites**

Before installing WatchTower, ensure the following software is installed on your server or local machine:

| **Requirement** | **Details**                                       |
| --------------- | ------------------------------------------------- |
| Docker Desktop  | Version 24 or higher - includes Docker Compose v2 |
| Node.js         | Version 20 or higher (only needed for the SDK)    |
| Git             | For cloning the repository                        |
| Open Ports      | 3000 (API) and 3001 (Dashboard) must be available |

## **2.2 Installation**

Follow these steps to get WatchTower running on your machine.

- Clone the repository from GitHub:

git clone <https://github.com/yourusername/watchtower.git>

cd watchtower

- Copy the example environment file and fill in your values:

cp .env.example .env

Open .env and set at minimum the following:

| **Variable**       | **Description**                                         |
| ------------------ | ------------------------------------------------------- |
| POSTGRES_PASSWORD  | A strong password for your database                     |
| JWT_SECRET         | A long random string for signing access tokens          |
| JWT_REFRESH_SECRET | A different long random string for refresh tokens       |
| FRONTEND_URL       | URL of the dashboard (default: <http://localhost:3001>) |

**💡 Tip:** Generate secure secrets with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

- Start all services with Docker Compose:

docker compose up -d

- Verify everything is running:

docker compose ps

You should see four containers all showing status Up: watchtower_postgres, watchtower_redis, watchtower_api, and watchtower_dashboard.

- Open the dashboard in your browser:

<http://localhost:3001>

## **2.3 First Login**

- Click Register on the login page.
- Enter your name, email address, and a password.
- Click Create Account.

WatchTower will create your account and automatically provision a personal workspace for you. You will be redirected to the main dashboard.

**ℹ️ Note:** There is no email verification step. Your account is active immediately after registration.

# **3\. Dashboard Overview**

After logging in you will see the main WatchTower dashboard. Here is a breakdown of the interface:

| **Area**                   | **Description**                                                           |
| -------------------------- | ------------------------------------------------------------------------- |
| Sidebar - Logo & Workspace | Shows your workspace name at the top left.                                |
| Sidebar - Overview         | Takes you to the app list page showing all your monitored apps.           |
| Sidebar - Your Apps        | Lists each app you have created. Click any app to view its metrics.       |
| Sidebar - Logout           | Clears your session and returns you to the login page.                    |
| Main Area                  | Changes depending on which page you are on.                               |
| Live Indicator             | A pulsing green dot appears on app pages when live metrics are streaming. |
| Time Range Selector        | Dropdown on each app page to switch between 1h, 24h, and 7d views.        |
| Toast Notifications        | Red pop-up in the top-right corner when an alert fires.                   |

The sidebar is always visible. Navigation is instant - no page reloads. The dashboard is a Next.js single-page application.

# **4\. Managing Apps**

## **4.1 Creating an App**

An App in WatchTower represents one of your Express applications that you want to monitor.

- From the Overview page, type a name for your app in the text field at the top.
- Press Enter or click + Add App.
- Your new app appears as a card with its API key visible.

**💡 Tip:** Use a descriptive name like 'Production API' or 'Staging Backend' so you can tell apps apart at a glance.

## **4.2 API Key**

Every app is assigned a unique API key when it is created. This key is used by the SDK to authenticate metric submissions.

| **Action**     | **How To**                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------ |
| View the key   | It is shown on the app card (Overview page) and at the top of the app detail page.         |
| Rotate the key | Use the API endpoint POST /api/apps/:id/rotate-key. The old key stops working immediately. |
| Keep it secret | Anyone with this key can send metrics to your app. Do not commit it to version control.    |

## **4.3 Deleting an App**

Currently app deletion is available via the API. From the dashboard you can navigate to an app to manage its alerts and uptime checks.

**⚠️ Warning:** Deleting an app permanently removes all its metrics, alerts, and uptime checks. This cannot be undone.

# **5\. Installing the SDK**

The WatchTower SDK is an npm package that you install into your existing Express application. It intercepts every HTTP request and sends metrics to WatchTower automatically.

## **5.1 Installation**

- In your Express app's directory, install the SDK:

npm install watchtower-sdk

- Add two lines to your Express app - the import and the middleware:

const { watchTower } = require('watchtower-sdk');

app.use(watchTower({

apiKey: 'YOUR_APP_API_KEY',

host: '<http://localhost:3000>'

}));

- Start your app normally. Metrics will begin flowing to WatchTower within 10 seconds.

**ℹ️ Note:** Place app.use(watchTower(...)) before your route definitions so all routes are captured.

## **5.2 Configuration Options**

| **Option**        | **Description**                                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| apiKey (required) | Your app's API key from the WatchTower dashboard.                                               |
| host (required)   | Base URL of your WatchTower API. E.g. <http://localhost:3000> or <https://watch.yourdomain.com> |
| flushIntervalMs   | How often to send batched metrics in milliseconds. Default: 10000 (10 seconds).                 |
| maxBatchSize      | Maximum metrics per batch request. Default: 100.                                                |
| debug             | Set to true to see flush logs in your app's console. Default: false.                            |

## **5.3 Testing the SDK**

To confirm the SDK is working:

- Enable debug mode: set debug: true in the configuration.
- Make a few HTTP requests to your Express app.
- After 10 seconds you should see in your console:

\[WatchTower\] Flushed 3 metrics

- Open WatchTower dashboard, click your app, and check the Overview cards.
- You should see the request count increase.

**⚠️ Warning:** If you see 'Flush error: Invalid API key', double-check the apiKey value matches exactly what is shown in the dashboard. API keys are case-sensitive.

# **6\. Reading Your Metrics**

Click any app in the sidebar to open its metrics page. At the top right, use the time range dropdown to switch between Last 1h, Last 24h, and Last 7d.

## **6.1 Overview Cards**

Four summary cards appear at the top of every app page:

| **Card**          | **What It Shows**                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| Total Requests    | Number of HTTP requests recorded in the selected time window.                                      |
| Avg Response Time | Mean response time across all requests. Green if under 1000ms, red if over.                        |
| Error Rate        | Percentage of requests that returned HTTP 4xx or 5xx status codes. Green if under 5%, red if over. |
| Total Errors      | Raw count of error responses in the selected time window.                                          |

## **6.2 Response Time Chart**

A line chart showing response time trends over time. Three lines are shown:

- Avg (blue) - the average response time per hour bucket
- Max (red dashed) - the worst response time recorded in that hour
- Min (green dashed) - the fastest response time in that hour

Hover over any point on the chart to see the exact values for that time period. A large gap between Avg and Max indicates occasional slow requests, which may point to a specific slow route or database query.

## **6.3 Error Rate Chart**

A bar chart showing the percentage of requests that resulted in errors, grouped by hour. Each bar shows:

- Height - the error rate percentage for that hour
- Tooltip - the exact error rate, plus total request count and error count

A spike in the error rate chart often corresponds with a deployment, a downstream service failure, or a bug introduced in that time window.

## **6.4 Top Routes Table**

A table showing your 10 most frequently hit routes in the selected time window, sorted by request count. Columns:

| **Column** | **Description**                                                           |
| ---------- | ------------------------------------------------------------------------- |
| Route      | The HTTP method and path, e.g. GET /api/users. IDs are normalised to :id. |
| Requests   | Total number of requests to this route.                                   |
| Avg (ms)   | Average response time for this route specifically.                        |
| Error %    | Error rate for this route. Red if over 5%, green if under.                |

Use the Top Routes table to identify which endpoints are slowest or most error-prone. A route with high Avg ms is a candidate for optimization.

# **7\. Uptime Monitoring**

Uptime monitoring lets WatchTower ping a URL every 60 seconds and alert you if it goes down. This is independent of the SDK - you do not need the SDK installed to use uptime monitoring.

## **7.1 Adding an Uptime Check**

- Open the app you want to monitor in the dashboard.
- Scroll to the Uptime Monitor card.
- Use the API to register your URL (currently via curl or Postman):

curl -X POST <http://localhost:3000/api/uptime> \\

\-H "Authorization: Bearer YOUR_TOKEN" \\

\-H "Content-Type: application/json" \\

\-d '{"appId":"YOUR_APP_ID","url":"<https://yourapp.com/health"}>'

**💡 Tip:** Monitor a dedicated /health endpoint in your app that returns 200 OK quickly, rather than a full page route. This gives you the most accurate uptime signal.

## **7.2 Understanding Status**

| **Status** | **Meaning**                                                                         |
| ---------- | ----------------------------------------------------------------------------------- |
| UNKNOWN    | No pings have completed yet (check was just registered).                            |
| UP         | The last successful ping returned HTTP 2xx within the timeout window.               |
| DOWN       | Three or more consecutive pings have failed. An alert has been fired if configured. |

The Uptime Monitor card on the app page shows:

- Current status badge (UP / DOWN / UNKNOWN)
- The monitored URL
- Uptime percentage over the last 24 hours
- Count of failed pings and total pings

**ℹ️ Note:** WatchTower considers a ping failed if the response takes longer than 10 seconds or if the HTTP status code is not in the 2xx range. A site that returns 404 will be marked DOWN.

# **8\. Alerts**

Alerts notify you when something goes wrong. WatchTower checks your thresholds after every metrics flush (every 5 seconds) and queues notification jobs via BullMQ with cooldown logic to prevent alert spam.

## **8.1 Creating an Alert**

- Open an app from the sidebar.
- Scroll to the Create Alert section at the bottom of the page.
- Fill in the form:
  - Select an Alert Type
  - Enter a threshold value (not required for Uptime type)
  - Enter a Webhook URL, an Email address, or both
  - Set the Cooldown in minutes (default 15)
- Click Create Alert.

The new alert appears in the Active Alerts panel on the right. It is active immediately.

## **8.2 Alert Types**

| **Type**      | **Description**                                                                                                                                                         |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ERROR_RATE    | Fires when the percentage of 4xx/5xx responses in the last 5 minutes exceeds the threshold. Enter the threshold as a percentage - e.g. 5 means fire if error rate > 5%. |
| RESPONSE_TIME | Fires when the average response time in the last 5 minutes exceeds the threshold. Enter in milliseconds - e.g. 2000 means fire if avg response time > 2000ms.           |
| UPTIME        | Fires when the monitored URL is detected as DOWN (3 consecutive failed pings). Also fires again when the URL recovers. No threshold needed.                             |

## **8.3 Slack & Discord Webhooks**

WatchTower sends alerts to any webhook URL that accepts JSON POST requests. Both Slack and Discord support this natively.

### **Setting Up a Slack Webhook**

- Go to <https://api.slack.com/apps> and create a new app.
- Enable Incoming Webhooks for the app.
- Add a webhook to a channel and copy the URL.
- Paste the URL into the Webhook URL field when creating an alert.

### **Setting Up a Discord Webhook**

- In your Discord server, go to a channel's Settings.
- Click Integrations > Webhooks > New Webhook.
- Copy the webhook URL.
- Paste it into the Webhook URL field. Discord webhooks are compatible with the Slack format WatchTower uses.

## **8.4 Email Alerts**

To receive email alerts, configure your SMTP settings in the .env file before starting WatchTower:

| **Variable** | **Example Value**                             |
| ------------ | --------------------------------------------- |
| SMTP_HOST    | smtp.gmail.com                                |
| SMTP_PORT    | 587                                           |
| SMTP_USER    | <youraddress@gmail.com>                       |
| SMTP_PASS    | your-app-password (not your account password) |
| SMTP_FROM    | <watchtower@yourdomain.com>                   |

**ℹ️ Gmail Note:** Gmail requires an App Password, not your regular account password. Go to Google Account > Security > 2-Step Verification > App Passwords to generate one.

## **8.5 Managing Alerts**

In the Active Alerts panel on each app page you can:

| **Action**      | **How**                                                                                 |
| --------------- | --------------------------------------------------------------------------------------- |
| Toggle ON / OFF | Click the green ON or grey OFF badge to enable or disable an alert without deleting it. |
| Delete          | Click the red Delete button. This permanently removes the alert.                        |

**💡 Tip:** During deployments or maintenance, toggle alerts OFF temporarily to avoid a flood of false positives. Toggle them back ON when done.

# **9\. Real-Time Live Feed**

WatchTower streams live metrics to your browser over a WebSocket connection (Socket.IO). No manual refresh is needed.

### **How It Works**

- When you open an app's detail page, your browser connects to the WatchTower WebSocket server.
- It subscribes to that app's live feed using your authentication token.
- Every 5 seconds when the metrics flusher writes data to the database, it also broadcasts the batch to all subscribed clients.
- The live event counter in the top right of the app page increments for each incoming event.
- Every 10 live events, the charts automatically refresh to show the latest data.

### **Live Indicators**

| **Indicator**               | **Meaning**                                                                 |
| --------------------------- | --------------------------------------------------------------------------- |
| Pulsing green dot + counter | You are connected and receiving live metrics for this app.                  |
| Alert toast (top-right)     | An alert was just fired. Shows type, app name, and current value.           |
| No indicator                | No live events yet - send requests to your monitored app to start the feed. |

**ℹ️ Note:** If the live feed stops working after leaving the page idle, simply navigate away and back. The socket re-subscribes automatically on reconnect.

# **10\. API Reference**

All API endpoints are prefixed with /api. Endpoints marked JWT require an Authorization: Bearer &lt;token&gt; header. Ingest uses x-api-key instead.

### **Authentication**

| **Endpoint**            | **Description**                                                         |
| ----------------------- | ----------------------------------------------------------------------- |
| POST /api/auth/register | Create a new user account. Body: { name, email, password }              |
| POST /api/auth/login    | Log in. Body: { email, password }. Returns accessToken + refreshToken.  |
| POST /api/auth/refresh  | Exchange a refresh token for a new access token. Body: { refreshToken } |
| POST /api/auth/logout   | Invalidate a refresh token. Body: { refreshToken }                      |

### **Apps (JWT required)**

| **Endpoint**                  | **Description**                                           |
| ----------------------------- | --------------------------------------------------------- |
| GET /api/apps                 | List all apps in your workspace.                          |
| POST /api/apps                | Create an app. Body: { name, description? }               |
| GET /api/apps/:id             | Get a single app with alerts and uptime checks.           |
| PATCH /api/apps/:id           | Update name or description. Body: { name?, description? } |
| DELETE /api/apps/:id          | Delete an app and all its data.                           |
| POST /api/apps/:id/rotate-key | Generate a new API key. Old key is immediately invalid.   |

### **Metrics (JWT required)**

| **Endpoint**                          | **Description**                                  |
| ------------------------------------- | ------------------------------------------------ |
| GET /api/metrics/:appId/overview      | Summary stats. Query: ?hours=24                  |
| GET /api/metrics/:appId/response-time | Response time chart data. Query: ?hours=24       |
| GET /api/metrics/:appId/error-rate    | Error rate chart data. Query: ?hours=24          |
| GET /api/metrics/:appId/top-routes    | Top 10 routes by request count. Query: ?hours=24 |

### **Ingest (API Key required)**

| **Endpoint**     | **Description**                                                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| POST /api/ingest | Submit metrics. Header: x-api-key. Body: array of metric objects (max 100 per request). Each object: { route, method, statusCode, responseTime, timestamp? } |

### **Alerts (JWT required)**

| **Endpoint**           | **Description**                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------- |
| POST /api/alerts       | Create an alert. Body: { appId, type, threshold, cooldownMins?, webhookUrl?, email? } |
| GET /api/alerts/:appId | List all alerts for an app.                                                           |
| PATCH /api/alerts/:id  | Update an alert. Body: { threshold?, webhookUrl?, email?, cooldownMins?, isActive? }  |
| DELETE /api/alerts/:id | Delete an alert.                                                                      |

### **Uptime (JWT required)**

| **Endpoint**                   | **Description**                                 |
| ------------------------------ | ----------------------------------------------- |
| POST /api/uptime               | Register a URL to monitor. Body: { appId, url } |
| GET /api/uptime/:appId         | List uptime checks for an app.                  |
| DELETE /api/uptime/:id         | Remove an uptime check.                         |
| GET /api/uptime/:appId/history | Get ping history and uptime %. Query: ?hours=24 |

# **11\. Troubleshooting**

| **Problem**                                        | **Solution**                                                                                                                                                                                |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard shows 'No data yet' after installing SDK | Wait 10-15 seconds for the first flush. Check the SDK debug logs. Confirm the API key is correct and the host URL is reachable from your app's server.                                      |
| Docker containers fail to start                    | Run docker compose logs postgres to check for errors. Ensure ports 5432, 6379, 3000, and 3001 are not already in use on your machine.                                                       |
| WebSocket shows 'xhr poll error'                   | Check that FRONTEND_URL in your .env matches the origin your browser is using. For local file testing, set CORS to \*.                                                                      |
| Alerts not firing                                  | Confirm the alert is toggled ON. Check that the threshold has been exceeded in the last 5 minutes. Check the BullMQ worker logs: docker compose logs api.                                   |
| Email alerts not sending                           | Verify SMTP_USER and SMTP_PASS are set. For Gmail, use an App Password, not your account password. Check docker compose logs api for SMTP errors.                                           |
| Uptime check shows UNKNOWN                         | The first ping runs within 60 seconds of registration. Wait 1-2 minutes then refresh the page.                                                                                              |
| API returns 401 Unauthorized                       | Your access token has expired. The dashboard refreshes it automatically, but if calling the API manually, use POST /api/auth/refresh to get a new token.                                    |
| Metrics accumulate in Redis but never flush to DB  | The metrics flusher runs inside the API container. Check docker compose logs api for '\[Flusher\]' lines. If absent, the worker may have crashed - restart with docker compose restart api. |

# **12\. Architecture Overview**

This section describes how the components of WatchTower fit together. Understanding the architecture helps you scale, debug, and extend the platform.

## **Request Flow**

The following describes the path a single metric takes from your app to the dashboard:

- Your Express app receives an HTTP request.
- The WatchTower SDK middleware intercepts the request and starts a timer.
- When the response finishes, the SDK records the metric in an in-memory queue.
- Every 10 seconds, the SDK flushes the queue as a single batch POST to /api/ingest.
- The ingest handler validates the API key (cached in Redis for 5 minutes).
- Each metric is pushed into a Redis list (metrics:buffer) as JSON.
- A background flusher reads up to 500 items from Redis every 5 seconds.
- Metrics are bulk-inserted into PostgreSQL in a single createMany call.
- The flusher then checks alert thresholds for the affected apps.
- If a threshold is breached, a job is queued in BullMQ.
- The BullMQ worker processes the job: checks cooldown, fires webhook/email, updates lastFiredAt.
- The flusher also broadcasts the metrics batch via Socket.IO to subscribed dashboard clients.

## **Component Roles**

| **Component**     | **Role**                                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| watchtower-sdk    | npm package. Middleware + HTTP client. Batches and sends metrics from your Express app.        |
| Express API       | Core backend. Handles auth, ingest, metrics queries, alerts CRUD, uptime CRUD.                 |
| PostgreSQL        | Persistent storage for users, workspaces, apps, metrics, alerts, uptime events.                |
| Redis             | Two roles: (1) write buffer for incoming metrics, (2) BullMQ job queue and cooldown TTL store. |
| BullMQ            | Reliable job queue for alert dispatch. Handles retries, deduplication, and concurrency.        |
| node-cron         | Scheduler inside the API process. Fires a URL ping function every 60 seconds.                  |
| Socket.IO         | WebSocket layer. Authenticated per-user rooms. Broadcasts live metrics and alert events.       |
| Next.js Dashboard | React frontend. Recharts for graphs, Socket.IO client for live feed, Axios for REST calls.     |

## **Data Retention**

WatchTower currently stores all metrics indefinitely. For production deployments with high traffic, consider adding a scheduled cleanup job to delete metrics older than 30 days:

// Add to a cron job

await prisma.metric.deleteMany({

where: { timestamp: { lt: new Date(Date.now() - 30 \* 24 \* 60 \* 60 \* 1000) } }

});

**💡 Tip:** At 1000 requests/minute, the metrics table grows by approximately 1.4 million rows per day. Plan your storage accordingly.

_WatchTower v1.0 · Built by Ali · MIT License_