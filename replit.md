# BagsBlitz

An AI-powered creator token intelligence platform built on Solana, letting users explore, analyze, and launch creator tokens via the bags.fm ecosystem.

## Run & Operate

- **Dev**: `npm run dev` (port 5000)
- **Build**: `npm run build`
- **Preview built output**: `npm run preview`
- **Env vars**: `VITE_BAGS_KEY` (bags.fm API key), `VITE_CLAUDE_KEY` (Anthropic API key, used in `api/claude.js`)

## Stack

- React 19 + TypeScript
- Vite 8 (dev server on port 5000, host 0.0.0.0)
- @solana/web3.js for Solana integration
- lucide-react for icons
- Node 20

## Where things live

- `src/App.tsx` — entire frontend app (feed, launch, token detail, leaderboard pages)
- `src/main.tsx` — React entry point
- `api/claude.js` — serverless handler proxying Anthropic Claude API calls
- `bagsblitz/` — duplicate project scaffold (not used at runtime)
- `public/` — static assets (favicon.svg, icons.svg)

## Architecture decisions

- Single-page app with internal page state (`feed | launch | token | board`) — no router
- Mock token data (`MOCK_TOKENS`) used as baseline; live data fetched from bags.fm public API
- Phantom wallet integration with graceful demo-mode fallback
- AI analysis is client-side heuristic (no real API call) unless Claude key is provided
- `api/claude.js` follows Vercel/serverless function convention — not wired into the Vite dev server

## Product

- Browse and filter creator tokens (hot/new/top)
- Token detail view with mini price chart and AI analysis score
- Launch new creator tokens with AI name generation and image generation via Pollinations
- Pitch scoring for token launches
- Leaderboard view
- Phantom wallet connect with demo fallback

## User preferences

_Populate as you build_

## Gotchas

- `VITE_BAGS_KEY` missing causes silent fetch failure (caught with empty try/catch)
- `api/claude.js` is a serverless handler — needs a platform like Vercel to run; not served by Vite
- `bagsblitz/` subfolder mirrors root config but is unused — don't confuse it with the active project root

## Pointers

- bags.fm API: `https://public-api-v2.bags.fm/api/v1`
- Solana mint for BagsBlitz token: `GiiRMcD1Ci4o6vP3evycKTrpjYQfScL4xobmkNMcBAGS`
