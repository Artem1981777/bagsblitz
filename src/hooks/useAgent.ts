import { useState, useEffect, useCallback } from "react"
import type { AgentThought, YieldPosition, RoyaltyEntry, TxEvent } from "../types"

const THOUGHT_TEMPLATES = [
  { type: "scan" as const, messages: [
    { msg: "Scanning bonding curves across all tracked tokens…", detail: "Monitoring price velocity and volume anomalies" },
    { msg: "BondingCurve.scan() → detecting graduation candidates", detail: "Graduation threshold: 100% bonding = DEX listing imminent" },
    { msg: "Analyzing royalty yield opportunities…", detail: "Calculating optimal claim windows across 12 positions" },
    { msg: "Cross-referencing social sentiment for $CREATE", detail: "X mentions +89%, Discord activity elevated — bullish signal" },
    { msg: "Monitoring Bags.fm mempool — no anomalies", detail: "All observed transactions within expected volume bands" },
  ]},
  { type: "alert" as const, messages: [
    { msg: "⚠️ Low liquidity warning on $PETS", detail: "Spread widening. Reducing position confidence to 42%." },
    { msg: "🔴 Rug-risk flag: New token with unlocked liquidity", detail: "Pre-flight check FAILED. Blocking auto-invest." },
    { msg: "✅ $MUSIC royalty claim ready: +0.042 SOL", detail: "Optimal gas window detected. Executing claim." },
    { msg: "⚡ Price anomaly detected — running anomaly classifier", detail: "Spike pattern consistent with coordinated entry. Monitoring." },
  ]},
  { type: "yield" as const, messages: [
    { msg: "Depositing 0.5 SOL royalties → Meteora DLMM", detail: "SOL/USDC pool. Current APY: 47.3%. Rebalancing in range." },
    { msg: "Kamino vault rebalance triggered for SOL/mSOL", detail: "Price out of range. Moving liquidity to optimal tick." },
    { msg: "Yield harvest: +0.018 SOL from Meteora DLMM", detail: "Auto-compounding into principal. New TVL: $1,247" },
    { msg: "Royalty stream analysis: $12.4 earned this week", detail: "Best performing: $GGLD (4% royalty × high volume)" },
  ]},
  { type: "security" as const, messages: [
    { msg: "Pre-flight check initiated for pending buy order", detail: "Running 7-point safety validation pipeline…" },
    { msg: "✅ Contract audit: No honeypot patterns detected", detail: "Source verified against known malicious signatures" },
    { msg: "Slippage guard: 2.5% max applied for $CREATE trade", detail: "Market impact estimated at 0.8%. Safe to proceed." },
    { msg: "Safety buffer check: wallet balance sufficient", detail: "Maintaining 0.1 SOL reserve. Transaction approved." },
  ]},
  { type: "action" as const, messages: [
    { msg: "Executing buy order: 0.1 SOL → $CREATE via Jito bundle", detail: "Priority fee: 0.001 SOL. Expected slippage: 0.8%" },
    { msg: "Auto-claiming royalties for 3 managed tokens", detail: "Total: 0.067 SOL. Routing to Meteora yield optimizer." },
    { msg: "Portfolio rebalance: reducing $ART exposure 15%", detail: "Sentiment declining. Reallocating to $GGLD." },
  ]},
  { type: "social" as const, messages: [
    { msg: "Social multiplier update: $FILM3 trending +3.2x", detail: "X mentions: 1,240 | TikTok shares: 890 | Discord: active" },
    { msg: "Creator signal detected: $MUSIC new collab announced", detail: "Parsing on-chain metadata + social feeds" },
    { msg: "Sentiment score: $GGLD → 87/100 bullish", detail: "Key signals: holder growth, volume, community engagement" },
  ]},
]

