# BagsBlitz

An AI-powered autonomous agentic launchpad on Solana — users deploy, monitor, and manage creator tokens on bags.fm via an elizaOS-powered Command Center with real-time whale detection.

## Run & Operate

- **Dev**: `npm run dev` (port 5000)
- **Build**: `npm run build`
- **Env vars**: `VITE_BAGS_KEY` (bags.fm API key), `VITE_CLAUDE_KEY` (Anthropic key for `api/claude.js`)

## Stack

- React 19 + TypeScript
- Vite 8 (port 5000, host 0.0.0.0)
- @solana/web3.js for Solana integration
- lucide-react for icons
- Node 20

## Where things live

```
src/
  App.tsx               — root component, page routing, wallet, Jito global state
  types.ts              — Token, AgentThought, TxEvent, JitoBundle, YieldPosition, etc.
  theme.ts              — design tokens (C, glass, pill, btnPrimary, mono, glow)
  data.ts               — MOCK_TOKENS, fmt, ago, rand, BAGS_API, BAGS_KEY
  hooks/
    useAgent.ts         — elizaOS thought stream; reactToTx() injects whale thoughts
    useTransactionFeed.ts — polls bags.fm + synthetic 2.2s feed; whale/MEV detection
  components/
    AgentCommandCenter  — 5-tab shell: Stream · Whales · Security · Yield · Stats
    AgentStream         — Live Agent Thought Stream (scrolling elizaOS decisions)
    WhaleFeed           — Live tx feed: whale detection, MEV badge, Jito status per-tx
    YieldOptimizer      — Royalty auto-claim + Meteora DLMM / Kamino reinvestment
    SecuritySuite       — 7-point pre-flight + Jito bundle pipeline + tx queue
    Dashboard           — ROI, royalties, social multiplier, agent performance
    TokenFeed           — Discover feed with hot/new/top filters
    TokenDetail         — Token detail with AI due diligence (analyzeCreator)
    LaunchPad           — 3-step wizard: Define → Brand → Launch
    Leaderboard         — Ranked token list with podium
    MiniChart           — Inline SVG sparkline
api/
  claude.js             — Vercel serverless handler → Anthropic API proxy
```

## Architecture decisions

- Single-page app with `Page` union state — no router
- All styles are inline via `theme.ts` — no CSS modules or Tailwind
- `useTransactionFeed` polls bags.fm every 4s + generates synthetic txs every 2.2s for always-on demo
- Whale threshold: ≥ 8 SOL per tx; MEV block probability 35% when Jito enabled on whale txs
- Agent thought stream reacts dynamically to whale buys/sells, MEV blocks, graduations via `reactToTx()`
- Jito toggle is global state in App.tsx, passed to both SecuritySuite and useTransactionFeed
- `api/claude.js` follows Vercel/serverless convention — not served by Vite dev server

## Product

- **Discover**: Live token feed with real-time bonding curve + price updates
- **Agent Command Center** (5 tabs):
  - **Stream** — scrolling elizaOS AI decision feed; dynamically reacts to whale events
  - **Whales** — live mempool feed; whale/MEV/bundle filter tabs; flash animation on new txs; unread badge on nav
  - **Security** — Jito toggle (glowing when active), bundle pipeline viz, tx queue with Jito routing, 7-point pre-flight
  - **Yield** — royalty auto-claim → Meteora DLMM / Kamino Finance reinvestment
  - **Stats** — portfolio ROI, royalties, social multiplier, agent performance
- **Launch**: 3-step wizard with AI name gen, Pollinations image gen, VC pitch judge
- **Leaderboard**: Market cap ranking with podium display

## User preferences

_Populate as you build_

## Gotchas

- `VITE_BAGS_KEY` missing causes silent fetch failure; synthetic feed runs regardless
- `api/claude.js` needs Vercel or similar serverless platform — not wired into Vite dev server
- `bagsblitz/` subfolder is an unused duplicate scaffold — ignore it
- Whale nav badge clears when user enters the Agent tab (20s window)

## Pointers

- bags.fm API: `https://public-api-v2.bags.fm/api/v1`
- elizaOS: `https://github.com/elizaos/eliza`
- Meteora DLMM: `https://docs.meteora.ag/`
- Kamino Finance: `https://docs.kamino.finance/`
- Solana mint: `GiiRMcD1Ci4o6vP3evycKTrpjYQfScL4xobmkNMcBAGS`
