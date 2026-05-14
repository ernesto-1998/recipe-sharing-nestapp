# 🍳 Recipe Sharing REST API

A **NestJS-based RESTful API** for a **Recipe Sharing Platform**, where users can create, explore, and share cooking recipes.  
The project is designed with a **modular architecture**, **robust authentication**, **structured logging**, and **scalability** in mind.

This API is currently under active development, with future plans including **user social interactions**.

---

## 🚀 Features

- User registration and authentication (JWT and OAuth protocol with Google Provider)
- Role-based access control and privacy settings
- Recipe management (CRUD)
- Pagination, filtering, and case-insensitive search
- Event-driven logging via RabbitMQ with async context tracking
- Swagger documentation
- Dual database setup (MongoDB + PostgreSQL) with RabbitMQ message broker
- Dockerized environment for easy deployment

---

## 🧩 Architecture Overview

The application is structured in **independent, feature-based modules**, each handling a specific domain or concern.  
All modules are wired together through **NestJS dependency injection**, ensuring scalability and testability.

---

## 🧭 Roadmap

- [✔️] **Integration & Unit Testing**
- [✔️] **User Module**
- [✔️] **Auth Module**
- [✔️] **Recipe Module**
- [✔️] **Logger Module**
- [✔️] **Context Module**
- [✔️] **Comment Module**
- [✔️] **OAuth2 with Google Provider**
- [✔️] **RabbitMQ / Event-Driven Logging**
- [ ] **Role-Based Access Control (RBAC) implementation**
- [ ] **Favorite Recipes**
- [ ] **Search History**
- [ ] **Reports & Moderation**
- [ ] **User follower functionality**

---

## 🧠 Core Modules

#### **Auth Module**
- Handles authentication using **email/password** via Passport local strategy.
- Issues **JWT tokens** for secure session management.
- Includes login and registration endpoints.

#### **OAuth Module**
- Handles authentication using different providers, at the moment just google provider.
- Issues **JWT tokens** after performing the complete flow using the google endpoints.
- Stores different oauth users info related to the loca user, this allows a user to have multiple providers.

#### **User Module**
- Manages user profiles, roles, and privacy settings.
- Provides endpoints to retrieve and update user data.
- Supports nested structures such as social networks and addresses.

#### **Recipe Module**
- Central module of the platform.
- Allows users to **create, update, delete, and explore recipes**.
- Each recipe includes ingredients, steps, categories, tags, and privacy configuration.
- Implements pagination, filtering, and query-based search.
- Supports population of author data using Mongoose virtuals.

#### **Comments Module**
- Manages the interaction between users and recipes through **comments and ratings**.
- Allows users to **post, update, and delete comments** on public or authorized recipes.
- Each comment stores the **author reference**, **recipe reference**, and **timestamp**.
- Designed to integrate seamlessly with the **Recipe Module** for displaying community feedback.
- In future updates, moderation and report features will be implemented.

---

## 🧰 Common Modules

#### **RabbitMQModule**
- Wraps `amqp-connection-manager` and `amqplib` to provide a reusable RabbitMQ integration.
- Manages a single connection with automatic reconnection and heartbeat monitoring.
- Exposes a dedicated publisher channel with timeout handling and message confirmation.
- Provides `createConsumerChannel()` for consumers to declare their own queues, exchanges, and bindings.
- Designed as a generic infrastructure module, reusable across any feature that needs asynchronous messaging.

#### **Logger Module**
- Custom logging service that publishes log entries as **RabbitMQ messages** instead of writing directly to the database.
- Captures details such as HTTP method, request path, user info, and stack traces.
- Supports multiple log levels (log, error, warn, debug, verbose).
- Falls back to `stdout` if RabbitMQ is temporarily unavailable.

#### **LogConsumerModule**
- Consumes log messages from RabbitMQ and persists them to **PostgreSQL**.
- Declares its own queue topology: a `direct` exchange (`logs.exchange`) bound to a durable queue (`logs.queue`) via routing key `logs.routing`.
- Uses manual message acknowledgements (`ack`/`nack`) to ensure no log entries are lost on failure.
- Implements prefetch limiting to avoid overwhelming the database under high throughput.

#### **Context Module**
- Uses **asynchronous local storage** to maintain contextual information per request.
- Passes request metadata automatically to the Logger module for enhanced observability.
- Metadata includes protocol, host, route, HTTP method, authenticated user, and more.

---

## 📡 Event-Driven Logging Architecture

The logging system follows a **producer-consumer** pattern over RabbitMQ, completely decoupling the request lifecycle from log persistence.

### Data Flow

