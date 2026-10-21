# agent-skills-registry

A full-stack web application for uploading, managing, versioning, and sharing AI agent skill files written in Markdown.

---

## Overview

AI agents often rely on markdown skill files that include:

- Frontmatter metadata (name, description, allowed tools)
- Instructional content for task execution

The **Agent Skills Registry** provides a centralized place to:

- Upload and manage skill files
- Automatically parse and surface metadata
- Organize skills using tags
- Share skills publicly or keep them private
- Explore, clone, and download public skills from other users

The focus of this project is clean system design, correctness, and extensibility.

---

## Features

- User authentication (username & password)
- Upload Markdown skill files (private by default)
- Automatic parsing of frontmatter metadata
- Edit and delete skills
- Tagging system for organization
- View personal skill library
- View metadata of each skill
- Make skills public or private
- Browse and search public skills by name and tags
- Download public skill files
- Clone public skill files down to private library
- See edit versions
- See differences between different versions choosable from dropdown
- GitHub-style diffchecker line-level and word-level
- Rollback to a chosen version
- Card-based vs row-based skill display

---

## Architecture

- Single Page Application (SPA)
- RESTful backend API
- Stateless JWT authentication
- Relational SQL database

---

## Tech Stack

### Frontend

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4

### Backend

- C# .NET 8 (LTS)
- ASP.NET Core Web API
- Entity Framework Core

### Database

- SQLite

---

## Security

- Passwords hashed using PBKDF2 with per-user salts
- Reauthentication on token expiration and token refreshing planned
- Protected routes secured via JWT authentication
- CORS restricted to the dev frontend origin (`http://localhost:5173`)
- Thorough brainstorming and testing to prevent DOS attacks

> **Note:** `appsettings.json` ships a development JWT signing key. Replace it with
> a secret loaded from the environment or user-secrets before deploying anywhere real.

---

## Running the Project Locally

### Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | **20.19+ or 22.12+** | Required by Vite 7. Node 18 will not work. |
| .NET SDK | **8.0+** | Pinned by `global.json` (`rollForward: latestFeature`). |
| Git | any | |

Check what you have:

```bash
node --version
dotnet --list-sdks
```

---

### 1. Clone the repository

```bash
git clone https://github.com/nicked1205/agent-skills-registry.git
cd agent-skills-registry
```

### 2. Run the backend

```bash
cd server
dotnet restore
dotnet run
```

The backend listens on **<http://localhost:5151>**. Navigate to `/swagger` for the
interactive API UI (Development environment only).

On startup the app applies any pending EF Core migrations and creates
`server/app.db` if it does not exist, so there is no separate database setup
step. `app.db` is gitignored, so a fresh clone always starts with an empty
registry.

### 3. Configure the frontend environment

`client/.env.local` is gitignored and **must be created before the first run** —
the client throws `VITE_API_URL is not set` without it.

```bash
cd client
cp .env.example .env.local
```

This sets `VITE_API_URL=http://localhost:5151`. Change it only if you moved the
backend to a different port — and if you do, also update the allowed CORS origin
in `server/Program.cs`.

### 4. Run the frontend

```bash
npm install
npm run dev
```

The frontend is served at **<http://localhost:5173>**.

Both servers need to be running at the same time. Register an account from the UI
to get started — the registry is empty on first run.

---

### Available scripts

From `client/`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build |

---

## Deployment

The backend deploys to **Render** as a Docker container with a persistent disk for
the SQLite file; the frontend deploys to **Vercel** as a static SPA.

All environment-specific settings (database location, CORS origins, JWT secret,
API base URL) are read from configuration rather than hardcoded, so no code
changes are needed to deploy.

> **Note:** keeping SQLite data across redeploys requires a Render **paid**
> instance type — disks are not available on the free plan, where the filesystem
> is ephemeral and the registry would reset on every restart.

