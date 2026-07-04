# Project: BRAS Website UI/UX Audit & Optimization

## Architecture
- **Next.js App Router (Next.js 16)**: Frontend pages and components in `src/app` and `src/components`.
- **CSS Design System**: Global tokens and styling rules in `src/app/globals.css`.
- **No Backend/Database Changes**: Do not touch schema, API routes, or server actions.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Visual Consistency & Design System Cleanup | Fix clashing navbar color, update success/warning/error feedback palettes for dark mode, fix `stat-value` visibility, optimize Hall of Fame component colors for dark theme, clean up unused legacy CSS classes (`glass-panel`, `glass-button`, `glass-nav`, etc.), scope button hover outlines properly. | None | DONE |
| 2 | Navigation & Mobile UX | Solve navbar link overflow between 768px-1080px, replace text characters with animated icons for mobile hamburger, add backdrop overlay and smooth slide/fade transitions for mobile drawer, ensure footer always shows brand info. | M1 | PLANNED |
| 3 | Page-Level Polish & Empty States | Replace image placeholders on History page with styled empty states, query database values for homepage stats (`totalPubs`, `totalMembers`, `totalRatings`), polish leaderboard year filter styles, add redirection spinner on rate page, polish loading.tsx beer animation, polish contact page, add fade-in animations to all pages. | M1 | PLANNED |
| 4 | Accessibility & Performance | High-contrast focus states for inputs, proper cursor styles on interactive elements, ARIA labels for hamburger menu, interactive score selector (star rating or slider) on rate page, proper image loading states. | M2, M3 | PLANNED |
| 5 | E2E Testing & Final Verification | Verify the entire app build using `npm run build` and ensure E2E tests pass, commit and push changes to `origin main`. | M4 | PLANNED |

## Interface Contracts
- **No changes to DB, server actions, or API contracts**: We are purely refactoring frontend UI/UX presentation.
- **Navbar props**: Navbar receives `settings` prop, which is a feature toggle configuration.
- **Homepage stats**: homepage component fetches `totalPubs`, `totalMembers`, `totalRatings` - these must be mapped directly to the stats display cards.

## Code Layout
- **Global Styles**: `src/app/globals.css`
- **Navbar Component**: `src/components/Navbar.tsx`
- **Home Page**: `src/app/page.tsx`, `src/app/HomeClient.tsx`
- **History Page**: `src/app/history/page.tsx`
- **Leaderboard**: `src/app/leaderboard/page.tsx`, `src/app/leaderboard/LeaderboardClient.tsx`
- **Rate Page**: `src/app/rate/page.tsx`, `src/app/rate/RateClient.tsx`
- **Loading UI**: `src/app/loading.tsx`
- **Contact Page**: `src/app/contact/page.tsx`