1. **Producer** — The `LoggerService` (injected as `AppLogger`) acts as a producer. Whenever a controller, service, or middleware calls a log method, the service enriches the entry with request context from `RequestContextService` and publishes the payload to the `logs.exchange` exchange with routing key `logs.routing`.
2. **Exchange & Queue** — The exchange is of type `direct` and is declared as durable. A durable queue `logs.queue` is bound to it, ensuring messages survive broker restarts.
3. **Consumer** — The `LogConsumer` runs in its own channel, consumes messages from `logs.queue`, deserializes each `ILogMessage`, and inserts it into PostgreSQL via `PostgresLogRepository`.
4. **Acknowledgment** — After a successful insert, the consumer sends an `ack`. If processing fails, it sends a `nack` (without requeue) to discard the malformed message. This guarantees at-least-once delivery semantics for successfully processed messages.

### RabbitMQ Integration Details

- **Connection Management** — A single `AmqpConnectionManager` instance is created at application startup using the `amqp-connection-manager` library. Connection parameters (host, port, credentials, vhost) are resolved from environment variables.
- **Automatic Reconnection** — The connection is configured with a 5-second reconnect interval and up to 10 heartbeat intervals. The library transparently re-establishes the TCP connection and recreates channels when the broker becomes available again after a failure.
- **Publisher Channel** — A dedicated `ChannelWrapper` is created for publishing. Messages are serialized as JSON and published with the `persistent: true` flag. Each publish operation has a 5-second timeout; if the broker does not confirm the message within that window, the operation rejects with an error.
- **Consumer Channel** — Consumers create their own channels via `createConsumerChannel()`, which accepts a setup callback. This callback runs every time the channel is created (including after reconnection), ensuring queue topology is always declared.
- **Queue Topology** — The log consumer asserts a durable `direct` exchange (`logs.exchange`), a durable queue (`logs.queue`), and binds them with the routing key `logs.routing`. Durable exchanges and queues survive broker restarts.
- **Prefetch** — The consumer sets a prefetch count of 10, limiting the number of unacknowledged messages delivered to the consumer at any time. This prevents unbounded memory growth and provides back-pressure.
- **Message Acknowledgements** — The consumer uses `noAck: false` and manually calls `ch.ack(msg)` on success. On processing failure, `ch.nack(msg, false, false)` is called to discard the message (no requeue), preventing poison messages from cycling indefinitely.
- **Persistent Messages** — All published messages carry the `persistent: true` option, instructing RabbitMQ to write them to disk. This ensures messages are not lost during broker crashes.
- **Failure Handling** — If `LoggerService.publish()` fails (broker unavailable, timeout), the error is caught and logged to `stdout` as a fallback. The consumer gracefully handles `null` messages, database errors, and nack failures without crashing.

### Decoupling Benefits

- **Request lifecycle isolation** — HTTP responses are never blocked by database write latency. Log publication is asynchronous and fire-and-forget.
- **Resilience** — If PostgreSQL is down, the consumer pauses without affecting API availability. Logs accumulate in the queue and are drained once the database recovers.
- **Scalability** — Multiple consumer instances can be deployed to process logs in parallel. The prefetch setting prevents any single consumer from buffering too many in-flight messages.
- **Maintainability** — The producer only knows about the exchange and routing key; it has no direct dependency on PostgreSQL, the schema, or the repository implementation. The consumer owns all persistence concerns.

---

## 🔄 Scalability & Future Async Workflows

The RabbitMQ integration was designed as a **reusable, modular infrastructure layer** (`RabbitMQModule`). Although currently used exclusively for event-driven logging, the same publish and consumer channel APIs can support any asynchronous workflow:

- **Notifications** — Push notifications or in-app alerts for comments, follows, or recipe interactions.
- **Emails** — Offload email sending (welcome emails, password resets, digests) to background consumers.
- **Background Jobs** — Image processing, recipe import/export, data aggregation tasks.
- **Analytics Pipelines** — Collect and forward usage metrics, page views, or search trends to a dedicated analytics queue.
- **Audit Events** — Capture sensitive operations (profile changes, recipe deletions) in an immutable audit log.

Each new workflow follows the same pattern: define an exchange/queue topology in a dedicated consumer module, use `RabbitMQService.publish()` from the producing side, and implement a consumer that processes messages asynchronously. The `RabbitMQModule` handles connection lifecycle, reconnection, and channel management transparently.

---

## 🗃️ Databases

The API uses a **dual-database approach** for optimal separation of concerns:

| Database | Purpose | Technology |
|-----------|----------|------------|
| **MongoDB** | Stores domain entities such as users, recipes, and comments. | Mongoose ODM |
| **PostgreSQL** | Dedicated to structured logging and analytics data. | PG |

This setup allows **high performance** for document-heavy data (recipes, comments) and **strong consistency** for logs and operational metrics.

---

## 📦 Entities Overview

