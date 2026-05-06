import { useRef, useEffect, useState } from "react"
import { C, glass, mono, pill } from "../theme"
import type { TxEvent, JitoBundle } from "../types"

const TX_CONFIG: Record<string, { color: string; icon: string; label: string; bg: string }> = {
  whale_buy:   { color: "#f59e0b", icon: "🐋", label: "WHALE BUY",  bg: "rgba(245,158,11,0.07)" },
  whale_sell:  { color: "#ff3366", icon: "🐳", label: "WHALE SELL", bg: "rgba(255,51,102,0.07)" },
  graduation:  { color: "#14f195", icon: "🎓", label: "GRADUATED",  bg: "rgba(20,241,149,0.08)" },
  new_listing: { color: "#9945ff", icon: "🚀", label: "NEW TOKEN",  bg: "rgba(153,69,255,0.07)" },
  normal_buy:  { color: "#6b7280", icon: "▲",  label: "BUY",        bg: "transparent" },
  normal_sell: { color: "#6b7280", icon: "▼",  label: "SELL",       bg: "transparent" },
  rug_alert:   { color: "#ff3366", icon: "☠",  label: "RUG ALERT",  bg: "rgba(255,51,102,0.12)" },
}

const JITO_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  bypassed:    { color: "#374151", icon: "○",  label: "unprotected" },
  pending:     { color: "#6b7280", icon: "◌",  label: "pending" },
  bundling:    { color: "#9945ff", icon: "⬡",  label: "bundling…" },
  confirmed:   { color: "#14f195", icon: "⬡",  label: "bundled" },
  mev_blocked: { color: "#f59e0b", icon: "⚡", label: "MEV blocked!" },
}

function JitoStatusBadge({ status, slot }: { status: TxEvent["jitoStatus"]; slot?: number }) {
  const cfg = JITO_CONFIG[status]
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      <span style={{ fontSize: 9, color: cfg.color, animation: status === "bundling" ? "pulse 1s infinite" : "none" }}>
        {cfg.icon}
      </span>
      <span style={{ fontSize: 8, color: cfg.color, ...mono, fontWeight: status === "mev_blocked" ? 700 : 400 }}>
        {status === "confirmed" && slot ? `#${slot.toLocaleString()}` : cfg.label}
      </span>
    </div>
  )
}

function CopyTradeBtn({ tx, onCopy, alreadyCopied }: {
  tx: TxEvent
  onCopy: (tx: TxEvent) => void
  alreadyCopied: boolean
}) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onCopy(tx) }}
      disabled={alreadyCopied}
      title={alreadyCopied ? "Already queued" : "Copy this trade through Security Suite"}
      style={{
        padding: "3px 8px",
        borderRadius: 6,
        border: `1px solid ${alreadyCopied ? C.textDim : "#f59e0b50"}`,
        background: alreadyCopied ? "transparent" : "rgba(245,158,11,0.08)",
        color: alreadyCopied ? C.textDim : "#f59e0b",
        cursor: alreadyCopied ? "default" : "pointer",
        fontSize: 8, fontWeight: 700,
        letterSpacing: "0.3px",
        transition: "all 0.2s",
        flexShrink: 0,
        display: "flex", alignItems: "center", gap: 3,
        whiteSpace: "nowrap",
      }}
    >
      {alreadyCopied ? "✓ queued" : "📋 Copy Trade"}
    </button>
  )
}

