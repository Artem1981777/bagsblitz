import { useState, useEffect, useCallback } from "react"
import type { AgentThought, YieldPosition, RoyaltyEntry } from "../types"

const THOUGHT_TEMPLATES = [
  { type: "scan" as const, messages: [
    { msg: "Scanning bonding curves across 61 tokens...", detail: "Monitoring price velocity and volume anomalies" },
    { msg: "Detected momentum spike on $GGLD", detail: "Volume +340% in 10min. Bonding curve at 95%. Breakout imminent." },
    { msg: "Cross-referencing social sentiment for $CREATE", detail: "Twitter mentions +89%, Discord activity elevated" },
    { msg: "Analyzing royalty yield opportunities...", detail: "Calculating optimal claim windows for 12 positions" },
    { msg: "Monitoring Bags.fm mempool for large orders", detail: "No whale movements detected in last 60s" },
    { msg: "BondingCurve.scan() → 23 tokens near graduation", detail: "Graduation threshold: 100% bonding = DEX listing" },
  ]},
  { type: "alert" as const, messages: [
    { msg: "⚡ ALERT: $LMAO bonding curve +567% in 5min", detail: "Unusual price action detected. Potential coordinated buy." },
    { msg: "⚠️ Low liquidity warning on $PETS", detail: "Spread widening. Reducing position confidence to 42%." },
    { msg: "🔴 Rug-risk flag: New token with unlocked liquidity", detail: "Pre-flight check FAILED. Blocking auto-invest." },
    { msg: "✅ $MUSIC royalty claim ready: +0.042 SOL", detail: "Optimal gas window detected. Executing claim." },
  ]},
  { type: "yield" as const, messages: [
    { msg: "Depositing 0.5 SOL royalties → Meteora DLMM", detail: "SOL/USDC pool. Current APY: 47.3%. Rebalancing in range." },
    { msg: "Kamino vault rebalance triggered for SOL/USDC", detail: "Price out of range. Moving liquidity to optimal tick." },
    { msg: "Yield harvest: +0.018 SOL from Meteora DLMM", detail: "Auto-compounding into principal. New TVL: $1,247" },
    { msg: "Royalty stream analysis: $12.4 earned this week", detail: "Best performing: $GGLD (4% royalty, high volume)" },
  ]},
  { type: "security" as const, messages: [
    { msg: "Pre-flight check initiated for buy order", detail: "Running 7-point safety validation..." },
    { msg: "✅ Contract audit: No honeypot patterns detected", detail: "Source verified against known malicious signatures" },
    { msg: "MEV protection active via Jito bundle", detail: "Bundle submitted. Priority fee: 0.001 SOL. Slot: next" },
    { msg: "Slippage guard: 2.5% max set for $CREATE trade", detail: "Market impact estimated at 0.8%. Safe to proceed." },
    { msg: "Safety buffer check: wallet balance sufficient", detail: "Maintaining 0.1 SOL reserve. Transaction approved." },
  ]},
  { type: "action" as const, messages: [
    { msg: "Executing buy order: 0.1 SOL → $CREATE", detail: "Via Jito bundle. Expected slippage: 0.8%" },
    { msg: "Auto-claiming royalties for 3 managed tokens", detail: "Total: 0.067 SOL. Routing to yield optimizer." },
    { msg: "Portfolio rebalance: reducing $ART exposure 15%", detail: "Sentiment declining. Reallocating to $GGLD." },
  ]},
  { type: "social" as const, messages: [
    { msg: "Social multiplier update: $FILM3 trending +3.2x", detail: "X mentions: 1,240 | TikTok shares: 890 | Discord: active" },
    { msg: "Creator signal detected: $MUSIC new collab announced", detail: "Parsing on-chain metadata + social feeds" },
    { msg: "Sentiment score: $GGLD → 87/100 bullish", detail: "Key signals: holder growth, volume, community engagement" },
  ]},
]

const AGENT_THOUGHTS_KEY = "bb_agent_thoughts"

export function useAgent() {
  const [thoughts, setThoughts] = useState<AgentThought[]>(() => {
    try {
      const stored = localStorage.getItem(AGENT_THOUGHTS_KEY)
      return stored ? JSON.parse(stored).slice(-50) : []
    } catch { return [] }
  })
  const [isActive, setIsActive] = useState(true)
  const [agentCycle, setAgentCycle] = useState(0)

  const [yieldPositions] = useState<YieldPosition[]>([
    { id:"y1", protocol:"Meteora DLMM", tokenA:"SOL", tokenB:"USDC", tvl:1247, apy:47.3, earned:0.062, status:"active" },
    { id:"y2", protocol:"Kamino Finance", tokenA:"SOL", tokenB:"mSOL", tvl:834, apy:23.8, earned:0.031, status:"active" },
    { id:"y3", protocol:"Meteora DLMM", tokenA:"USDC", tokenB:"BONK", tvl:412, apy:89.1, earned:0.018, status:"rebalancing" },
  ])

  const [royalties] = useState<RoyaltyEntry[]>([
    { tokenSymbol:"GGLD", tokenName:"Gaming Guild", amount:0.042, usdValue:6.80, claimedAt:Date.now()-3600000, reinvested:true },
    { tokenSymbol:"CREATE", tokenName:"Creator Coin", amount:0.018, usdValue:2.91, claimedAt:Date.now()-7200000, reinvested:true },
    { tokenSymbol:"MUSIC", tokenName:"Music DAO", amount:0.009, usdValue:1.46, claimedAt:Date.now()-14400000, reinvested:false },
    { tokenSymbol:"BBLITZ", tokenName:"BagsBlitz", amount:0.003, usdValue:0.49, claimedAt:Date.now()-28800000, reinvested:true },
  ])

  const addThought = useCallback((thought: Omit<AgentThought, "id" | "timestamp">) => {
    const t: AgentThought = {
      ...thought,
      id: Math.random().toString(36).slice(2),
      timestamp: Date.now(),
    }
    setThoughts(prev => {
      const next = [t, ...prev].slice(0, 60)
      try { localStorage.setItem(AGENT_THOUGHTS_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  useEffect(() => {
    if (!isActive) return
    const interval = setInterval(() => {
      const category = THOUGHT_TEMPLATES[Math.floor(Math.random() * THOUGHT_TEMPLATES.length)]
      const item = category.messages[Math.floor(Math.random() * category.messages.length)]
      addThought({
        type: category.type,
        message: item.msg,
        detail: item.detail,
        confidence: Math.floor(Math.random() * 40) + 60,
      })
      setAgentCycle(c => c + 1)
    }, 3500)
    return () => clearInterval(interval)
  }, [isActive, addThought])

  return { thoughts, isActive, setIsActive, agentCycle, yieldPositions, royalties, addThought }
}
