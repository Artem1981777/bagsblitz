import { useState, useEffect, useCallback, useRef } from "react"
import type { TxEvent, TxType, JitoBundle, Token } from "../types"
import { BAGS_API, BAGS_KEY } from "../data"

// Whale threshold: ≥ 8 SOL estimated position
const WHALE_SOL_THRESHOLD = 8
const SOL_USD = 160

const WALLET_POOL = [
  "7xKp...mE3f", "3nRq...9aW2", "BzLm...4kP1", "Wr9s...vQ8n",
  "5cDf...2tJ6", "AqNm...8hX4", "GpTk...1sY7", "9wZr...3bF5",
  "Cv4j...6eM9", "FhYu...0rK3", "Lx8d...7nS2", "Qb2w...5pA8",
]

function fakeWallet() {
  return WALLET_POOL[Math.floor(Math.random() * WALLET_POOL.length)]
}

function makeTxId() {
  return Math.random().toString(36).slice(2, 10)
}

/** Infer transaction type from token state deltas */
function classifyTx(
  volDelta: number,
  priceDelta: number,
  bondingDelta: number,
  isNew: boolean,
  bondingPct: number,
): TxType {
  if (isNew) return "new_listing"
  if (bondingPct >= 99.5) return "graduation"
  const sol = (volDelta / SOL_USD)
  if (sol >= WHALE_SOL_THRESHOLD) return priceDelta >= 0 ? "whale_buy" : "whale_sell"
  return priceDelta >= 0 ? "normal_buy" : "normal_sell"
}

/** Generate a realistic synthetic transaction from a token snapshot */
function syntheticTx(tokens: Token[], jitoEnabled: boolean): TxEvent {
  const t = tokens[Math.floor(Math.random() * Math.min(tokens.length, 15))]
  const isWhale = Math.random() < 0.22
  const sol = isWhale
    ? parseFloat((Math.random() * 42 + 8).toFixed(2))
    : parseFloat((Math.random() * 2.5 + 0.05).toFixed(3))
  const usd = sol * SOL_USD
  const priceDelta = (Math.random() - 0.42) * (isWhale ? 12 : 3)
  const bondingDelta = isWhale ? Math.random() * 4 : Math.random() * 0.8
  const mevBlocked = jitoEnabled && isWhale && Math.random() < 0.35

  const type = isWhale
    ? (priceDelta >= 0 ? "whale_buy" : "whale_sell")
    : (priceDelta >= 0 ? "normal_buy" : "normal_sell")

  let jitoStatus: TxEvent["jitoStatus"] = "bypassed"
  if (jitoEnabled) {
    if (mevBlocked) jitoStatus = "mev_blocked"
    else if (Math.random() < 0.3) jitoStatus = "bundling"
    else jitoStatus = "confirmed"
  }

  return {
    id: makeTxId(),
    timestamp: Date.now(),
    type,
    tokenSymbol: t.symbol,
    tokenName: t.name,
    tokenImage: t.image,
    solAmount: sol,
    usdAmount: usd,
    walletAddr: fakeWallet(),
    bondingDelta,
    priceDelta,
    jitoStatus,
    jitoSlot: jitoStatus === "confirmed" ? Math.floor(Math.random() * 100) + 295_000_000 : undefined,
    mevBlocked,
    isWhale,
  }
}

/** Derive transaction events by diffing live API snapshots */
function diffApiSnapshot(
  prev: Record<string, { volume: number; price: number; bondingProgress: number }>,
  curr: any[],
  jitoEnabled: boolean,
): TxEvent[] {
  const events: TxEvent[] = []
  for (const t of curr) {
    const sym = t.symbol || t.ticker || "?"
    const price = parseFloat(t.price || "0")
    const volume = parseFloat(t.volume || t.vol || "0")
    const bonding = parseFloat(t.bondingProgress || t.bonding_progress || "0")
    const p = prev[sym]
    if (!p) continue
    const volDelta = volume - p.volume
    const priceDelta = price - p.price
    const bondingDelta = bonding - p.bondingProgress
    if (Math.abs(volDelta) < 10) continue          // ignore noise
    const type = classifyTx(Math.abs(volDelta), priceDelta, bondingDelta, false, bonding)
    const sol = Math.abs(volDelta) / SOL_USD
    const isWhale = sol >= WHALE_SOL_THRESHOLD
    const mevBlocked = jitoEnabled && isWhale && Math.random() < 0.3
    let jitoStatus: TxEvent["jitoStatus"] = jitoEnabled ? "confirmed" : "bypassed"
    if (mevBlocked) jitoStatus = "mev_blocked"
    events.push({
      id: makeTxId(),
      timestamp: Date.now(),
      type,
      tokenSymbol: sym,
      tokenName: t.name || sym,
      tokenImage: t.image || "💎",
      solAmount: parseFloat(sol.toFixed(3)),
      usdAmount: parseFloat((sol * SOL_USD).toFixed(2)),
      walletAddr: fakeWallet(),
      bondingDelta,
      priceDelta,
      jitoStatus,
      jitoSlot: jitoStatus === "confirmed" ? Math.floor(Math.random() * 100) + 295_000_000 : undefined,
      mevBlocked,
      isWhale,
    })
  }
  return events
}

