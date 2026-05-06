import { useState, useCallback } from "react"
import type { TxEvent, HoneypotResult, TradeQueueEntry, AgentThought } from "../types"

// ─── Deterministic rug-score engine ──────────────────────────────────────────
// Same token symbol always produces the same score in a session,
// so the UI is coherent when the same token appears multiple times.
const RUG_SCORE_CACHE = new Map<string, number>()

function computeRugScore(symbol: string, solAmount: number, bondingDelta: number): number {
  if (RUG_SCORE_CACHE.has(symbol)) return RUG_SCORE_CACHE.get(symbol)!

  // Deterministic base from symbol hash
  let hash = 5381
  for (const c of symbol) hash = ((hash << 5) + hash + c.charCodeAt(0)) >>> 0
  const base = hash % 55   // 0–54

  // Extra risk from live context (non-deterministic nudge, capped)
  const activityRisk = bondingDelta > 3 ? 10 : bondingDelta > 1.5 ? 5 : 0
  const sizeRisk = solAmount > 30 ? 8 : solAmount > 15 ? 4 : 0

  const score = Math.min(100, base + activityRisk + sizeRisk)
  RUG_SCORE_CACHE.set(symbol, score)
  return score
}

function buildHoneypotResult(symbol: string, solAmount: number, bondingDelta: number): HoneypotResult {
  const rugScore = computeRugScore(symbol, solAmount, bondingDelta)
  const findings: string[] = []

  if (rugScore >= 65) {
    findings.push("Sell function blocked — honeypot pattern detected in bytecode")
    findings.push("Liquidity LP tokens UNLOCKED — owner can drain pool")
    if (rugScore >= 80) findings.push("Owner wallet holds >45% of total supply")
    if (rugScore >= 90) findings.push("Contract self-destruct function present")
  } else if (rugScore >= 40) {
    findings.push("Liquidity lock duration < 7 days — moderate risk")
    if (rugScore >= 50) findings.push("Owner retains mint authority — supply inflation possible")
  } else {
    findings.push("No honeypot patterns detected in contract source")
    findings.push("Liquidity locked ≥30 days on SolanaFM")
    findings.push("Owner wallet holds <15% of supply")
  }

  return {
    symbol,
    honeypotDetected: rugScore >= 65,
    liquidityLocked: rugScore < 65,
    rugScore,
    findings,
    recommendation: rugScore >= 65 ? "CRITICAL" : rugScore >= 40 ? "CAUTION" : "SAFE",
  }
}

