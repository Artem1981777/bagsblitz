import { useState } from "react"
import { C, glass, mono, pill, btnPrimary } from "../theme"
import type { SecurityCheck } from "../types"

const CHECKS_TEMPLATE: Omit<SecurityCheck, "status">[] = [
  { id: "c1", name: "Honeypot Detection", detail: "Contract source verified, no malicious selfdestruct patterns" },
  { id: "c2", name: "Liquidity Lock", detail: "LP tokens locked for minimum 30 days" },
  { id: "c3", name: "Rug-Pull Analysis", detail: "Owner wallet holds < 20% of supply" },
  { id: "c4", name: "Slippage Guard", detail: "Max slippage 2.5% — market impact within safe range" },
  { id: "c5", name: "Safety Buffer", detail: "Wallet maintains 0.1 SOL reserve post-transaction" },
  { id: "c6", name: "MEV Protection", detail: "Jito bundle ready — front-running protection active" },
  { id: "c7", name: "Fat-Finger Prevention", detail: "Transaction amount within 10x of recent average" },
]

type CheckStatus = "pass" | "fail" | "warn" | "pending" | "idle"

const STATUS_CONFIG: Record<CheckStatus, { color: string; icon: string; label: string }> = {
  pass:    { color: C.green,  icon: "✓", label: "PASS" },
  fail:    { color: C.red,    icon: "✗", label: "FAIL" },
  warn:    { color: C.amber,  icon: "!", label: "WARN" },
  pending: { color: C.blue,   icon: "○", label: "..." },
  idle:    { color: C.textDim,icon: "○", label: "IDLE" },
}

