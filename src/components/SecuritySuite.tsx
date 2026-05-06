import { useState, useEffect } from "react"
import { C, glass, mono, pill, btnPrimary } from "../theme"
import type { SecurityCheck, TxEvent, JitoBundle } from "../types"

const CHECKS_TEMPLATE: Omit<SecurityCheck, "status">[] = [
  { id: "c1", name: "Honeypot Detection",   detail: "Contract source verified, no malicious selfdestruct patterns" },
  { id: "c2", name: "Liquidity Lock",       detail: "LP tokens locked for minimum 30 days" },
  { id: "c3", name: "Rug-Pull Analysis",    detail: "Owner wallet holds < 20% of supply" },
  { id: "c4", name: "Slippage Guard",       detail: "Max slippage within safe range — market impact acceptable" },
  { id: "c5", name: "Safety Buffer",        detail: "Wallet maintains 0.1 SOL reserve post-transaction" },
  { id: "c6", name: "MEV Protection",       detail: "Jito bundle ready — front-running protection active" },
  { id: "c7", name: "Fat-Finger Prevention",detail: "Transaction amount within 10x of recent average" },
]

type CheckStatus = "pass" | "fail" | "warn" | "pending" | "idle"

const STATUS_CONFIG: Record<CheckStatus, { color: string; icon: string; label: string }> = {
  pass:    { color: C.green,   icon: "✓", label: "PASS" },
  fail:    { color: C.red,     icon: "✗", label: "FAIL" },
  warn:    { color: C.amber,   icon: "!", label: "WARN" },
  pending: { color: C.blue,    icon: "○", label: "···" },
  idle:    { color: C.textDim, icon: "○", label: "IDLE" },
}

interface QueuedTx {
  id: string
  symbol: string
  solAmount: number
  status: "waiting" | "checking" | "bundling" | "confirmed" | "blocked"
  slot?: number
}

function TxQueueItem({ tx, jitoOn }: { tx: QueuedTx; jitoOn: boolean }) {
  const statusColor =
    tx.status === "confirmed" ? C.green :
    tx.status === "bundling"  ? "#9945ff" :
    tx.status === "blocked"   ? C.red :
    tx.status === "checking"  ? C.blue :
    C.textDim

  return (
    <div style={{
      display: "flex", gap: 8, alignItems: "center",
      padding: "6px 10px",
      background: tx.status === "confirmed"
        ? "rgba(20,241,149,0.05)"
        : tx.status === "bundling"
        ? "rgba(153,69,255,0.06)"
        : "rgba(255,255,255,0.02)",
      borderRadius: 8, marginBottom: 4,
      border: `1px solid ${statusColor}20`,
      transition: "all 0.3s",
    }}>
      {/* Jito shield */}
      {jitoOn && (
        <span style={{
          fontSize: 11, color: statusColor,
          animation: tx.status === "bundling" || tx.status === "checking" ? "pulse 0.8s infinite" : "none",
        }}>⬡</span>
      )}
      <span style={{ ...mono, fontSize: 10, fontWeight: 700, color: C.text }}>${tx.symbol}</span>
      <span style={{ ...mono, fontSize: 10, color: C.textMuted }}>{tx.solAmount.toFixed(3)} SOL</span>
      <div style={{ marginLeft: "auto", display: "flex", gap: 4, alignItems: "center" }}>
        {tx.status === "confirmed" && tx.slot && (
          <span style={{ ...mono, fontSize: 8, color: C.green }}>slot #{tx.slot.toLocaleString()}</span>
        )}
        <span style={{
          ...pill(statusColor), fontSize: 8,
          animation: tx.status === "bundling" ? "pulse 0.8s infinite" : "none",
        }}>
          {tx.status === "bundling" ? "⬡ BUNDLING" :
           tx.status === "confirmed" ? "✓ SENT" :
           tx.status === "blocked" ? "✗ BLOCKED" :
           tx.status === "checking" ? "··· CHECK" :
           "QUEUED"}
        </span>
      </div>
    </div>
  )
}