function TxRow({ tx, flash, onCopyTrade, copiedIds }: {
  tx: TxEvent
  flash: boolean
  onCopyTrade?: (tx: TxEvent) => void
  copiedIds: Set<string>
}) {
  const cfg = TX_CONFIG[tx.type] || TX_CONFIG.normal_buy
  const ts = new Date(tx.timestamp).toTimeString().slice(0, 8)
  const showDetail = tx.isWhale || tx.type === "graduation" || tx.type === "new_listing" || tx.mevBlocked
  const showCopy = tx.type === "whale_buy" && !!onCopyTrade

  return (
    <div style={{
      padding: "7px 14px",
      background: flash ? cfg.bg : "transparent",
      borderBottom: `1px solid rgba(255,255,255,0.04)`,
      animation: flash ? "fadeIn 0.3s ease" : "none",
      transition: "background 0.6s",
    }}>
      <div style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
        {/* Timestamp */}
        <span style={{ ...mono, fontSize: 8, color: C.textDim, paddingTop: 2, flexShrink: 0, width: 50 }}>
          {ts}
        </span>

        {/* Type badge */}
        <div style={{ flexShrink: 0, paddingTop: 1 }}>
          <span style={{ ...pill(cfg.color), fontSize: 8, display: "inline-flex", alignItems: "center", gap: 3 }}>
            <span>{cfg.icon}</span>
            {showDetail && <span>{cfg.label}</span>}
          </span>
        </div>

        {/* Token + wallet */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ ...mono, fontSize: 11, fontWeight: 700, color: cfg.color }}>${tx.tokenSymbol}</span>
            <span style={{ ...mono, fontSize: 11, fontWeight: 700 }}>
              {tx.solAmount.toFixed(tx.solAmount >= 10 ? 1 : 3)} SOL
            </span>
            {tx.isWhale && (
              <span style={{ fontSize: 8, color: "#f59e0b" }}>(${tx.usdAmount.toFixed(0)})</span>
            )}
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 2 }}>
            <span style={{ ...mono, fontSize: 8, color: C.textMuted }}>{tx.walletAddr}</span>
            {tx.bondingDelta > 0.5 && (
              <span style={{ fontSize: 8, color: "#9945ff" }}>+{tx.bondingDelta.toFixed(1)}% curve</span>
            )}
          </div>
        </div>

        {/* Right side: Jito badge + Copy button */}
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <JitoStatusBadge status={tx.jitoStatus} slot={tx.jitoSlot} />
          {showCopy && (
            <CopyTradeBtn tx={tx} onCopy={onCopyTrade!} alreadyCopied={copiedIds.has(tx.id)} />
          )}
        </div>
      </div>

      {/* MEV blocked callout */}
      {tx.mevBlocked && (
        <div style={{
          marginTop: 5, marginLeft: 57, padding: "4px 8px",
          background: "rgba(245,158,11,0.1)", borderRadius: 6,
          border: `1px solid rgba(245,158,11,0.2)`,
        }}>
          <span style={{ fontSize: 9, color: "#f59e0b", fontWeight: 700 }}>
            ⚡ Jito blocked front-run — saved ~${(tx.usdAmount * 0.015).toFixed(2)} from MEV bot
          </span>
        </div>
      )}
    </div>
  )
}

function BundleRow({ bundle }: { bundle: JitoBundle }) {
  const statusColor = bundle.status === "confirmed" ? C.green : bundle.status === "submitted" ? "#9945ff" : C.amber
  return (
    <div style={{
      padding: "6px 14px",
      background: `${statusColor}06`,
      borderBottom: `1px solid rgba(255,255,255,0.04)`,
      display: "flex", gap: 8, alignItems: "center",
    }}>
      <span style={{ fontSize: 9, color: statusColor, animation: bundle.status === "forming" ? "pulse 1s infinite" : "none" }}>⬡</span>
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: statusColor, ...mono }}>BUNDLE {bundle.status.toUpperCase()}</span>
        <span style={{ fontSize: 9, color: C.textMuted, marginLeft: 6 }}>
          {bundle.txCount} txs · {bundle.priorityFee.toFixed(4)} SOL fee
          {bundle.status === "confirmed" && ` · slot #${bundle.slot.toLocaleString()}`}
        </span>
      </div>
      {bundle.savedFromMev > 0 && (
        <span style={{ ...pill("#f59e0b"), fontSize: 8 }}>saved ${bundle.savedFromMev.toFixed(2)}</span>
      )}
    </div>
  )
}

