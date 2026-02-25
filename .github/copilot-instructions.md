<!-- Purpose: concise, actionable guidance for AI coding agents working on this repo -->
# Copilot instructions — Clicks (concise)

Purpose: Quickly orient an AI coding agent to this Next.js + MongoDB app so it can make safe, correct edits.

Big picture
- App uses Next.js App Router (the `app/` directory) for UI and server components.
- HTTP/API handlers are under the top-level `api/` folder — each endpoint exports a `route.ts` handler (e.g. `api/post/route.ts`).
- Auth is centralized in `lib/auth.ts` using `better-auth` + `better-auth/adapters/mongodb` and `Resend` for emails.
- Persistent data: MongoDB via Mongoose (models in `models/*.model.ts`) and a reusable `connectDB()` in `lib/db.ts` that implements a global cache to avoid repeated connections in dev.

Key files and where to look
- App entry & routes: [app/layout.tsx](app/layout.tsx) and pages under [app/](app/)
- API handlers: [api/](api/) — look for `route.ts` in each resource folder
- Auth flow: [lib/auth.ts](lib/auth.ts) (email templates: `components/emails/*`)
- DB connection helper: [lib/db.ts](lib/db.ts)
- Data models: [models/](models/) (Mongoose schemas)
- UI primitives: [components/ui/](components/ui/) and feature components in [components/](components/)
- Top-level scripts and deps: [package.json](package.json)

Dev workflows (extracted from repo)
- Start dev server: `npm run dev` (scripts in `package.json` run `next dev`).
- Build: `npm run build` → `next build`; Start prod server: `npm run start`.
- Lint: `npm run lint` (uses ESLint). No test scripts were found.

Required / important env variables (observed)
- `MONGODB_URI` — used by `lib/db.ts` and by Mongo clients throughout.
- `RESEND_API_KEY` — used by `lib/auth.ts` to send verification and reset emails.

Project-specific patterns and conventions
- Always call `connectDB()` (from `lib/db.ts`) before running Mongoose model operations in server handlers or hooks. `lib/db.ts` uses a global cache to prevent reconnect storms in Next.js dev hot reloads.
- Auth is handled by `better-auth` in `lib/auth.ts`. Database hooks there also create/delete corresponding Mongoose `User` documents — changes to auth must consider both `better-auth` storage and Mongoose models.
- Email templates are React components under `components/emails/*` and are passed directly to Resend as `react:` content in `lib/auth.ts`.
- API handlers follow the `route.ts` convention (request -> connectDB() if needed -> model operations -> response).
- UI components follow the shadcn/radix styled pattern inside `components/ui/` — reuse these primitives for consistent styling.

Integration points to be careful with
- `better-auth` + `mongodbAdapter` (see `lib/auth.ts`) — adapter expects a MongoDB `db` from `mongodb` client; do not replace with Mongoose `connection.db` without adjusting adapters.
- `resend.emails.send({... react: <Component/> })` — email templates are server components; keep imports server-side-only (avoid leaking to client bundles).

Small examples (how to make common edits)
- Add an API route: create `api/<name>/route.ts` and export the proper handler; if using Mongoose call `await connectDB()` before model usage.
- Update auth behavior: edit `lib/auth.ts` — email sending and DB hooks live here; user creation also creates a Mongoose `User` in the `databaseHooks.user.create.after` hook.

Quick gotchas
- DB connection code throws if `MONGODB_URI` is missing — ensure envs are present for local dev and CI.
- There are two Mongo clients in use: `mongodb` client (used by `better-auth` adapter) and `mongoose` (used by models). Respect which API each integration expects.

When unsure where to change something
- Search for the feature name across `api/`, `lib/`, `components/`, and `models/`. Authentication and emails: start at `lib/auth.ts` and `components/emails/`.

If you edit this file: keep it short. If you add new infra (e.g., Redis, a new provider), add a one-line note here with the integration file paths.

Questions for maintainers: If any behavior for auth, emails, or DB differs from these notes, tell me the divergence and I will update this guidance.