**Full walkthrough:** [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## API Reference

All routes are served from the backend root — there is no `/api` prefix.

### `/auth`

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | — | Create an account (username 3–100 chars, password 8+ chars) |
| `POST` | `/auth/login` | — | Exchange credentials for a JWT |
| `GET` | `/auth/me` | JWT | Current user |

### `/skills`

**Every `/skills` route requires a JWT**, including browsing public skills — you
must register and log in before any of them return data. Unauthenticated requests
return `401`.

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/skills` | Upload a new skill |
| `GET` | `/skills` | Browse/search public skills |
| `GET` | `/skills/mine` | Your private library |
| `GET` | `/skills/{id}` | Skill detail |
| `DELETE` | `/skills/{id}` | Delete a skill |
| `PATCH` | `/skills/{id}/visibility` | Toggle public/private |
| `GET` | `/skills/{id}/versions` | Version history |
| `POST` | `/skills/{id}/versions` | Save a new version |
| `GET` | `/skills/{id}/diff` | Diff two versions |
| `POST` | `/skills/{id}/rollback` | Roll back to a version |
| `GET` | `/skills/{id}/tags` | Tags on a skill |
| `POST` | `/skills/{id}/tags` | Add a tag |
| `DELETE` | `/skills/{id}/tags/{tagId}` | Remove a tag |
| `GET` | `/skills/tags` | All tags |
| `GET` | `/skills/tags/used` | Tags currently in use |
| `POST` | `/skills/{id}/clone` | Clone a public skill |
| `GET` | `/skills/{id}/download` | Download the `.md` file |

---

## Troubleshooting

### `VITE_API_URL is not set`

`client/.env.local` is missing. See step 3 above:

```bash
cd client
cp .env.example .env.local
```

### `EPERM: operation not permitted, rename '...deps_temp_xxxxxxxx' -> '...deps'`

Vite's dependency cache was left in a broken state by an interrupted run. Despite
the name, this is **not** a permissions problem. Clear the cache:

```bash
rm -rf client/node_modules/.vite
```

### `Cannot find global type 'Boolean'` / `File '...lib.dom.d.ts' not found`

`node_modules` is incomplete — usually an `npm install` that was cancelled or lost
its connection partway through, leaving the `typescript` package missing some of
its bundled `lib.*.d.ts` files. Reinstall from the lockfile:

```bash
cd client
rm -rf node_modules
npm ci
```

### `warn: Failed to determine the https port for redirect`

Harmless. The default `http` launch profile exposes no HTTPS port, so
`UseHttpsRedirection` has nothing to redirect to. Use
`dotnet run --launch-profile https` if you want HTTPS locally.

### All `/skills` requests return `401`

Expected when unauthenticated — every `/skills` route is behind `[Authorize]`.
Register and log in first, then send `Authorization: Bearer {token}`.

### Browser requests fail with a CORS error

The backend only allows `http://localhost:5173`. If Vite started on a different
port (because 5173 was taken), either free 5173 or add your origin to the
`AllowFrontend` policy in `server/Program.cs`.

---

## Project Structure

```text
server/                 ASP.NET Core Web API
  controllers/          Auth and Skills endpoints
  services/             Frontmatter parsing, diffing, hashing, validation
  models/ dtos/ data/   EF Core entities, DTOs, DbContext
  Migrations/           EF Core migrations (applied on startup)
client/
  src/api/              Typed fetch wrappers
  src/pages/            Route-level views
  src/components/       dashboard/, skill-details/, ui/
  src/types/ utils/     Shared types and helpers
```

---

## Testing & Quality

- API tested through realistic user workflows
- UI tested against edge cases (long names, tag limits, version rollback)
- Any validations are done in both client-side and server-side
- Code structured for maintainability and future extensibility

The project includes a focused testing document describing how input-driven edge cases and UI behavior were validated, including:

- Extreme and malformed user inputs (long names, gibberish, tag limits)
- Layout and responsiveness under constrained viewports
- Scroll containment and overflow behavior
- Versioning, diff rendering, and download correctness

**Read more:** [TESTING.md](./TESTING.md)

---

## Future Improvements

- Bulk deletion
- Skill ratings and comments
- Project folders
- Workspace for team or organizations
- Full-text search across skill content
- Dependency graphs between skills
- Public browsing without authentication
- Helper chatbot?

---

## Design Decisions & Justifications

This project includes a detailed design justification document covering:

- Architectural choices (SPA, stateless backend)
- Authentication and JWT design
- Security decisions and trade-offs
- API design and DTO usage
- UX and responsiveness constraints
- Framework and dependency selection
  and more...

**Read the full document:** [DESIGN.md](./DESIGN.md)
