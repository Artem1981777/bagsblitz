import { useState } from "react"
import { C, glass, mono, pill, btnPrimary } from "../theme"
import type { YieldPosition, RoyaltyEntry } from "../types"

const fmt = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + "K" : n.toFixed(0)

function ProtocolBadge({ p }: { p: string }) {
  const isMeteora = p.includes("Meteora")
  return (
    <span style={{
      ...pill(isMeteora ? "#3b82f6" : "#10b981"),
      fontSize: 9,
    }}>
      {isMeteora ? "🌊" : "🏛"} {p}
    </span>
  )
}

function StatusBadge({ s }: { s: string }) {
  const c = s === "active" ? C.green : s === "rebalancing" ? C.amber : C.textMuted
  return (
    <span style={{ ...pill(c), fontSize: 9, display: "inline-flex", alignItems: "center", gap: 3 }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: c, animation: s === "active" ? "pulse 2s infinite" : "none", display: "inline-block" }} />
      {s.toUpperCase()}
    </span>
  )
}

export function YieldOptimizer({ positions, royalties, onAction }: {
  positions: YieldPosition[]
  royalties: RoyaltyEntry[]
  onAction: (msg: string) => void
}) {
  const [tab, setTab] = useState<"positions" | "royalties">("positions")
  const [claiming, setClaiming] = useState(false)

  const totalTVL = positions.reduce((s, p) => s + p.tvl, 0)
  const totalEarned = positions.reduce((s, p) => s + p.earned, 0)
  const totalRoyalties = royalties.reduce((s, r) => s + r.usdValue, 0)
  const avgApy = positions.reduce((s, p) => s + p.apy, 0) / positions.length

  async function claimAll() {
    setClaiming(true)
    onAction("Claiming all royalties and routing to yield optimizer...")
    await new Promise(r => setTimeout(r, 1800))
    onAction(`✅ Claimed ${royalties.length} royalty streams. +${totalEarned.toFixed(3)} SOL deposited into Meteora DLMM`)
    setClaiming(false)
  }

  return (
    <div style={{ ...glass, border: `1px solid #10b98130`, padding: 0, overflow: "hidden", marginBottom: 0 }}>
      {/* Header */}
      <div style={{
        padding: "12px 14px", borderBottom: `1px solid rgba(255,255,255,0.06)`,
        background: "rgba(16,185,129,0.04)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>◈</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.8px", color: "#10b981" }}>YIELD OPTIMIZER</div>
            <div style={{ fontSize: 9, color: C.textMuted }}>Royalties → DeFi Auto-Reinvestment</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ ...mono, fontSize: 14, fontWeight: 700, color: "#10b981" }}>${fmt(totalTVL)}</div>
          <div style={{ fontSize: 9, color: C.textMuted }}>Total TVL</div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
        {[
          { label: "Avg APY", value: avgApy.toFixed(1) + "%", color: "#10b981" },
          { label: "DeFi Earned", value: totalEarned.toFixed(3) + " SOL", color: C.green },
          { label: "Royalties", value: "$" + totalRoyalties.toFixed(2), color: C.amber },
        ].map(s => (
          <div key={s.label} style={{ padding: "10px 14px", textAlign: "center", borderRight: `1px solid rgba(255,255,255,0.04)` }}>
            <div style={{ ...mono, fontSize: 13, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 9, color: C.textMuted, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
        {(["positions", "royalties"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "8px 0", background: tab === t ? "rgba(16,185,129,0.08)" : "transparent",
            border: "none", color: tab === t ? "#10b981" : C.textMuted,
            fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: "0.5px",
            borderBottom: tab === t ? `2px solid #10b981` : "2px solid transparent",
          }}>
            {t === "positions" ? "🌊 DeFi Positions" : "💎 Royalty Streams"}
          </button>
        ))}
      </div>

      <div style={{ padding: 12 }}>
        {tab === "positions" && (
          <div>
            {positions.map(p => (
              <div key={p.id} style={{
                background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 10,
                marginBottom: 6, border: `1px solid rgba(255,255,255,0.06)`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 3 }}>
                      {p.tokenA}/{p.tokenB}
                    </div>
                    <ProtocolBadge p={p.protocol} />
                  </div>
                  <StatusBadge s={p.status} />
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <div>
                    <div style={{ ...mono, fontSize: 11, color: "#10b981", fontWeight: 700 }}>{p.apy.toFixed(1)}%</div>
                    <div style={{ fontSize: 9, color: C.textMuted }}>APY</div>
                  </div>
                  <div>
                    <div style={{ ...mono, fontSize: 11, fontWeight: 700 }}>${p.tvl.toLocaleString()}</div>
                    <div style={{ fontSize: 9, color: C.textMuted }}>TVL</div>
                  </div>
                  <div>
                    <div style={{ ...mono, fontSize: 11, color: C.green, fontWeight: 700 }}>+{p.earned.toFixed(3)} SOL</div>
                    <div style={{ fontSize: 9, color: C.textMuted }}>Earned</div>
                  </div>
                </div>
                {/* APY bar */}
                <div style={{ marginTop: 8, background: "rgba(255,255,255,0.05)", borderRadius: 3, height: 3 }}>
                  <div style={{
                    background: `linear-gradient(90deg, #10b981, ${C.green})`,
                    height: 3, borderRadius: 3,
                    width: Math.min(p.apy, 100) + "%",
                    transition: "width 1s",
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "royalties" && (
          <div>
            {royalties.map((r, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 0", borderBottom: `1px solid rgba(255,255,255,0.04)`,
              }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ ...mono, fontSize: 11, color: C.green, fontWeight: 700 }}>${r.tokenSymbol}</span>
                  <span style={{ fontSize: 10, color: C.textMuted }}>{r.tokenName}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ ...mono, fontSize: 11, fontWeight: 700, color: C.amber }}>+${r.usdValue.toFixed(2)}</div>
                  <div style={{ fontSize: 9, color: C.textMuted }}>
                    {r.reinvested ? <span style={{ color: "#10b981" }}>◈ reinvested</span> : "pending"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={claimAll}
          disabled={claiming}
          style={{ ...btnPrimary, width: "100%", marginTop: 10, padding: 11, fontSize: 12, background: "linear-gradient(135deg, #10b981, #059669)" }}
        >
          {claiming ? "⏳ Claiming & Routing..." : "◈ Claim All & Auto-Reinvest"}
        </button>
        <div style={{ fontSize: 9, color: C.textMuted, textAlign: "center", marginTop: 6 }}>
          Royalties auto-route → Meteora DLMM for compounding yield
        </div>
      </div>
    </div>
  )
}
