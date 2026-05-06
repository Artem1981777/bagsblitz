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
