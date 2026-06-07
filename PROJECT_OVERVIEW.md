# Project Overview & End‑to‑End Pipeline (without exposing any secrets)

## 1. Repository & Source Control

| Item | Description |
|------|-------------|
| **Repo URL** | `git@github.com:brightonale/bras-website.git` (private) |
| **Main branch** | `main` – production code. Feature work is done on short‑lived branches and merged via PRs. |
| **Git workflow** | 1. `git checkout -b feature/<name>` 2. Commit + push 3. Open PR → CI runs → merge → auto‑deploy. |
| **Git hooks** | Pre‑commit runs `eslint` and `prettier` for code quality. |

## 2. Tech Stack

| Layer | Technology | Reason |
|-------|------------|--------|
| **Frontend** | Next.js (React) – uses the `/src/app` directory for app router pages. | Server‑side rendering + API routes. |
| **Styling** | Vanilla CSS with a design system defined in `globals.css`. | Full control over colors, spacing, glass‑morphism effects. |
| **ORM / DB** | Prisma Client (v5) + Supabase PostgreSQL. | Type‑safe DB access and migrations. |
| **Database** | Supabase Postgres (shared pooler, session‑mode for migrations). |
| **CI/CD** | Vercel (auto‑detects Next.js) + GitHub Actions for lint & unit tests. |
| **Secrets management** | `.env.local` (local dev) + Vercel / Supabase environment variables (production). |

## 3. Local Development Setup

1. **Clone the repo**  
   ```bash
   git clone git@github.com:brightonale/bras-website.git
   cd bras-website
   ```

2. **Install dependencies**  
   ```bash
   npm ci               # exact versions from lockfile
   ```

3. **Configure environment variables** – create a file called **`.env.local`** in the project root (this file is **git‑ignored**).  
   ```dotenv
   # Connection strings (replace placeholders with real values)
   DATABASE_URL="postgresql://postgres.<PROJECT_ID>:<DB_PASSWORD>@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL  ="postgresql://postgres.<PROJECT_ID>:<DB_PASSWORD>@aws-1-eu-central-1.pooler.supabase.com:5432/postgres"
   ```
   *`<PROJECT_ID>`* is the Supabase project identifier (e.g. `vejsvmzglvlhwoniszqy`).  
   *`<DB_PASSWORD>`* is the **Postgres password** you receive from Supabase (never commit it).

4. **Initialize Prisma** (only the first time)  
   ```bash
   npx prisma init      # creates prisma/schema.prisma & .env (ignore .env, use .env.local)
   ```

5. **Run migrations** (if any)  
   ```bash
   npx prisma migrate dev   # uses DIRECT_URL for safe migrations
   ```

6. **Start the dev server**  
   ```bash
   npm run dev
   # → http://localhost:3000
   ```

## 4. Database Schema (Prisma)

File: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id          String   @id @default(uuid())
  email       String   @unique
  password    String
  mustChange  Boolean  @default(false)
  // … other fields (e.g., name, createdAt)
}
```

*All tables are defined here. After editing the schema run `npx prisma generate` to refresh the client.*

## 5. Core Application Pages (Next.js)

| Path | Purpose | Key Implementation Details |
|------|---------|----------------------------|
| `src/app/globals.css` | Global design tokens (colors, spacing, border‑radius). | Updated to use British English terminology, tighter spacing, sharp corners, glass‑morphism background. |
| `src/app/leaderboard/page.tsx` | Dynamic leaderboard fetched from Supabase. | Uses `PrismaClient` with `dynamic = 'force-dynamic'` to always query the DB at request time. |
| `src/app/history/page.tsx` | Chronological timeline of Instagram‑style posts. | Re‑implemented as a top‑down formal timeline; each entry is a placeholder `<img>` that will later be replaced with real photos. |
| `src/app/wordle/page.tsx` | Game UI (example component). | Spelling changes from *flavor* → *flavour*; styling aligned with the design system. |
| API routes (`src/pages/api/...`) | Backend endpoints for auth, password reset, etc. | Securely read `process.env.DATABASE_URL` and interact with Prisma. |

## 6. Secrets & Password Management

| Secret | Where it lives | How to rotate |
|--------|----------------|---------------|
| **Postgres password** (`<DB_PASSWORD>`) | Supabase Dashboard → *Settings → Database → Connection pooler*; also stored as `DATABASE_URL` & `DIRECT_URL` in Vercel env vars. | Generate a new password in Supabase → update `.env.local` (local) and the Vercel env variables → redeploy. |
| **JWT secret / API keys** | Vercel → *Project Settings → Environment Variables* (`NEXT_PUBLIC_JWT_SECRET`, etc.). | Same process – generate a new secret, replace the env var, trigger a redeploy. |
| **User passwords** (in the `User` table) | Stored as bcrypt hashes in the DB. The raw password is **not** stored anywhere. | To force a password reset for all users, run a one‑off SQL statement (see Section 7). |

> **Important:** Never commit any real passwords to the repo. Use environment variables or Vercel’s secret manager.  

## 7. Resetting All User Passwords (one‑time admin operation)

The team previously used an ad‑hoc SQL command to set a default password and require a change on next login:

```sql
UPDATE "User"
SET "password" = crypt('BrasCommittee2026!', gen_salt('bf')),
    "mustChange" = true;