### 👤 User
```json
{
  "_id": "ObjectId",
  "email": "string",
  "username": "string",
  "password": "string",
  "role": "string",
  "privacy": "public | private",
  "profile": {
    "firstname": "string",
    "lastname": "string",
    "biography": "string",
    "avatar": "string",
    "birthDate": "Date",
    "socialNetworks": {
      "instagram": "string",
      "youtube": "string",
      "x": "string",
      "facebook": "string"
    },
    "address": {
      "country": "string"
    }
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 👤 OAuthAccount
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "provider": "google | github | microsoft",
  "providerId": "string",
  "email": "string",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 👤 Recipes
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "title": "string",
  "description": "string",
  "ingredients": [
    {
      "name": "string",
      "quantity": "string",
      "unit": "kg | gr | onz | pound..."
    }
  ],
  "steps": [
    {
      "order": "number",
      "instruction": "string"
    }
  ],
  "prepTime": "number",
  "portions": "number",
  "category": "string",
  "images": ["string"],
  "tags": ["string"],
  "privacy": "public | private",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 👤 Comments
```json
{
  "_id": "ObjectId",
  "recipeId": "ObjectId",
  "userId": "ObjectId",
  "text": "string",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## ⚙️ Environment Variables

Before running the application, create a `.env` file in the root directory with the following variables:

```env
# App Configuration
APP_PORT=5000

# MongoDB Configuration
# (Used for the main application data — recipes, users, comments, etc.)
MONGO_USER=recipeUser
MONGO_PASSWORD=recipePass
MONGO_PORT=27017
MONGO_HOST=localhost
MONGO_DATABASE=recipeDB

# PostgreSQL Configuration
# (Used for logging and application context metadata)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=neto
POSTGRES_PASSWORD=neto
POSTGRES_DB=recipe_logs_db

# RabbitMQ Configuration
# (Used for event-driven logging and async messaging)
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_PROTOCOL=amqp
RABBITMQ_VHOST=/

# JWT Configuration
JWT_SECRET=EXC'89&&55jkl' (This is just for testing, on production environments this secret must be different)

# Rate Limiting
RATE_LIMIT_TTL=60000
RATE_LIMIT_LIMIT=100

# Config variables for OAuth Google Provider
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
GOOGLE_AUTH_URL=
GOOGLE_TOKEN_URL=
GOOGLE_USER_INFO_URL=
GOOGLE_SCOPE=
```

---

## ⚙️ Installation & Running Locally

### 1. Clone the repository
```bash
git clone https://github.com/ernesto-1998/recipe-sharing-nestapp.git
cd recipe-sharing-nestapp
```

### 2. Start the containers
#### The project includes a docker-compose.yml file to spin up the required databases.
```bash
docker-compose up -d
```

### 3. Install dependencies
```bash
npm install
```

### 4. Start the development server
```bash
npm run start:dev
```

### 5. Access the Swagger documentation
```bash
http://localhost:{APP_PORT}/api
```

---

## 🧰 Tech Stack

| **Category** | **Technologies** |
|---------------|------------------|
| **Language** | TypeScript |
| **Framework** | NestJS |
| **Databases** | MongoDB, PostgreSQL |
| **Message Broker** | RabbitMQ |
| **Authentication** | JWT, Local Strategy, OAuth Google Provider |
| **Containerization** | Docker, Docker Compose |
| **ORM/ODM** | Mongoose |
| **Documentation** | Swagger |
| **Logging** | Event-driven via RabbitMQ + PostgreSQL |
| **Platform** | Node.js |
| **Future Enhancements** | Favorites, Ratings |

---

## 🧪 Testing

### Unit Tests

The project includes comprehensive unit tests for the messaging and logging infrastructure:

- **RabbitMQService** — Verifies connection URL construction, event listener registration, publisher channel creation, graceful shutdown, publish confirmation, and timeout behavior.
- **LoggerService** — Validates that each log level publishes a correctly structured message to the expected exchange and routing key, includes request context when available, and falls back to `stdout` when the broker is unreachable.
- **LogConsumer** — Tests the full consume cycle: exchange/queue declaration, message parsing, PostgreSQL insertion, `ack` on success, `nack` on processing errors, and graceful handling of `null` messages and nack failures.
- **PostgresLogRepository** — Ensures correct SQL generation, parameter binding, and error propagation.

### Mocking Strategy

All RabbitMQ tests use `amqp-connection-manager` as a mocked dependency. `connect`, `createChannel`, `publish`, `ack`, `nack`, and channel setup callbacks are replaced with `jest.fn()` implementations, allowing the test suite to run without a live RabbitMQ broker. This approach keeps tests fast, deterministic, and suitable for CI environments.

### Resilience & Error Handling

Tests cover edge cases such as broker disconnection, publish timeouts, message confirmation failures, database write errors, consumer initialization failures, and graceful shutdown scenarios.

---

## 🧑‍💻 Author

**Ernesto Magaña**  
Software Engineer | Node.js & NestJS Developer  
🔗 [GitHub Profile](https://github.com/ernesto-1998)

---

## 📄 License

This project is licensed under the **MIT License**.

---