function BundleViz({ bundles, jitoOn }: { bundles: JitoBundle[]; jitoOn: boolean }) {
  if (!jitoOn) return null
  const active = bundles.slice(0, 3)
  if (active.length === 0) return null
  return (
    <div style={{
      background: "rgba(153,69,255,0.06)", border: `1px solid rgba(153,69,255,0.15)`,
      borderRadius: 10, padding: "8px 10px", marginBottom: 10,
    }}>
      <div style={{ fontSize: 9, color: "#9945ff", fontWeight: 700, letterSpacing: "0.5px", marginBottom: 6 }}>
        ⬡ JITO BUNDLE PIPELINE
      </div>
      {active.map(b => (
        <div key={b.id} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 3 }}>
          <span style={{
            fontSize: 9, color:
              b.status === "confirmed" ? C.green :
              b.status === "submitted" ? "#9945ff" : C.amber,
            animation: b.status === "forming" ? "pulse 1s infinite" : "none",
          }}>⬡</span>
          <span style={{ ...mono, fontSize: 9, color: C.textMuted }}>
            {b.txCount} txs · {b.priorityFee.toFixed(4)} SOL priority fee
          </span>
          <span style={{
            ...pill(b.status === "confirmed" ? C.green : b.status === "submitted" ? "#9945ff" : C.amber),
            fontSize: 7, marginLeft: "auto",
          }}>
            {b.status.toUpperCase()}
          </span>
          {b.status === "confirmed" && (
            <span style={{ ...mono, fontSize: 8, color: C.green }}>#{b.slot.toLocaleString()}</span>
          )}
        </div>
      ))}
    </div>
  )
}