```

*Explanation*  

* `crypt(..., gen_salt('bf'))` hashes the plain‑text password with bcrypt.  
* `mustChange = true` forces the UI to show a “reset your password” screen on next login.

**How to run it**

1. Open the Supabase dashboard → *SQL Editor*.  
2. Paste the command above (replace the placeholder password with a freshly generated strong password).  
3. Execute.  
4. All users will now log in with that temporary password and be prompted to set a new personal password.

> **Never** expose the actual password value in source code or documentation. Store the temporary password only in a secure internal note (e.g., a password manager) and delete it after the reset is complete.

## 8. CI / CD Pipeline

1. **Push → Vercel**  
   - Vercel automatically pulls the latest commit on `main`.  
   - Runs `npm ci` → `npm run build`.  
   - If the build succeeds, Vercel starts a new deployment and provides a preview URL.

2. **GitHub Actions (optional)**
   - Lint (`eslint`) and format (`prettier`) checks.  
   - Run unit tests (`npm test`).  
   - On success, the workflow can optionally tag a release.

3. **Environment propagation**  
   - Vercel reads the same environment variables you set in the dashboard (`DATABASE_URL`, `NEXT_PUBLIC_JWT_SECRET`, etc.).  
   - No secrets are ever written to the repo.

## 9. Typical Development Workflow (new engineer)

1. **Clone & install** (steps 1‑2 in Section 3).  
2. **Create a feature branch**: `git checkout -b feature/awesome‑thing`.  
3. **Implement** – modify components, add Prisma queries, adjust CSS.  
4. **Run locally**: `npm run dev`. Verify UI & DB interactions.  
5. **Write tests** (if applicable).  
6. **Commit**:  
   ```bash
   git add .
   git commit -m "feat: description of change"
   ```
7. **Push & PR**: `git push origin feature/awesome‑thing`.  
8. **Code Review** – teammates review, CI runs automatically.  
9. **Merge** – after approval, merge into `main`. Vercel deploys automatically.

## 10. Maintenance & Monitoring

| Area | Tool | What to watch |
|------|------|---------------|
| **Database health** | Supabase dashboard (CPU, connections) | Pooler limits, slow queries. |
| **App logs** | Vercel “Logs” view | Runtime errors, failed Prisma queries. |
| **Performance** | Lighthouse (Chrome) on deployed URLs | TTFB, CLS, LCP – ensure the new formal UI remains fast. |
| **Security** | Supabase audit logs | Unusual admin actions (e.g., mass password resets). |
| **Dependencies** | `npm outdated` | Keep Prisma & Next.js up‑to‑date; run `npm audit` periodically. |

## 11. Where to Find the “Passwords”

| Secret | Location (non‑secret) |
|--------|----------------------|
| **Postgres connection password** | Supabase Dashboard → *Settings → Database → Connection pooler*. |
| **Temporary user reset password** | Generated on‑the‑fly by the engineer performing the reset (store in a password manager, destroy after use). |
| **JWT / API keys** | Vercel Project Settings → *Environment Variables*. |
| **Prisma client secret** | Not applicable – Prisma uses the DB connection string only. |

**Never** write these values into source files, documentation, or commit history.

---

### TL;DR for the New Engineer

1. **Clone** → set up `.env.local` with the Supabase connection strings (populate the placeholders with the real password from the Supabase UI).  
2. **Run** `npm ci && npx prisma migrate dev && npm run dev`.  
3. **Edit** UI components in `src/app/*`; styling lives in `globals.css`.  
4. **Commit** → PR → Vercel auto‑deploys.  
5. **When you need to reset all passwords**, run the SQL snippet in Supabase’s SQL editor (replace the placeholder with a freshly generated strong password).  

Feel free to ask if any part of this pipeline needs deeper detail (e.g., how the Prisma client is configured, how to add new env vars in Vercel, or how the leaderboard query works). I’m happy to expand on any section—just let me know!
