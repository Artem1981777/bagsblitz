import { C, glass, mono, pill, btnPrimary } from "../theme"
import type { TradeQueueEntry } from "../types"

const STATUS_CFG = {
  validating: { color: "#9945ff", label: "VALIDATING",  icon: "⬡", pulse: true  },
  queued:     { color: "#14f195", label: "READY",        icon: "◉", pulse: false },
  blocked:    { color: "#ff3366", label: "BLOCKED",      icon: "✗", pulse: false },
  executed:   { color: "#6b7280", label: "EXECUTED",     icon: "✓", pulse: false },
  dismissed:  { color: "#374151", label: "DISMISSED",    icon: "○", pulse: false },
}

const REC_CFG = {
  SAFE:     { color: "#14f195", bg: "rgba(20,241,149,0.08)",  icon: "✓" },
  CAUTION:  { color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  icon: "!" },
  CRITICAL: { color: "#ff3366", bg: "rgba(255,51,102,0.10)",  icon: "✗" },
}

function HoneypotBadge({ score, rec }: { score: number; rec: "SAFE" | "CAUTION" | "CRITICAL" }) {
  const cfg = REC_CFG[rec]
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: cfg.bg, border: `1px solid ${cfg.color}30`,
      borderRadius: 6, padding: "2px 7px",
    }}>
      <span style={{ fontSize: 9, color: cfg.color, fontWeight: 700 }}>{cfg.icon}</span>
      <span style={{ fontSize: 8, color: cfg.color, fontWeight: 700, ...mono }}>
        {rec} · rug {score}/100
      </span>
    </div>
  )
}

function QueueEntry({ entry, onExecute, onDismiss }: {
  entry: TradeQueueEntry
  onExecute: (id: string) => void
  onDismiss: (id: string) => void
}) {
  const sc = STATUS_CFG[entry.status]
  const isBlocked  = entry.status === "blocked"
  const isQueued   = entry.status === "queued"
  const isValidating = entry.status === "validating"
  const isDone     = entry.status === "executed"

  const borderColor = isBlocked ? "#ff336630" : isQueued ? "#14f19530" : "#9945ff20"

  return (
    <div style={{
      padding: "10px 12px",
      background: isBlocked ? "rgba(255,51,102,0.04)" : isQueued ? "rgba(20,241,149,0.03)" : "rgba(153,69,255,0.03)",
      border: `1px solid ${borderColor}`,
      borderRadius: 10, marginBottom: 6,
      transition: "all 0.3s",
      opacity: isDone ? 0.5 : 1,
    }}>
      {/* Top row */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
        <span style={{
          fontSize: 10, color: sc.color,
          animation: sc.pulse ? "pulse 0.8s infinite" : "none",
        }}>{sc.icon}</span>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <span style={{ ...mono, fontSize: 11, fontWeight: 700, color: C.text }}>
              ${entry.sourceTx.tokenSymbol}
            </span>
            <span style={{ fontSize: 9, color: C.textMuted }}>
              {entry.triggeredBy === "copy" ? "📋 Copy Trade" : "🤖 Proactive"}
            </span>
            <span style={{ ...pill(sc.color), fontSize: 7, marginLeft: "auto" }}>
              {sc.label}
            </span>
          </div>
          <div style={{ fontSize: 9, color: C.textMuted, marginTop: 1 }}>
            Whale: {entry.sourceTx.solAmount.toFixed(1)} SOL · Source: {entry.sourceTx.walletAddr}
          </div>
        </div>
      </div>

      {/* Validation spinner */}
      {isValidating && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6, padding: "6px 8px",
          background: "rgba(153,69,255,0.06)", borderRadius: 7,
          marginBottom: 6,
        }}>
          <span style={{ fontSize: 10, color: "#9945ff", animation: "pulse 0.8s infinite" }}>⬡</span>
          <span style={{ fontSize: 9, color: "#9945ff" }}>
            Running Honeypot & Liquidity check…
          </span>
        </div>
      )}

      {/* Honeypot result */}
      {entry.honeypot && (
        <div style={{
          padding: "7px 8px", borderRadius: 8,
          background: REC_CFG[entry.honeypot.recommendation].bg,
          border: `1px solid ${REC_CFG[entry.honeypot.recommendation].color}25`,
          marginBottom: 6,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: C.textMuted, letterSpacing: "0.5px" }}>
              SECURITY RESULT
            </span>
            <HoneypotBadge score={entry.honeypot.rugScore} rec={entry.honeypot.recommendation} />
          </div>
          {entry.honeypot.findings.slice(0, 2).map((f, i) => (
            <div key={i} style={{ fontSize: 9, color: C.textMuted, marginTop: 2 }}>
              <span style={{ color: entry.honeypot!.recommendation === "CRITICAL" ? "#ff3366" : "#f59e0b", marginRight: 4 }}>
                {entry.honeypot!.recommendation === "CRITICAL" ? "✗" : "!"}
              </span>
              {f}
            </div>
          ))}
          {entry.honeypot.recommendation === "SAFE" && entry.honeypot.findings.map((f, i) => (
            <div key={i} style={{ fontSize: 9, color: C.textMuted, marginTop: 2 }}>
              <span style={{ color: "#14f195", marginRight: 4 }}>✓</span>{f}
            </div>
          ))}
        </div>
      )}

      {/* CRITICAL WARNING banner */}
      {isBlocked && (
        <div style={{
          padding: "7px 10px", borderRadius: 8, marginBottom: 8,
          background: "rgba(255,51,102,0.1)", border: "1px solid rgba(255,51,102,0.3)",
        }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: "#ff3366", letterSpacing: "0.5px" }}>
            🔴 CRITICAL — TRADE BLOCKED BY SECURITY SUITE
          </span>
          <div style={{ fontSize: 9, color: "#ff666680", marginTop: 2 }}>
            Agent has refused to queue this trade. Manual override disabled.
          </div>
        </div>
      )}

      {/* Action row */}
      {!isDone && !isValidating && (
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {isQueued && (
            <>
              <div style={{ display: "flex", flexDirection: "column", marginRight: 4 }}>
                <span style={{ fontSize: 8, color: C.textMuted }}>SUGGESTED SIZE</span>
                <span style={{ ...mono, fontSize: 13, fontWeight: 800, color: C.green }}>
                  {entry.suggestedSol} SOL
                </span>
                {entry.jitoEnabled && (
                  <span style={{ fontSize: 8, color: "#9945ff", marginTop: 1 }}>⬡ via Jito bundle</span>
                )}
              </div>
              <button onClick={() => onExecute(entry.id)} style={{
                ...btnPrimary, flex: 1, padding: "8px 0", fontSize: 10, fontWeight: 700,
                background: `linear-gradient(135deg, #14f195, #10b981)`,
                color: "#000",
              }}>
                ▶ Execute Follow-on
              </button>
            </>
          )}
          <button onClick={() => onDismiss(entry.id)} style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8, padding: "7px 10px", color: C.textMuted, cursor: "pointer",
            fontSize: 9, fontWeight: 600, transition: "all 0.2s",
          }}>
            ✕ Dismiss
          </button>
        </div>
      )}

      {isDone && (
        <div style={{ fontSize: 9, color: C.textMuted, ...mono }}>
          ✓ Executed · {entry.jitoEnabled ? "⬡ Jito bundle" : "direct tx"}
        </div>
      )}
    </div>
  )
}