/** Craft a dynamic thought from a live TxEvent */
function thoughtFromTx(tx: TxEvent): Omit<AgentThought, "id" | "timestamp"> {
  const sol = tx.solAmount.toFixed(tx.solAmount >= 10 ? 1 : 3)
  const usd = tx.usdAmount.toFixed(0)

  if (tx.mevBlocked) {
    return {
      type: "mev",
      message: `⚡ MEV attack blocked on $${tx.tokenSymbol} — Jito bundle intervened`,
      detail: `Front-running bot neutralised. Saved ~$${(tx.usdAmount * 0.015).toFixed(2)} for ${tx.walletAddr}. Bundle submitted.`,
      confidence: 99,
    }
  }
  if (tx.type === "graduation") {
    return {
      type: "alert",
      message: `🎓 $${tx.tokenSymbol} bonding curve COMPLETE — DEX graduation imminent`,
      detail: `Token will list on Raydium/Orca. Liquidity migration in progress. Watching for arb opportunities.`,
      confidence: 97,
    }
  }
  if (tx.type === "whale_buy") {
    return {
      type: "alert",
      message: `🐋 WHALE BUY detected: ${sol} SOL ($${usd}) into $${tx.tokenSymbol}`,
      detail: `Wallet ${tx.walletAddr} · Curve +${tx.bondingDelta.toFixed(1)}% · ${tx.jitoStatus === "confirmed" ? "Jito bundled ✓" : "unprotected"} · Triggering Honeypot check…`,
      confidence: 88,
    }
  }
  if (tx.type === "whale_sell") {
    return {
      type: "alert",
      message: `🐳 WHALE SELL: ${sol} SOL ($${usd}) exiting $${tx.tokenSymbol}`,
      detail: `Wallet ${tx.walletAddr} · Distribution signal. Reassessing position confidence. Watching for follow-on selling.`,
      confidence: 85,
    }
  }
  if (tx.type === "new_listing") {
    return {
      type: "scan",
      message: `🚀 New token detected: $${tx.tokenSymbol}`,
      detail: `Running pre-flight checks. Analyzing creator wallet, liquidity lock, and initial buy pattern.`,
      confidence: 72,
    }
  }
  return {
    type: "scan",
    message: `◉ Activity on $${tx.tokenSymbol}: ${sol} SOL`,
    detail: `Normal buy order. Volume within expected range.`,
    confidence: 60,
  }
}

const AGENT_THOUGHTS_KEY = "bb_agent_thoughts"

export function useAgent() {
  const [thoughts, setThoughts] = useState<AgentThought[]>(() => {
    try {
      const stored = localStorage.getItem(AGENT_THOUGHTS_KEY)
      return stored ? JSON.parse(stored).slice(-50) : []
    } catch { return [] }
  })
  const [isActive, setIsActive]   = useState(true)
  const [agentCycle, setAgentCycle] = useState(0)

  const [yieldPositions] = useState<YieldPosition[]>([
    { id:"y1", protocol:"Meteora DLMM",  tokenA:"SOL",  tokenB:"USDC", tvl:1247, apy:47.3, earned:0.062, status:"active" },
    { id:"y2", protocol:"Kamino Finance", tokenA:"SOL",  tokenB:"mSOL", tvl:834,  apy:23.8, earned:0.031, status:"active" },
    { id:"y3", protocol:"Meteora DLMM",  tokenA:"USDC", tokenB:"BONK", tvl:412,  apy:89.1, earned:0.018, status:"rebalancing" },
  ])

  const [royalties] = useState<RoyaltyEntry[]>([
    { tokenSymbol:"GGLD",   tokenName:"Gaming Guild",  amount:0.042, usdValue:6.80, claimedAt:Date.now()-3600000,  reinvested:true  },
    { tokenSymbol:"CREATE", tokenName:"Creator Coin",  amount:0.018, usdValue:2.91, claimedAt:Date.now()-7200000,  reinvested:true  },
    { tokenSymbol:"MUSIC",  tokenName:"Music DAO",     amount:0.009, usdValue:1.46, claimedAt:Date.now()-14400000, reinvested:false },
    { tokenSymbol:"BBLITZ", tokenName:"BagsBlitz",     amount:0.003, usdValue:0.49, claimedAt:Date.now()-28800000, reinvested:true  },
  ])

  const addThought = useCallback((thought: Omit<AgentThought, "id" | "timestamp">) => {
    const t: AgentThought = {
      ...thought,
      id: Math.random().toString(36).slice(2),
      timestamp: Date.now(),
    }
    setThoughts(prev => {
      const next = [t, ...prev].slice(0, 80)
      try { localStorage.setItem(AGENT_THOUGHTS_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  /**
   * Called by useTransactionFeed for every significant tx.
   * Emits an immediate thought; the caller (App.tsx) also triggers the
   * trade validator for whale buys.
   */
  const reactToTx = useCallback((tx: TxEvent) => {
    if (!tx.isWhale && !tx.mevBlocked && tx.type !== "graduation" && tx.type !== "new_listing") return
    addThought(thoughtFromTx(tx))
    setAgentCycle(c => c + 1)
  }, [addThought])

  // Background ambient pulse
  useEffect(() => {
    if (!isActive) return
    const id = setInterval(() => {
      const cat  = THOUGHT_TEMPLATES[Math.floor(Math.random() * THOUGHT_TEMPLATES.length)]
      const item = cat.messages[Math.floor(Math.random() * cat.messages.length)]
      addThought({ type: cat.type, message: item.msg, detail: item.detail, confidence: Math.floor(Math.random() * 35) + 60 })
      setAgentCycle(c => c + 1)
    }, 5000)
    return () => clearInterval(id)
  }, [isActive, addThought])

  return { thoughts, isActive, setIsActive, agentCycle, yieldPositions, royalties, addThought, reactToTx }
}