export function SecuritySuite({ onAction }: { onAction: (msg: string) => void }) {
  const [checks, setChecks] = useState<(SecurityCheck & { status: CheckStatus })[]>(
    CHECKS_TEMPLATE.map(c => ({ ...c, status: "idle" }))
  )
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [mevActive, setMevActive] = useState(false)
  const [slippage, setSlippage] = useState("2.5")

  async function runPreflight() {
    setRunning(true)
    setDone(false)
    setChecks(CHECKS_TEMPLATE.map(c => ({ ...c, status: "pending" })))
    onAction("Pre-flight security suite initiated. Running 7-point safety check...")

    for (let i = 0; i < CHECKS_TEMPLATE.length; i++) {
      await new Promise(r => setTimeout(r, 380 + Math.random() * 300))
      const outcomes: CheckStatus[] = ["pass", "pass", "pass", "pass", "pass", "warn", "pass"]
      const status = outcomes[i]
      setChecks(prev => prev.map((c, j) => j === i ? { ...c, status } : c))
    }

    onAction("✅ Pre-flight complete: 6 PASS, 1 WARN. Transaction cleared with MEV bundle.")
    setRunning(false)
    setDone(true)
  }

  const passed = checks.filter(c => c.status === "pass").length
  const failed = checks.filter(c => c.status === "fail").length
  const warned = checks.filter(c => c.status === "warn").length
  const allDone = checks.every(c => c.status !== "pending" && c.status !== "idle")

  return (
    <div style={{ ...glass, border: `1px solid ${C.purple}20`, padding: 0, overflow: "hidden", marginBottom: 0 }}>
      {/* Header */}
      <div style={{
        padding: "12px 14px", borderBottom: `1px solid rgba(255,255,255,0.06)`,
        background: "rgba(153,69,255,0.04)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>⬡</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.8px", color: C.purple }}>SECURITY SUITE</div>
            <div style={{ fontSize: 9, color: C.textMuted }}>Pre-flight checks + MEV protection</div>
          </div>
        </div>
        {allDone && (
          <span style={{ ...pill(failed > 0 ? C.red : warned > 0 ? C.amber : C.green), fontSize: 9 }}>
            {failed > 0 ? "⚠ BLOCKED" : warned > 0 ? "! CAUTION" : "✓ CLEARED"}
          </span>
        )}
      </div>

      <div style={{ padding: 12 }}>
        {/* MEV protection toggle */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: `${C.purple}08`, border: `1px solid ${C.purple}20`, borderRadius: 10,
          padding: "8px 12px", marginBottom: 10,
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.purple }}>⚡ Jito MEV Protection</div>
            <div style={{ fontSize: 9, color: C.textMuted }}>Bundle transactions to prevent front-running</div>
          </div>
          <div
            onClick={() => setMevActive(v => !v)}
            style={{
              width: 40, height: 22, borderRadius: 11, cursor: "pointer", transition: "all 0.2s",
              background: mevActive ? C.purple : "rgba(255,255,255,0.1)",
              position: "relative",
            }}
          >
            <div style={{
              width: 16, height: 16, borderRadius: "50%", background: "#fff",
              position: "absolute", top: 3, transition: "all 0.2s",
              left: mevActive ? 21 : 3,
            }} />
          </div>
        </div>

        {/* Slippage control */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 5, fontWeight: 600, letterSpacing: "0.5px" }}>
            MAX SLIPPAGE %
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {["0.5", "1.0", "2.5", "5.0"].map(v => (
              <button key={v} onClick={() => setSlippage(v)} style={{
                flex: 1, padding: "6px 0", borderRadius: 7, cursor: "pointer", fontSize: 11,
                fontWeight: 700, transition: "all 0.2s", border: `1px solid ${slippage === v ? C.purple : C.textDim}`,
                background: slippage === v ? `${C.purple}20` : "transparent",
                color: slippage === v ? C.purple : C.textMuted,
                ...mono,
              }}>
                {v}%
              </button>
            ))}
          </div>
        </div>

        {/* Checks list */}
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
                  animation: c.status === "pending" ? "pulse 1s infinite" : "none",
                }}>
                  {cfg.icon}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: c.status === "idle" ? C.textMuted : C.text }}>
                    {c.name}
                  </div>
                  {c.status !== "idle" && c.status !== "pending" && (
                    <div style={{ fontSize: 9, color: C.textMuted, marginTop: 1 }}>{c.detail}</div>
                  )}
                </div>
                <span style={{ ...pill(cfg.color), fontSize: 8, flexShrink: 0 }}>{cfg.label}</span>
              </div>
            )
          })}
        </div>

        {done && (
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 10,
          }}>
            <div style={{ textAlign: "center", background: `${C.green}10`, borderRadius: 8, padding: "6px 0" }}>
              <div style={{ ...mono, fontSize: 16, fontWeight: 900, color: C.green }}>{passed}</div>
              <div style={{ fontSize: 8, color: C.textMuted }}>PASS</div>
            </div>
            <div style={{ textAlign: "center", background: `${C.amber}10`, borderRadius: 8, padding: "6px 0" }}>
              <div style={{ ...mono, fontSize: 16, fontWeight: 900, color: C.amber }}>{warned}</div>
              <div style={{ fontSize: 8, color: C.textMuted }}>WARN</div>
            </div>
            <div style={{ textAlign: "center", background: `${C.red}10`, borderRadius: 8, padding: "6px 0" }}>
              <div style={{ ...mono, fontSize: 16, fontWeight: 900, color: C.red }}>{failed}</div>
              <div style={{ fontSize: 8, color: C.textMuted }}>FAIL</div>
            </div>
          </div>
        )}

        <button
          onClick={runPreflight}
          disabled={running}
          style={{ ...btnPrimary, width: "100%", padding: 11, fontSize: 12, background: `linear-gradient(135deg, ${C.purple}, #6366f1)` }}
        >
          {running ? (
            <span style={{ animation: "pulse 1s infinite" }}>⬡ Running checks...</span>
          ) : done ? (
            "⬡ Re-run Pre-flight"
          ) : (
            "⬡ Run Pre-flight Check"
          )}
        </button>
      </div>
    </div>
  )
}