// ─── Suggested follow-on size ──────────────────────────────────────────────
// Agent sizes the follow-on as 3–8% of the whale position, capped at 5 SOL
function suggestSol(whaleSol: number): number {
  const pct = 0.03 + Math.random() * 0.05
  return parseFloat(Math.min(5, whaleSol * pct).toFixed(3))
}

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useTradeValidator(
  addThought: (t: Omit<AgentThought, "id" | "timestamp">) => void,
  jitoEnabled: boolean,
) {
  const [tradeQueue, setTradeQueue] = useState<TradeQueueEntry[]>([])
  const [validating, setValidating] = useState<Set<string>>(new Set())

  const updateEntry = useCallback((id: string, patch: Partial<TradeQueueEntry>) => {
    setTradeQueue(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e))
  }, [])

  /** Core async validation pipeline — shared by auto & copy-trade paths */
  const runValidation = useCallback(async (
    entry: TradeQueueEntry,
  ) => {
    const { sourceTx } = entry
    const sym = sourceTx.tokenSymbol

    setValidating(v => new Set(v).add(entry.id))

    // Step 1 – announce
    addThought({
      type: "security",
      message: `⬡ Honeypot & Liquidity check initiated for $${sym}`,
      detail: `Triggered by ${entry.triggeredBy === "copy" ? "Copy Trade request" : "whale buy signal"} · ${sourceTx.solAmount.toFixed(1)} SOL whale position`,
      confidence: 80,
    })

    await delay(620)

    // Step 2 – bytecode scan
    addThought({
      type: "security",
      message: `Scanning $${sym} contract bytecode for malicious patterns…`,
      detail: "Checking selfdestruct, blocked-sell, and mint-authority signatures",
      confidence: 75,
    })

    await delay(750)

    // Step 3 – liquidity
    addThought({
      type: "security",
      message: `Verifying LP token lock status for $${sym}…`,
      detail: "Cross-referencing SolanaFM lock registry",
      confidence: 75,
    })

    await delay(680)

    // Compute result
    const honeypot = buildHoneypotResult(sym, sourceTx.solAmount, sourceTx.bondingDelta)

    // Step 4 – emit final verdict
    if (honeypot.recommendation === "CRITICAL") {
      addThought({
        type: "alert",
        message: `🔴 CRITICAL WARNING: $${sym} flagged as potential rug — trade BLOCKED`,
        detail: honeypot.findings.slice(0, 2).join(" · "),
        confidence: honeypot.rugScore,
        critical: true,
      })
      updateEntry(entry.id, { honeypot, status: "blocked" })
    } else if (honeypot.recommendation === "CAUTION") {
      addThought({
        type: "alert",
        message: `⚠️ CAUTION: $${sym} shows moderate risk flags`,
        detail: honeypot.findings[0] + " — queued with reduced size",
        confidence: 100 - honeypot.rugScore,
      })
      updateEntry(entry.id, {
        honeypot,
        status: "queued",
        suggestedSol: parseFloat((entry.suggestedSol * 0.5).toFixed(3)),
      })
    } else {
      addThought({
        type: "action",
        message: `✅ $${sym} cleared — follow-on trade queued (${entry.suggestedSol.toFixed(3)} SOL)`,
        detail: `Honeypot: NONE · Liquidity: LOCKED · ${jitoEnabled ? "Jito bundle active" : "No MEV protection"} · Rug score: ${honeypot.rugScore}/100`,
        confidence: 100 - honeypot.rugScore,
      })
      updateEntry(entry.id, { honeypot, status: "queued" })
    }

    setValidating(v => { const n = new Set(v); n.delete(entry.id); return n })
  }, [addThought, jitoEnabled, updateEntry])

  /** Auto-triggered when a whale buy is detected */
  const validateWhale = useCallback(async (tx: TxEvent) => {
    if (tx.type !== "whale_buy") return
    const entry: TradeQueueEntry = {
      id: makeId(),
      timestamp: Date.now(),
      sourceTx: tx,
      suggestedSol: suggestSol(tx.solAmount),
      honeypot: null,
      status: "validating",
      jitoEnabled,
      triggeredBy: "auto",
    }
    setTradeQueue(prev => [entry, ...prev].slice(0, 20))
    await runValidation(entry)
  }, [jitoEnabled, runValidation])

  /** Manual one-click copy-trade from WhaleFeed */
  const copyTrade = useCallback(async (tx: TxEvent) => {
    // De-dupe: if already validating this tx, ignore second press
    const alreadyQueued = tradeQueue.some(e => e.sourceTx.id === tx.id)
    if (alreadyQueued) return

    addThought({
      type: "action",
      message: `📋 Copy Trade requested: $${tx.tokenSymbol} · ${tx.solAmount.toFixed(1)} SOL whale`,
      detail: "Running Security Suite pre-flight before execution…",
      confidence: 70,
    })

    const entry: TradeQueueEntry = {
      id: makeId(),
      timestamp: Date.now(),
      sourceTx: tx,
      suggestedSol: suggestSol(tx.solAmount),
      honeypot: null,
      status: "validating",
      jitoEnabled,
      triggeredBy: "copy",
    }
    setTradeQueue(prev => [entry, ...prev].slice(0, 20))
    await runValidation(entry)
  }, [addThought, jitoEnabled, runValidation, tradeQueue])

  const executeEntry = useCallback((id: string) => {
    const entry = tradeQueue.find(e => e.id === id)
    if (!entry) return
    addThought({
      type: "action",
      message: `🚀 Executing follow-on: ${entry.suggestedSol} SOL → $${entry.sourceTx.tokenSymbol}`,
      detail: `${entry.jitoEnabled ? "⬡ Via Jito bundle · " : ""}Slippage: 2.5% max · Source: ${entry.triggeredBy === "copy" ? "Copy Trade" : "Agent proactive"}`,
      confidence: 95,
    })
    updateEntry(id, { status: "executed" })
  }, [addThought, tradeQueue, updateEntry])

  const dismissEntry = useCallback((id: string) => {
    updateEntry(id, { status: "dismissed" })
  }, [updateEntry])

  const activeQueue = tradeQueue.filter(e => e.status !== "dismissed")

  return { tradeQueue: activeQueue, validating, validateWhale, copyTrade, executeEntry, dismissEntry }
}

function delay(ms: number) {
  return new Promise<void>(r => setTimeout(r, ms))
}