export function WhaleFeed({ txEvents, bundles, whaleCount, mevBlockCount, jitoEnabled, onCopyTrade, copiedIds }: {
  txEvents: TxEvent[]
  bundles: JitoBundle[]
  whaleCount: number
  mevBlockCount: number
  jitoEnabled: boolean
  onCopyTrade?: (tx: TxEvent) => void
  copiedIds?: Set<string>
}) {
  const [filter, setFilter] = useState<"all" | "whales" | "bundles">("all")
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set())
  const prevLen = useRef(0)
  const effectiveCopied = copiedIds ?? new Set<string>()

  useEffect(() => {
    if (txEvents.length > prevLen.current) {
      const newIds = txEvents.slice(0, txEvents.length - prevLen.current).map(t => t.id)
      setFlashIds(new Set(newIds))
      const t = setTimeout(() => setFlashIds(new Set()), 800)
      prevLen.current = txEvents.length
      return () => clearTimeout(t)
    }
  }, [txEvents])

  const displayed =
    filter === "all"     ? txEvents :
    filter === "whales"  ? txEvents.filter(t => t.isWhale) :
    txEvents.filter(t => t.jitoStatus === "confirmed" || t.jitoStatus === "bundling" || t.jitoStatus === "mev_blocked")

  return (
    <div style={{ ...glass, padding: 0, overflow: "hidden", border: `1px solid rgba(245,158,11,0.15)`, marginBottom: 0 }}>
      {/* Header */}
      <div style={{
        padding: "11px 14px", borderBottom: `1px solid rgba(255,255,255,0.06)`,
        background: "rgba(245,158,11,0.04)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 8px #f59e0b", animation: "pulse 2s infinite" }} />
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", letterSpacing: "0.8px" }}>LIVE TRANSACTION FEED</span>
            <span style={{ fontSize: 9, color: C.textMuted, marginLeft: 6 }}>Bags.fm mempool</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {jitoEnabled && <span style={{ ...pill("#9945ff"), fontSize: 8 }}>⬡ Jito ON</span>}
          <span style={{ ...mono, fontSize: 9, color: C.textMuted }}>{txEvents.length} txs</span>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: "flex", borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
        {[
          { label: "Whales",     value: whaleCount,      color: "#f59e0b" },
          { label: "MEV Blocks", value: mevBlockCount,   color: "#9945ff" },
          { label: "Total Txs",  value: txEvents.length, color: C.textMuted },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, textAlign: "center", padding: "7px 0", borderRight: `1px solid rgba(255,255,255,0.04)` }}>
            <div style={{ ...mono, fontSize: 14, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 8, color: C.textMuted, marginTop: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Copy Trade hint when whale rows exist */}
      {onCopyTrade && txEvents.some(t => t.type === "whale_buy") && (
        <div style={{
          padding: "5px 14px",
          background: "rgba(245,158,11,0.04)",
          borderBottom: `1px solid rgba(255,255,255,0.04)`,
          fontSize: 8, color: "#f59e0b80",
        }}>
          📋 Click <strong style={{ color: "#f59e0b" }}>Copy Trade</strong> on any whale buy to run the Security Suite pre-flight and queue a follow-on
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
        {(["all", "whales", "bundles"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            flex: 1, padding: "6px 0", border: "none", cursor: "pointer", fontSize: 9,
            fontWeight: 700, letterSpacing: "0.4px", transition: "all 0.2s",
            background: filter === f ? "rgba(255,255,255,0.05)" : "transparent",
            color: filter === f ? (f === "whales" ? "#f59e0b" : f === "bundles" ? "#9945ff" : C.green) : C.textMuted,
            borderBottom: filter === f
              ? `2px solid ${f === "whales" ? "#f59e0b" : f === "bundles" ? "#9945ff" : C.green}`
              : "2px solid transparent",
          }}>
            {f === "all" ? "🔴 ALL" : f === "whales" ? "🐋 WHALES" : "⬡ BUNDLES"}
          </button>
        ))}
      </div>

      {/* Bundle rows */}
      {filter === "bundles" && (
        <div>
          {bundles.length === 0 ? (
            <div style={{ padding: "20px 14px", textAlign: "center", fontSize: 10, color: C.textMuted }}>
              {jitoEnabled ? "Waiting for transactions to bundle…" : "Enable Jito MEV Protection to see bundles"}
            </div>
          ) : bundles.map(b => <BundleRow key={b.id} bundle={b} />)}
        </div>
      )}

      {/* Transaction list */}
      {filter !== "bundles" && (
        <div style={{ height: 340, overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: `${C.border} transparent` }}>
          {displayed.length === 0 ? (
            <div style={{ padding: "30px 14px", textAlign: "center", fontSize: 10, color: C.textMuted }}>
              Connecting to Bags.fm mempool…
            </div>
          ) : displayed.map(tx => (
            <TxRow
              key={tx.id} tx={tx}
              flash={flashIds.has(tx.id)}
              onCopyTrade={onCopyTrade}
              copiedIds={effectiveCopied}
            />
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{
        padding: "6px 14px", borderTop: `1px solid rgba(255,255,255,0.04)`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "rgba(0,0,0,0.2)",
      }}>
        <span style={{ fontSize: 8, color: C.textDim, ...mono }}>
          Whale ≥8 SOL · 📋 Copy Trade routes through Security Suite
        </span>
        <span style={{ fontSize: 8, color: jitoEnabled ? "#9945ff" : C.textDim }}>
          {jitoEnabled ? "⬡ MEV protection active" : "MEV protection off"}
        </span>
      </div>
    </div>
  )
}
