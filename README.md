# Task Manager API

A production-style CRUD API for managing tasks and projects, built with real authentication — access + refresh tokens, token revocation, centralized error handling, and schema-validated input on every route. This isn't a toy project; it's built to be defended in a code review.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running the App](#running-the-app)
- [Authentication Flow](#authentication-flow)
- [Error Handling](#error-handling)
- [Validation](#validation)
- [API Reference](#api-reference)
  - [Auth Routes](#auth-routes)
  - [Project Routes](#project-routes)
  - [Task Routes](#task-routes)
- [Pagination](#pagination)
- [Data Models](#data-models)
- [Testing](#testing)
- [Scripts](#scripts)
- [Design Decisions & Key Learnings](#design-decisions--key-learnings)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

Task Manager API lets authenticated users create projects and tasks, and guarantees that users can only ever see and modify their own data. The project is meant to demonstrate patterns that show up constantly in real backend work:

- RESTful resource design (nesting, status codes, idempotency)
- Schema validation with **Zod** instead of trusting `req.body`
- ORM modeling with **Prisma** (migrations, relations, constraints)
- A real JWT flow: **access token + refresh token + logout/blacklist**
- Centralized error-handling middleware — no `try/catch` soup

---

## Features

- 🔐 **Real auth** — registration, login, refresh, and logout with token revocation (not a single JWT that never expires)
- 👤 **Per-user data isolation** — every query is scoped to the authenticated user
- 📁 **Projects & Tasks** — nested resources with proper relations (`User → Project → Task`)
- ✅ **Input validation on every route** via Zod schemas, rejected before hitting business logic
- 📄 **Pagination** on all list endpoints (cursor or offset-based — see below)
- 🧯 **Centralized error handling** — one place that maps errors to consistent JSON responses and status codes
- 🔑 **Password hashing** with bcrypt
- 🗃️ **Migrations** managed through Prisma, not manual SQL
- 🧪 **Integration tests** covering auth flows and access-control edge cases

---

## Tech Stack

| Layer            | Choice                          |
|-------------------|----------------------------------|
| Runtime           | Node.js                         |
| Language          | TypeScript                      |
| Framework         | Express                         |
| Database          | PostgreSQL                      |
| ORM               | Prisma                          |
| Validation        | Zod                             |
| Auth              | JWT (access + refresh), bcrypt  |
| Testing           | Jest + Supertest                |

---

## Architecture

```
Client
  │
  ▼
[ Express App ]
  │
  ├── Middleware: helmet, cors, rate limiter
  ├── Middleware: request logger
  ├── Middleware: auth (verifies access token)
  │
  ├── Router: /api/auth
  ├── Router: /api/projects
  ├── Router: /api/tasks
  │
  ├── Controller → Service → Prisma Client → PostgreSQL
  │
  └── Centralized Error Handler (last middleware in the chain)
```

Each route handler is intentionally thin: validate → call service → return response. Business logic and DB access live in service modules so controllers stay testable and error handling stays consistent.

---

## Project Structure

```
task-manager-api/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── config/
│   │   └── env.ts               # validated environment config
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── project.controller.ts
│   │   └── task.controller.ts
│   ├── middleware/
│   │   ├── authenticate.ts      # verifies access token
│   │   ├── validate.ts          # generic Zod validation middleware
│   │   ├── errorHandler.ts      # centralized error handler
│   │   └── rateLimiter.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── project.routes.ts
│   │   └── task.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── token.service.ts
│   │   ├── project.service.ts
│   │   └── task.service.ts
│   ├── schemas/                 # Zod schemas per resource
│   │   ├── auth.schema.ts
│   │   ├── project.schema.ts
│   │   └── task.schema.ts
│   ├── errors/
│   │   ├── AppError.ts
│   │   ├── NotFoundError.ts
│   │   ├── ValidationError.ts
│   │   └── UnauthorizedError.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   └── pagination.ts
│   ├── app.ts
│   └── server.ts
├── tests/
│   ├── auth.test.ts
│   ├── projects.test.ts
│   └── tasks.test.ts
├── .env.example
├── docker-compose.yml
├── tsconfig.json
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- PostgreSQL ≥ 14 (local install or Docker)
- npm or pnpm

### Installation

```bash
git clone https://github.com/<your-username>/task-manager-api.git
cd task-manager-api
npm install
```

### Environment Variables

Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

```env
# Server
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/task_manager?schema=public"

# JWT
JWT_ACCESS_SECRET=replace-with-a-long-random-string
JWT_REFRESH_SECRET=replace-with-a-different-long-random-string
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Bcrypt
BCRYPT_SALT_ROUNDS=12
```

Environment variables are validated on boot with a Zod schema in `src/config/env.ts` — the app fails fast with a clear error if something required is missing, rather than crashing later with a cryptic `undefined`.

### Database Setup

Spin up Postgres via Docker (optional but recommended):

```bash
docker-compose up -d
```

Run migrations and generate the Prisma client:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Optionally seed the database:

```bash
npx prisma db seed
```

### Running the App

```bash
# Development (hot reload)
npm run dev

# Production build
npm run build
npm start
```

The API will be available at `http://localhost:4000`.

---

## Authentication Flow

This API implements a real access/refresh token pair rather than a single long-lived JWT.

1. **Register** — `POST /api/auth/register` creates a user, hashing the password with bcrypt before storage.
2. **Login** — `POST /api/auth/login` verifies credentials and issues:
   - a short-lived **access token** (e.g. 15 minutes) returned in the response body, used in the `Authorization: Bearer <token>` header for protected routes
   - a longer-lived **refresh token** (e.g. 7 days), stored as an httpOnly cookie and also persisted (hashed) in the database so it can be revoked
3. **Accessing protected routes** — the `authenticate` middleware verifies the access token signature and expiry. If it's expired, the client is expected to hit the refresh endpoint rather than log in again.
4. **Refresh** — `POST /api/auth/refresh` validates the refresh token against the hashed value stored in the DB (and checks it hasn't been revoked), then issues a new access token — and rotates the refresh token, invalidating the old one, so refresh tokens are single-use.
5. **Logout** — `POST /api/auth/logout` revokes the refresh token server-side (deletes/blacklists it in the DB), so it can no longer be used even if the cookie is stolen.

This means:
- A stolen access token is only useful for 15 minutes.
- A stolen refresh token can be revoked immediately on logout, and refresh-token rotation limits reuse.
- Nothing relies on a JWT that's valid forever with no way to kill it.

---

## Error Handling

All errors flow through a single centralized error-handling middleware (`src/middleware/errorHandler.ts`), registered last in the Express chain. Controllers and services never format error responses themselves — they throw typed errors that extend a base `AppError`:

```ts
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
  }
}
```

Examples: `NotFoundError` (404), `ValidationError` (400), `UnauthorizedError` (401), `ForbiddenError` (403), `ConflictError` (409).

The handler distinguishes **operational errors** (expected, safe to show the client — e.g. "task not found") from **programmer errors** (unexpected exceptions, logged internally, client sees a generic 500). Every error response has a consistent shape:

```json
{
  "success": false,
  "error": {
    "message": "Task not found",
    "code": "NOT_FOUND"
  }
}
```

No route handler contains a `try/catch` block — async route handlers are wrapped so thrown errors are automatically forwarded to `next()` and caught by the centralized handler.

---

## Validation

Every route validates `req.body`, `req.params`, and `req.query` against a Zod schema **before** any business logic runs, using a generic `validate` middleware:

```ts
router.post(
  "/projects",
  authenticate,
  validate(createProjectSchema),
  projectController.create
);
```

```ts
export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
  }),
});
```

If validation fails, the middleware throws a `ValidationError` with field-level details — the request never reaches the controller, and `req.body` is never trusted as-is.

---

## API Reference

Base URL: `/api`

All protected routes require:
```
Authorization: Bearer <access_token>
```

### Auth Routes

| Method | Endpoint             | Description                          | Auth required |
|--------|-----------------------|---------------------------------------|----------------|
| POST   | `/auth/register`      | Create a new user                     | No             |
| POST   | `/auth/login`         | Log in, receive access + refresh token| No             |
| POST   | `/auth/refresh`       | Exchange refresh token for new access token | No (uses cookie) |
| POST   | `/auth/logout`        | Revoke refresh token                  | Yes            |

**Example — Register**

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "SecurePass123!",
  "name": "Jane Doe"
}
```

`201 Created`
```json
{
  "success": true,
  "data": {
    "id": "c1a2...",
    "email": "jane@example.com",
    "name": "Jane Doe"
  }
}
```

**Example — Login**

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "SecurePass123!"
}
```

`200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOi...",
    "user": { "id": "c1a2...", "email": "jane@example.com" }
  }
}
```
*(Refresh token is set as an httpOnly cookie, not returned in the body.)*

### Project Routes

| Method | Endpoint            | Description                    | Auth required |
|--------|-----------------------|----------------------------------|----------------|
| GET    | `/projects`           | List current user's projects (paginated) | Yes |
| POST   | `/projects`            | Create a project                 | Yes |
| GET    | `/projects/:id`        | Get a single project (owned by user) | Yes |
| PATCH  | `/projects/:id`        | Update a project                 | Yes |
| DELETE | `/projects/:id`        | Delete a project (cascades tasks) | Yes |

### Task Routes

Tasks are nested under projects to reflect the resource hierarchy, with a flat listing endpoint also available.

| Method | Endpoint                          | Description                          | Auth required |
|--------|-------------------------------------|----------------------------------------|----------------|
| GET    | `/projects/:projectId/tasks`        | List tasks for a project (paginated)  | Yes |
| POST   | `/projects/:projectId/tasks`        | Create a task under a project         | Yes |
| GET    | `/tasks/:id`                        | Get a single task                     | Yes |
| PATCH  | `/tasks/:id`                        | Update a task (e.g. status, title)    | Yes |
| DELETE | `/tasks/:id`                        | Delete a task                         | Yes |
| PATCH  | `/tasks/:id/status`                 | Idempotently set task status          | Yes |

**Example — Create Task**

```http
POST /api/projects/8f3c.../tasks
Authorization: Bearer eyJhbGciOi...
Content-Type: application/json

{
  "title": "Set up CI pipeline",
  "description": "GitHub Actions for lint/test/build",
  "status": "TODO",
  "dueDate": "2026-08-15"
}
```

`201 Created`
```json
{
  "success": true,
  "data": {
    "id": "a91b...",
    "title": "Set up CI pipeline",
    "status": "TODO",
    "projectId": "8f3c...",
    "createdAt": "2026-08-03T10:00:00.000Z"
  }
}
```

**Status codes used consistently:**

| Code | Meaning                                         |
|------|--------------------------------------------------|
| 200  | Successful GET/PATCH                             |
| 201  | Resource created                                 |
| 204  | Successful DELETE (no body)                      |
| 400  | Validation error                                 |
| 401  | Missing/invalid/expired access token             |
| 403  | Authenticated but not the resource owner         |
| 404  | Resource not found (or not owned by user — no leaking existence) |
| 409  | Conflict (e.g. duplicate email on register)      |
| 429  | Rate limit exceeded                              |
| 500  | Unexpected server error                          |

---

## Pagination

All list endpoints accept query parameters and return a consistent envelope:

```
GET /api/projects?page=1&limit=20
```

```json
{
  "success": true,
  "data": [ /* ...items */ ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 57,
    "totalPages": 3
  }
}
```

`page` and `limit` are validated (e.g. `limit` capped at 100) via the same Zod-based query validation used everywhere else, so malformed pagination params return a clean 400 instead of a Prisma error.

---

## Data Models

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  name          String?
  projects      Project[]
  refreshTokens RefreshToken[]
  createdAt     DateTime  @default(now())
}

model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  owner       User     @relation(fields: [ownerId], references: [id])
  ownerId     String
  tasks       Task[]
  createdAt   DateTime @default(now())
}

model Task {
  id          String     @id @default(cuid())
  title       String
  description String?
  status      TaskStatus @default(TODO)
  dueDate     DateTime?
  project     Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId   String
  createdAt   DateTime   @default(now())
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}

model RefreshToken {
  id        String   @id @default(cuid())
  hashedToken String @unique
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  revoked   Boolean  @default(false)
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

---

## Testing

```bash
npm test
```

Test coverage focuses on the parts most likely to break in review:

- Register/login/refresh/logout flows, including expired and reused-refresh-token cases
- Access control — a user cannot read, update, or delete another user's project or task (expect 404, not 403, to avoid leaking existence)
- Validation — malformed payloads return 400 with useful error details
- Pagination edge cases (page 0, limit above max, empty result set)

---

## Scripts

| Script                  | Description                                 |
|--------------------------|----------------------------------------------|
| `npm run dev`             | Start the server with hot reload            |
| `npm run build`           | Compile TypeScript to `dist/`               |
| `npm start`               | Run the compiled production build           |
| `npm test`                | Run the test suite                          |
| `npm run lint`            | Run ESLint                                  |
| `npx prisma migrate dev`  | Create/apply a new migration in development |
| `npx prisma studio`       | Open Prisma's DB browser GUI                |

---

## Design Decisions & Key Learnings

This project was built specifically to practice and demonstrate:

- **RESTful resource design** — nesting tasks under projects where it reflects real hierarchy, flat routes where a resource is addressed directly by ID, correct status codes, and idempotent `PATCH` endpoints (e.g. setting task status to the same value twice is a no-op, not an error).
- **Schema validation with Zod** — `req.body`, `req.params`, and `req.query` are never trusted directly; every route validates against an explicit schema before touching the database.
- **ORM modeling with Prisma** — relations, cascading deletes, and migrations are managed declaratively instead of hand-written SQL, with the schema acting as the single source of truth.
- **A real JWT flow** — short-lived access tokens, long-lived rotating refresh tokens, and server-side revocation on logout, instead of a single token that's valid forever.
- **Centralized error handling** — one error-handling middleware and a small hierarchy of typed errors, so route handlers stay free of `try/catch` blocks and error responses stay consistent across the whole API.

---

## Roadmap

- [ ] Role-based access (e.g. shared projects with collaborators)
- [ ] Rate limiting per user, not just per IP
- [ ] OpenAPI/Swagger spec generated from Zod schemas
- [ ] WebSocket support for real-time task updates
- [ ] Soft deletes with restore endpoint

---

## License

MIT
