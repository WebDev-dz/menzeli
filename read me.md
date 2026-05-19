# Menzeli

Production-grade real estate web app built with Next.js App Router, TypeScript, and a generated OpenAPI client.

## Tech Stack

- Next.js (App Router) `16.1.6`
- React `19.2.3`
- TypeScript (strict) `^5`
- Tailwind CSS `^4` (+ tailwind-merge `^3.5.0`, class-variance-authority `^0.7.1`)
- React Query (@tanstack/react-query) `^5.90.21`
- i18next `^25.8.14` + react-i18next `^16.5.4` + next-i18n-router `^5.5.6` (localization)
- OpenAPI Generator client (generated into `/api/*`, generator-cli `7.20.0`)
- UI primitives: radix-ui `^1.4.3`, @base-ui/react `^1.4.1`
- Forms/validation: react-hook-form `^7.71.2` + zod `^4.3.6`
- Maps: leaflet `^1.9.4` + @mapbox/search-js-react `^1.5.1`
- Uploads: uploadthing `^7.7.4` (+ @uploadthing/react `^7.3.3`)
- Toasts: sonner `^2.0.7`
- Icons: lucide-react `^1.8.0`

## Getting Started

### 1) Install dependencies

Using Bun (recommended for this repo because `bun.lock` exists):

```bash
bun install
```

Or npm:

```bash
npm install
```

### 2) Configure environment

Create `.env.local` and set:

```bash
NEXT_PUBLIC_API_URL="https://menzili-utx2r.sevalla.app"
```

Notes:
- The app builds API requests as `${NEXT_PUBLIC_API_URL}/api/...` (see `lib/api-config.ts`).
- If `NEXT_PUBLIC_API_URL` is not set, the app falls back to `https://menzili-utx2r.sevalla.app`.

### 3) Run the dev server

```bash
bun run dev
```

Or:

```bash
npm run dev
```

Open http://localhost:3000

## Scripts

- `dev`: Start Next.js dev server
- `build`: Production build
- `start`: Start production server
- `lint`: Run ESLint

## Project Structure

- `app/[locale]/...`: App Router routes (localized)
- `components/`: UI + feature components
  - `components/ui/`: design system primitives (shadcn-style components)
  - `components/providers/`: app-wide providers (auth, query, translations, etc.)
- `hooks/`: reusable data/hooks (React Query + domain hooks)
  - `hooks/admin-hooks/`: admin-specific hooks
- `lib/`: shared utilities/config (API config, schemas, constants)
- `api/`: generated OpenAPI client
  - `api/apis/`: API classes
  - `api/models/`: request/response types
- `locales/`: i18n JSON dictionaries (`ar`, `en`, `fr`)
- `public/`: static assets

## Architecture / Patterns

### App Router + Route Localization

- Routes are organized under `app/[locale]/...`
- `next-i18n-router` is used for locale routing
- Dictionaries live in `locales/{lang}/*.json`, loaded via `app/i18n.ts`

### Provider Pattern

- Global state/services are composed via providers:
  - Auth provider: `components/providers/auth.tsx`
  - React Query provider: `components/providers/query.tsx`
  - Translations provider: `components/providers/TranslationsProvider.tsx`

### Data Fetching Pattern (React Query)

- Client-side fetching is done via `@tanstack/react-query`
- Hooks encapsulate fetch logic and caching (examples in `hooks/*`)
- Query keys are structured per domain (e.g. `["notifications", params]`)

### API Layer (Generated OpenAPI Client)

- The API client is generated into `api/` and consumed in hooks/components
- Shared configuration:
  - `lib/api-config.ts` defines `apiConfig` and `API_URL`
  - Auth token is read from `localStorage` and attached as `Authorization: Bearer ...`

### Auth Flow

- OTP-based phone login and password login supported
- Auth state is stored in `localStorage` (`token`, `user`) and exposed via `useAuth()`
- Session expiry is handled by forcing logout and redirect to auth

## Styling / UI

- Tailwind CSS for styling
- Reusable UI primitives live in `components/ui/`
- Consistent variants via `class-variance-authority` (buttons, badges, etc.)

## Notes

- Remote images allowlisted in `next.config.mjs` under `images.remotePatterns`
- If you regenerate the OpenAPI client, keep `api/` as the output target to preserve import paths