export function useTransactionFeed(tokens: Token[], jitoEnabled: boolean) {
  const [txEvents, setTxEvents] = useState<TxEvent[]>([])
  const [bundles, setBundles] = useState<JitoBundle[]>([])
  const [whaleCount, setWhaleCount] = useState(0)
  const [mevBlockCount, setMevBlockCount] = useState(0)
  const prevSnapshot = useRef<Record<string, { volume: number; price: number; bondingProgress: number }>>({})
  const onNewTx = useRef<((tx: TxEvent) => void) | null>(null)

  /** Register external callback (agent thought injector) */
  const setOnNewTx = useCallback((fn: (tx: TxEvent) => void) => {
    onNewTx.current = fn
  }, [])

  const pushTx = useCallback((tx: TxEvent) => {
    setTxEvents(prev => [tx, ...prev].slice(0, 80))
    if (tx.isWhale) setWhaleCount(c => c + 1)
    if (tx.mevBlocked) setMevBlockCount(c => c + 1)
    if (onNewTx.current) onNewTx.current(tx)

    // Form a Jito bundle when there are enough bundled txs
    if (jitoEnabled && (tx.jitoStatus === "bundling" || tx.jitoStatus === "confirmed")) {
      setBundles(prev => {
        const forming = prev.find(b => b.status === "forming")
        if (forming && forming.txCount < 4) {
          return prev.map(b => b.id === forming.id
            ? { ...b, txCount: b.txCount + 1, status: b.txCount >= 3 ? "submitted" : "forming" }
            : b)
        }
        const newBundle: JitoBundle = {
          id: makeTxId(),
          slot: Math.floor(Math.random() * 100) + 295_000_000,
          txCount: 1,
          priorityFee: parseFloat((Math.random() * 0.002 + 0.0005).toFixed(4)),
          status: "forming",
          savedFromMev: tx.mevBlocked ? tx.usdAmount * 0.015 : 0,
        }
        // Confirm oldest submitted bundle
        const updated = prev.map(b => b.status === "submitted" ? { ...b, status: "confirmed" as const } : b)
        return [newBundle, ...updated].slice(0, 6)
      })
    }
  }, [jitoEnabled])

  // --- Poll bags.fm API (real data) ---
  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch(BAGS_API + "/tokens?limit=20&sort=volume", {
          headers: { "x-api-key": BAGS_KEY },
          signal: AbortSignal.timeout(4000),
        })
        const data = await res.json()
        const list: any[] = data.data || data.tokens || []
        if (list.length === 0) return
        const events = diffApiSnapshot(prevSnapshot.current, list, jitoEnabled)
        events.forEach(pushTx)
        // Update snapshot
        for (const t of list) {
          const sym = t.symbol || t.ticker || "?"
          prevSnapshot.current[sym] = {
            volume: parseFloat(t.volume || "0"),
            price: parseFloat(t.price || "0"),
            bondingProgress: parseFloat(t.bondingProgress || "0"),
          }
        }
      } catch {}
    }
    poll()
    const id = setInterval(poll, 4000)
    return () => clearInterval(id)
  }, [jitoEnabled, pushTx])

  // --- Synthetic feed (always-on demo) ---
  useEffect(() => {
    if (tokens.length === 0) return
    // Stagger initial burst
    const burst = setTimeout(() => {
      for (let i = 0; i < 4; i++) {
        setTimeout(() => pushTx(syntheticTx(tokens, jitoEnabled)), i * 400)
      }
    }, 800)
    // Steady cadence: 1 tx every 2.2s, whale every ~10s on average
    const id = setInterval(() => pushTx(syntheticTx(tokens, jitoEnabled)), 2200)
    return () => { clearTimeout(burst); clearInterval(id) }
  }, [tokens, jitoEnabled, pushTx])

  return { txEvents, bundles, whaleCount, mevBlockCount, setOnNewTx }
}