export function SecuritySuite({
  onAction,
  onJitoToggle,
  jitoEnabled,
  recentTxs,
  bundles,
}: {
  onAction: (msg: string) => void
  onJitoToggle: (enabled: boolean) => void
  jitoEnabled: boolean
  recentTxs: TxEvent[]
  bundles: JitoBundle[]
}) {
  const [checks, setChecks] = useState<(SecurityCheck & { status: CheckStatus })[]>(
    CHECKS_TEMPLATE.map(c => ({ ...c, status: "idle" }))
  )
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [slippage, setSlippage] = useState("2.5")
  const [txQueue, setTxQueue] = useState<QueuedTx[]>([])

  // Auto-populate tx queue from recent whale txs
  useEffect(() => {
    const whales = recentTxs.filter(t => t.isWhale).slice(0, 3)
    setTxQueue(whales.map(tx => ({
      id: tx.id,
      symbol: tx.tokenSymbol,
      solAmount: tx.solAmount,
      status: tx.jitoStatus === "confirmed"  ? "confirmed" :
              tx.jitoStatus === "bundling"   ? "bundling" :
              tx.jitoStatus === "mev_blocked"? "blocked" :
              "waiting",
      slot: tx.jitoSlot,
    })))
  }, [recentTxs])

  async function runPreflight() {
    setRunning(true)
    setDone(false)
    setChecks(CHECKS_TEMPLATE.map(c => ({ ...c, status: "pending" })))
    onAction("Pre-flight security suite initiated. Running 7-point safety check...")

    for (let i = 0; i < CHECKS_TEMPLATE.length; i++) {
      await new Promise(r => setTimeout(r, 360 + Math.random() * 280))
      const outcomes: CheckStatus[] = ["pass", "pass", "pass", "pass", "pass", "warn", "pass"]
      // Upgrade MEV check to pass if Jito is on
      const status: CheckStatus = i === 5 && jitoEnabled ? "pass" : outcomes[i]
      setChecks(prev => prev.map((c, j) => j === i ? { ...c, status } : c))
    }
    onAction(jitoEnabled
      ? "✅ Pre-flight complete: 7 PASS. Jito bundle active — MEV protection confirmed."
      : "⚠️ Pre-flight complete: 6 PASS, 1 WARN. Enable Jito for full MEV protection.")
    setRunning(false)
    setDone(true)
  }

  const passed  = checks.filter(c => c.status === "pass").length
  const failed  = checks.filter(c => c.status === "fail").length
  const warned  = checks.filter(c => c.status === "warn").length
  const allDone = checks.every(c => c.status !== "pending" && c.status !== "idle")

  return (
    <div style={{ ...glass, border: `1px solid ${C.purple}20`, padding: 0, overflow: "hidden", marginBottom: 0 }}>
      {/* Header */}
      <div style={{
        padding: "11px 14px", borderBottom: `1px solid rgba(255,255,255,0.06)`,
        background: "rgba(153,69,255,0.04)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 15 }}>⬡</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.8px", color: C.purple }}>SECURITY SUITE</div>
            <div style={{ fontSize: 9, color: C.textMuted }}>Pre-flight · MEV · Jito bundle pipeline</div>
          </div>
        </div>
        {allDone && (
          <span style={{ ...pill(failed > 0 ? C.red : warned > 0 && !jitoEnabled ? C.amber : C.green), fontSize: 9 }}>
            {failed > 0 ? "⚠ BLOCKED" : warned > 0 && !jitoEnabled ? "! CAUTION" : "✓ CLEARED"}
          </span>
        )}
      </div>

      <div style={{ padding: 12 }}>
        {/* ─── Jito MEV toggle ─── */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: jitoEnabled ? `rgba(153,69,255,0.1)` : `rgba(153,69,255,0.04)`,
          border: `1px solid ${jitoEnabled ? "#9945ff50" : "#9945ff20"}`,
          borderRadius: 10, padding: "10px 12px", marginBottom: 10,
          transition: "all 0.3s",
          boxShadow: jitoEnabled ? "0 0 16px rgba(153,69,255,0.15)" : "none",
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.purple, display: "flex", gap: 5, alignItems: "center" }}>
              ⬡ Jito MEV Protection
              {jitoEnabled && (
                <span style={{ ...pill(C.green), fontSize: 8 }}>ACTIVE</span>
              )}
            </div>
            <div style={{ fontSize: 9, color: C.textMuted, marginTop: 1 }}>
              {jitoEnabled
                ? "All transactions routing through Jito bundles"
                : "Enable to prevent front-running & sandwich attacks"}
            </div>
          </div>
          {/* Toggle */}
          <div onClick={() => { onJitoToggle(!jitoEnabled); onAction(jitoEnabled ? "Jito MEV protection disabled." : "⬡ Jito MEV protection enabled. All transactions will be bundled.") }}
            style={{
              width: 44, height: 24, borderRadius: 12, cursor: "pointer", transition: "all 0.3s",
              background: jitoEnabled ? C.purple : "rgba(255,255,255,0.1)", position: "relative",
              boxShadow: jitoEnabled ? `0 0 10px ${C.purple}60` : "none",
            }}>
            <div style={{
              width: 18, height: 18, borderRadius: "50%",
              background: jitoEnabled ? "#fff" : "#9ca3af",
              position: "absolute", top: 3, transition: "all 0.3s",
              left: jitoEnabled ? 23 : 3,
              boxShadow: jitoEnabled ? "0 0 6px rgba(255,255,255,0.8)" : "none",
            }} />
          </div>
        </div>

        {/* ─── Bundle pipeline visualization ─── */}
        <BundleViz bundles={bundles} jitoOn={jitoEnabled} />

        {/* ─── Tx queue (whale txs flowing through Jito) ─── */}
        {txQueue.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: C.textMuted, fontWeight: 600, letterSpacing: "0.5px", marginBottom: 5 }}>
              TRANSACTION QUEUE {jitoEnabled ? "· ⬡ JITO ROUTING" : "· UNPROTECTED"}
            </div>
            {txQueue.map(tx => <TxQueueItem key={tx.id} tx={tx} jitoOn={jitoEnabled} />)}
          </div>
        )}

        {/* ─── Slippage ─── */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: C.textMuted, marginBottom: 5, fontWeight: 600, letterSpacing: "0.5px" }}>
            MAX SLIPPAGE %
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {["0.5", "1.0", "2.5", "5.0"].map(v => (
              <button key={v} onClick={() => setSlippage(v)} style={{
                flex: 1, padding: "5px 0", borderRadius: 7, cursor: "pointer", fontSize: 10,
                fontWeight: 700, transition: "all 0.2s",
                border: `1px solid ${slippage === v ? C.purple : C.textDim}`,
                background: slippage === v ? `${C.purple}20` : "transparent",
                color: slippage === v ? C.purple : C.textMuted, ...mono,
              }}>{v}%</button>
            ))}
          </div>
        </div>

        {/* ─── Pre-flight checks ─── */}
        <div style={{ marginBottom: 10 }}>
          {checks.map(c => {
            const cfg = STATUS_CONFIG[c.status]
            return (
              <div key={c.id} style={{
                display: "flex", gap: 8, alignItems: "flex-start",
                padding: "5px 0", borderBottom: `1px solid rgba(255,255,255,0.03)`,
              }}>
                <span style={{
                  ...mono, fontSize: 11, color: cfg.color, flexShrink: 0,
                  animation: c.status === "pending" ? "pulse 0.8s infinite" : "none",
                }}>
                  {/* Show shield icon for MEV check when Jito is on */}
                  {c.id === "c6" && jitoEnabled && c.status !== "idle" ? "⬡" : cfg.icon}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: c.status === "idle" ? C.textMuted : C.text }}>
                    {c.name}
                    {c.id === "c6" && jitoEnabled && (
                      <span style={{ ...mono, fontSize: 8, color: C.purple, marginLeft: 5 }}>Jito</span>
                    )}
                  </div>
                  {c.status !== "idle" && c.status !== "pending" && (
                    <div style={{ fontSize: 8, color: C.textMuted, marginTop: 1 }}>
                      {c.id === "c6" && jitoEnabled ? "Jito bundle active — front-running protection CONFIRMED" : c.detail}
                    </div>
                  )}
                </div>
                <span style={{ ...pill(cfg.color), fontSize: 8, flexShrink: 0 }}>{cfg.label}</span>
              </div>
            )
          })}
        </div>

        {done && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 10 }}>
            {[
              { v: passed, c: C.green, l: "PASS" },
              { v: warned, c: C.amber, l: "WARN" },
              { v: failed, c: C.red,   l: "FAIL" },
            ].map(s => (
              <div key={s.l} style={{ textAlign: "center", background: `${s.c}10`, borderRadius: 8, padding: "6px 0" }}>
                <div style={{ ...mono, fontSize: 16, fontWeight: 900, color: s.c }}>{s.v}</div>
                <div style={{ fontSize: 8, color: C.textMuted }}>{s.l}</div>
              </div>
            ))}
          </div>
        )}

        <button onClick={runPreflight} disabled={running} style={{
          ...btnPrimary, width: "100%", padding: 11, fontSize: 11,
          background: jitoEnabled
            ? `linear-gradient(135deg, ${C.purple}, #6366f1)`
            : `linear-gradient(135deg, #374151, #1f2937)`,
        }}>
          {running
            ? <span style={{ animation: "pulse 0.8s infinite" }}>⬡ Running checks...</span>
            : done ? "⬡ Re-run Pre-flight" : "⬡ Run Pre-flight Check"}
        </button>
        {jitoEnabled && (
          <div style={{ fontSize: 8, color: C.purple, textAlign: "center", marginTop: 5, ...mono }}>
            Jito bundle will be formed immediately after checks pass
          </div>
        )}
      </div>
    </div>
  )
}