export function TradeQueue({ queue, onExecute, onDismiss }: {
  queue: TradeQueueEntry[]
  onExecute: (id: string) => void
  onDismiss: (id: string) => void
}) {
  const pendingCount  = queue.filter(e => e.status === "queued").length
  const blockedCount  = queue.filter(e => e.status === "blocked").length
  const activeCount   = queue.filter(e => e.status === "validating").length

  if (queue.length === 0) return (
    <div style={{ ...glass, border: `1px solid rgba(20,241,149,0.1)`, padding: "18px 14px", textAlign: "center" }}>
      <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>◉ Trade queue is empty</div>
      <div style={{ fontSize: 9, color: C.textDim }}>
        Whale buys trigger automatic validation · Copy Trade adds manual entries
      </div>
    </div>
  )

  return (
    <div style={{ ...glass, padding: 0, overflow: "hidden", border: `1px solid rgba(20,241,149,0.12)` }}>
      {/* Header */}
      <div style={{
        padding: "10px 14px", borderBottom: `1px solid rgba(255,255,255,0.06)`,
        background: "linear-gradient(135deg,rgba(20,241,149,0.04),rgba(153,69,255,0.04))",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: 10, color: C.green, animation: activeCount > 0 ? "pulse 1s infinite" : "none" }}>◉</span>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.6px", color: C.text }}>TRADE QUEUE</span>
          {activeCount > 0 && (
            <span style={{ ...pill("#9945ff"), fontSize: 8 }}>⬡ {activeCount} validating</span>
          )}
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {pendingCount > 0 && <span style={{ ...pill(C.green), fontSize: 8 }}>{pendingCount} ready</span>}
          {blockedCount > 0 && <span style={{ ...pill("#ff3366"), fontSize: 8 }}>🔴 {blockedCount} blocked</span>}
        </div>
      </div>

      <div style={{ padding: 10, maxHeight: 420, overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: `${C.border} transparent` }}>
        {queue.map(e => (
          <QueueEntry key={e.id} entry={e} onExecute={onExecute} onDismiss={onDismiss} />
        ))}
      </div>

      {/* Execute-all footer */}
      {pendingCount > 1 && (
        <div style={{ padding: "8px 10px", borderTop: `1px solid rgba(255,255,255,0.06)` }}>
          <button
            onClick={() => queue.filter(e => e.status === "queued").forEach(e => onExecute(e.id))}
            style={{
              ...btnPrimary, width: "100%", padding: 9, fontSize: 10,
              background: `linear-gradient(135deg, #14f195, #10b981)`, color: "#000",
            }}
          >
            ▶▶ Execute All ({pendingCount}) Validated Trades
          </button>
        </div>
      )}
    </div>
  )
}
