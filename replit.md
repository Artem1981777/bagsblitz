# BagsBlitz

An AI-powered autonomous agentic launchpad on Solana — users deploy, monitor, and manage creator tokens on bags.fm via an elizaOS-powered Command Center.

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
  App.tsx               — root component, page routing, wallet, global state
  types.ts              — shared interfaces (Token, AgentThought, YieldPosition, etc.)
  theme.ts              — design tokens (C, glass, pill, btnPrimary, mono, etc.)
  data.ts               — MOCK_TOKENS, fmt, ago, rand, API constants
  hooks/
    useAgent.ts         — elizaOS agent state: thought stream, yield, royalties
  components/
    AgentCommandCenter  — Command Center shell with 4-tab panel
    AgentStream         — Live Agent Thought Stream (elizaOS decisions feed)
    YieldOptimizer      — Royalty auto-claim + Meteora DLMM / Kamino reinvestment
    SecuritySuite       — 7-point pre-flight checks + MEV Jito protection toggle
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

- Single-page app with `Page` union state (`feed | token | launch | board | agent | yield`) — no router
- All styles are inline via `theme.ts` constants — no CSS modules or Tailwind
- Agent thought stream stores last 60 events in localStorage for persistence across reloads
- elizaOS is simulated client-side; real integration would wire `api/claude.js` as the action executor
- `api/claude.js` follows Vercel/serverless convention — not served by Vite dev server

## Product

- **Discover**: Live token feed with real-time bonding curve + price updates
- **Agent Command Center**: 4-panel (Thought Stream · Yield Optimizer · Security Suite · Dashboard)
  - Live Agent Thought Stream — scrolling AI decision feed (scan/alert/action/yield/security/social)
  - Yield Optimizer — royalty auto-claim → Meteora DLMM / Kamino Finance DeFi reinvestment
  - Security Suite — 7-point pre-flight checks, Jito MEV protection toggle, slippage guard
  - Dashboard — portfolio ROI, royalties, social multiplier, agent performance stats
- **Launch**: 3-step wizard with AI name gen, Pollinations image gen, VC pitch judge
- **Leaderboard**: Market cap ranking with podium display

## User preferences

_Populate as you build_

## Gotchas

- `VITE_BAGS_KEY` missing causes silent fetch failure (caught silently)
- `api/claude.js` needs Vercel or similar serverless platform — not wired into Vite
- `bagsblitz/` subfolder is an unused duplicate scaffold — ignore it
- elizaOS thought stream ticks every 3.5s; pause via the PAUSE button in the stream panel

## Pointers

- bags.fm API: `https://public-api-v2.bags.fm/api/v1`
- elizaOS: `https://github.com/elizaos/eliza`
- Meteora DLMM: `https://docs.meteora.ag/`
- Kamino Finance: `https://docs.kamino.finance/`
- Solana mint: `GiiRMcD1Ci4o6vP3evycKTrpjYQfScL4xobmkNMcBAGS`
