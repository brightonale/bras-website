# 🍺 Brighton Real Ale Society (BRAS)

> Official digital platform, live pint evaluation system, and archival directory for the Brighton Real Ale Society (Est. 2023).

[![Next.js 16](https://img.shields.io/badge/Next.js-16.2.7-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.4-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22.0-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=flat&logo=postgresql)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Passing-green?style=flat&logo=vitest)](https://vitest.dev/)
[![PWA Ready](https://img.shields.io/badge/PWA-Enabled-orange?style=flat&logo=pwa)](https://github.com/ducanh2912/next-pwa)

---

## 📖 Overview

The **Brighton Real Ale Society (BRAS)** website is a high-performance web application designed to connect real ale enthusiasts across Brighton and Sussex. It powers weekly pub visits, facilitates passwordless live voting during socials, aggregates multi-season pint leaderboards, and preserves the society's rich history and leadership succession.

Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Prisma** backed by **Supabase PostgreSQL**, the platform is optimized for mobile-first in-pub usage with offline PWA support and Supabase Realtime synchronization.

---

## ✨ Key Features

### 🗳️ Live Passwordless Pint Voting (`/rate`)
- **Frictionless Pub Voting**: Anyone attending a social can navigate to `/rate`, type their name, and immediately submit a score (1.00 – 10.00★) for the currently active pint.
- **Smart Account Linking**: Automatically finds or registers voter profiles, remembring returning voters via cookies and local storage.
- **Deduplication**: Re-voting for the same active pint cleanly updates the voter's existing score without creating duplicate entries.

### 🏆 Pint Leaderboard (`/leaderboard`)
- **Multi-Season Rankings**: Filter evaluated cask ales across seasons:
  - **`25/26`**: All 19 rated beers evaluated between September 2025 and September 2026.
  - **`24/25` & `23/24`**: Complete historical archives from previous society years.
  - **`All`**: Unified overall rankings sorted by average member score.
- **Hall of Fame**: Prominently showcases the #1 ranked pint for each season.
- **Public vs. Member Tiers**: Public visitors view the Top 10 rankings; authenticated members unlock the complete database.

### 🏛️ Society History & Leadership Directory (`/history`)
- **Reverse-Chronological Leadership**: Interactive committee directory ordered by succession:
  - **Current Executive (2026–Present)**: Takara (President) & Harrison (Finance Director).
  - **Executive Committee (2025–2026)**: Albie Gullis, Harry, Max.
  - **Committee (2024–2025)**: Sidney.
  - **Founding Committee (2023–2025)**: James Graham (Founding President) & Luke.
- **Interactive Modals**: Biography cards, achievement badges, and leadership era tags.
- **Society Timeline**: Archival record of weekly crawls, brewery collabs, and regional media milestones.

### 🛡️ Committee Administration (`/committee`)
- **Active Pint Broadcaster**: Activate and cycle the current social pub, beer, and brewery in real time.
- **Live Vote Moderation**: View all incoming votes live with voter names, scores, timestamps, and one-click removal for erroneous entries.
- **Role Management**: Promote and configure permissions between `user` (guest voter), `member` (authenticated member), and `committee` (admin).
- **Feature Flags & Gallery Sync**: Toggle visibility of site modules (Wordle, Leaderboard, Checklist, Matrix) on demand.

### 📊 Member Matrix & Profiles (`/matrix` & `/profile/[name]`)
- **Ratings Matrix**: Complete attendance and scoring grid cross-referencing all members against visited pubs.
- **Personalized Member Profiles**: Average rating given, total pubs visited, highest/lowest scores, and complete personal tasting history.

### 🧩 Ale Wordle & Sussex Checklist (`/wordle` & `/checklist`)
- **BRAS Wordle**: Real ale-themed word puzzle with hint systems and streak tracking.
- **Brighton Pub Checklist**: Interactive directory tracking visited vs. unvisited venues across Brighton & Hove.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16.2.7](https://nextjs.org/) | App Router, Server Components, Server Actions & Route Handlers |
| **UI Library** | [React 19.2.4](https://react.dev/) | Component architecture, Concurrent React features |
| **Language** | [TypeScript 5.x](https://www.typescriptlang.org/) | Strict type safety across frontend and API layers |
| **Database** | [PostgreSQL (Supabase)](https://supabase.com/) | Cloud database with connection pooling (PgBouncer) |
| **ORM** | [Prisma 5.22.0](https://www.prisma.io/) | Type-safe database queries, schema management & migrations |
| **Animations** | [Framer Motion 12](https://www.framer.com/motion/) | Smooth UI transitions, liquid pint animations & modal spring physics |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, accessible SVG iconography |
| **Testing** | [Vitest 4](https://vitest.dev/) | Unit test runner with Prisma and Next.js mocking |
| **Offline / PWA** | [@ducanh2912/next-pwa](https://github.com/ducanh2912/next-pwa) | Service worker caching and installable web app capabilities |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or `v22.x`+
- **npm** or **pnpm**
- **Git**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/brightonale/bras-website.git
   cd bras-website
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the project root:
   ```env
   # Database connection pooler (for server queries)
   DATABASE_URL="postgresql://postgres.<PROJECT_REF>:<PASSWORD>@<HOST>:6543/postgres?pgbouncer=true"

   # Direct database connection (for migrations and schema push)
   DIRECT_URL="postgresql://postgres.<PROJECT_REF>:<PASSWORD>@<HOST>:5432/postgres"

   # Supabase client credentials (for Realtime listeners)
   NEXT_PUBLIC_SUPABASE_URL="https://<PROJECT_REF>.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="<YOUR_SUPABASE_ANON_KEY>"
   ```

4. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

5. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server on `localhost:3000` |
| `npm run build` | Compiles the production build with TypeScript check and PWA assets |
| `npm run start` | Runs the compiled production server |
| `npm run lint` | Runs ESLint across the codebase |
| `npx vitest run` | Executes the Vitest unit test suite |
| `npm run sync-gallery` | Synchronizes local gallery assets with database records |
| `npm run sort-whatsapp` | Utility script to parse and organize social chat media |

---

## 🔒 User Roles & Access Control

The platform enforces 3 hierarchical permission tiers:

| Role | Permissions | Access Scope |
| :--- | :--- | :--- |
| **`user`** | Cast votes on `/rate`, view public leaderboard (Top 10), view public history and home. | Public / Guest |
| **`member`** | Full pint leaderboard, complete Member Matrix (`/matrix`), personal member profile, BRAS Wordle. | Verified Members |
| **`committee`** | All member access + `/committee` administrative suite, live vote moderation, active pint broadcasting, role configuration. | Executive Officers |

---

## 📁 Project Structure

```text
bras-website/
├── public/                  # Static assets, logos, and PWA manifest / sw
├── src/
│   ├── app/                 # Next.js App Router (pages and API endpoints)
│   │   ├── api/             # REST API routes (rate, active-pint, committee/*)
│   │   ├── checklist/       # Brighton pub checklist page
│   │   ├── committee/       # Executive admin dashboard
│   │   ├── history/         # Society timeline & committee succession
│   │   ├── leaderboard/     # Pint leaderboard with multi-season filtering
│   │   ├── login/           # Member & committee authentication
│   │   ├── matrix/          # Privacy-gated member rating matrix
│   │   ├── profile/[name]/  # Dynamic member profile pages
│   │   ├── rate/            # Passwordless live pint voting flow
│   │   ├── wordle/          # Real ale Wordle game
│   │   ├── actions.ts       # Server actions (login, logout, session management)
│   │   ├── globals.css      # Design tokens, variables, and responsive classes
│   │   └── page.tsx         # Homepage with latest social card and hero
│   ├── components/          # Reusable UI components (Navbar, Footer, CommitteeGrid)
│   ├── data/                # Fallback datasets and JSON archives
│   └── lib/                 # Prisma DB instance and shared helpers
├── prisma/
│   ├── schema.prisma        # Prisma data models (User, Social, Rating, Pub, etc.)
│   └── dev.db.og.backup     # Preserved original archive backup
├── tests/                   # Automated Vitest test suites
├── package.json             # Scripts and dependencies
└── tsconfig.json            # TypeScript configuration
```

---

## 🍻 Society Heritage

Established in **October 2023** in Brighton, East Sussex, the **Brighton Real Ale Society** is dedicated to appreciating, recording, and celebrating British cask-conditioned ale across local and regional breweries.

- **Website**: [brightonale.co.uk](https://www.brightonale.co.uk/)
- **Repository**: [github.com/brightonale/bras-website](https://github.com/brightonale/bras-website)
- **License**: Private / Proprietary to Brighton Real Ale Society.

