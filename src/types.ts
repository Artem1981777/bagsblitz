export interface Token {
  id: string
  name: string
  symbol: string
  description: string
  image: string
  price: number
  priceChange: number
  marketCap: number
  volume: number
  holders: number
  creator: string
  createdAt: number
  bondingProgress: number
  royaltyPct: number
  priceHistory: number[]
  mint?: string
}

export interface AgentThought {
  id: string
  timestamp: number
  type: "scan" | "alert" | "action" | "yield" | "security" | "mev" | "social" | "analysis"
  message: string
  detail?: string
  token?: string
  confidence?: number
  critical?: boolean
}

export interface YieldPosition {
  id: string
  protocol: "Meteora DLMM" | "Kamino Finance"
  tokenA: string
  tokenB: string
  tvl: number
  apy: number
  earned: number
  status: "active" | "pending" | "rebalancing"
}

export interface SecurityCheck {
  id: string
  name: string
  status: "pass" | "fail" | "warn" | "pending"
  detail: string
}

export interface RoyaltyEntry {
  tokenSymbol: string
  tokenName: string
  amount: number
  usdValue: number
  claimedAt: number
  reinvested: boolean
}

export interface WalletState {
  connected: boolean
  address: string
  balance: number
}

export type Page = "feed" | "launch" | "token" | "board" | "agent" | "yield"

/** Live on-chain transaction event */
export type TxType = "whale_buy" | "whale_sell" | "graduation" | "new_listing" | "normal_buy" | "normal_sell" | "rug_alert"

export interface TxEvent {
  id: string
  timestamp: number
  type: TxType
  tokenSymbol: string
  tokenName: string
  tokenImage: string
  solAmount: number
  usdAmount: number
  walletAddr: string
  bondingDelta: number
  priceDelta: number
  jitoStatus: "bypassed" | "pending" | "bundling" | "confirmed" | "mev_blocked"
  jitoSlot?: number
  mevBlocked: boolean
  isWhale: boolean
}

export interface JitoBundle {
  id: string
  slot: number
  txCount: number
  priorityFee: number
  status: "forming" | "submitted" | "confirmed"
  savedFromMev: number
}

/** Honeypot + Liquidity check result */
export interface HoneypotResult {
  symbol: string
  honeypotDetected: boolean
  liquidityLocked: boolean
  rugScore: number               // 0–100 (≥65 = danger)
  findings: string[]             // list of specific flags
  recommendation: "SAFE" | "CAUTION" | "CRITICAL"
}

/** Follow-on trade entry waiting in the queue */
export type TradeStatus = "validating" | "queued" | "blocked" | "executed" | "dismissed"

export interface TradeQueueEntry {
  id: string
  timestamp: number
  sourceTx: TxEvent              // the whale tx that triggered this
  suggestedSol: number           // agent-recommended follow-on size
  honeypot: HoneypotResult | null
  status: TradeStatus
  jitoEnabled: boolean
  triggeredBy: "auto" | "copy"   // auto = proactive; copy = one-click copy trade
}
