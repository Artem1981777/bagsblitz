import { C, glass, mono, pill } from "../theme"
import type { Token, RoyaltyEntry, YieldPosition } from "../types"
import { fmt } from "../data"
import { MiniChart } from "./MiniChart"

const portfolioHistory = [1200, 1350, 1280, 1490, 1620, 1580, 1720, 1890, 1840, 2100, 2250, 2180]

function StatCard({ label, value, sub, color, delta }: {
  label: string, value: string, sub?: string, color?: string, delta?: number
}) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "12px 14px",
      border: `1px solid rgba(255,255,255,0.06)`,
    }}>
      <div style={{ fontSize: 9, color: C.textMuted, fontWeight: 600, letterSpacing: "0.8px", marginBottom: 4 }}>{label}</div>
      <div style={{ ...mono, fontSize: 18, fontWeight: 800, color: color || C.text }}>{value}</div>
      {sub && <div style={{ fontSize: 9, color: C.textMuted, marginTop: 2 }}>{sub}</div>}
      {delta !== undefined && (
        <div style={{ fontSize: 10, color: delta >= 0 ? C.green : C.red, fontWeight: 600, marginTop: 2 }}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
        </div>
      )}
    </div>
  )
}

export function Dashboard({ tokens, royalties, positions }: {
  tokens: Token[]
  royalties: RoyaltyEntry[]
  positions: YieldPosition[]
}) {
  const totalRoyaltyUSD = royalties.reduce((s, r) => s + r.usdValue, 0)
  const totalYieldEarned = positions.reduce((s, p) => s + p.earned, 0)
  const totalTVL = positions.reduce((s, p) => s + p.tvl, 0)
  const avgSocialMult = (tokens.reduce((s, t) => s + t.bondingProgress, 0) / tokens.length / 10).toFixed(1)

  const weeklyPnL = totalRoyaltyUSD + totalYieldEarned * 160
  const roi = ((weeklyPnL / 1000) * 100).toFixed(1)

  return (
    <div>
      {/* Portfolio overview */}
      <div style={{ ...glass, border: `1px solid ${C.purple}20`, marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, letterSpacing: "0.8px", marginBottom: 4 }}>
              PORTFOLIO VALUE
            </div>
            <div style={{ ...mono, fontSize: 28, fontWeight: 900, color: C.text }}>
              ${(2250 + totalYieldEarned * 160).toFixed(0)}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              <span style={{ ...pill(C.green), fontSize: 9 }}>▲ +{roi}% ROI</span>
              <span style={{ ...pill(C.purple), fontSize: 9 }}>7d performance</span>
            </div>
          </div>
          <MiniChart data={portfolioHistory} pos={true} width={90} height={40} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          <StatCard label="TOTAL ROYALTIES" value={`$${totalRoyaltyUSD.toFixed(2)}`} sub="All streams combined" color={C.amber} />
          <StatCard label="DEFI YIELD" value={`${(totalYieldEarned * 160).toFixed(2)} USD`} sub={`${totalYieldEarned.toFixed(3)} SOL`} color="#10b981" />
          <StatCard label="DeFi TVL" value={`$${fmt(totalTVL)}`} sub="Across 3 protocols" color={C.blue} />
          <StatCard label="WEEKLY ROI" value={`+${roi}%`} sub={`$${weeklyPnL.toFixed(2)} gained`} color={C.green} delta={parseFloat(roi)} />
        </div>
      </div>

      {/* Social Multiplier */}
      <div style={{ ...glass, border: `1px solid #ec489920`, marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 14 }}>◆</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.8px", color: "#ec4899" }}>SOCIAL MULTIPLIER</div>
            <div style={{ fontSize: 9, color: C.textMuted }}>Community sentiment across tracked tokens</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 10 }}>
          {[
            { label: "Avg Multiplier", value: avgSocialMult + "x", color: "#ec4899" },
            { label: "Tokens Monitored", value: tokens.length.toString(), color: C.purple },
            { label: "Hot Signals", value: tokens.filter(t => t.priceChange > 100).length.toString(), color: C.amber },
          ].map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "8px 0", textAlign: "center" }}>
              <div style={{ ...mono, fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 8, color: C.textMuted, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Top movers */}
        <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, letterSpacing: "0.5px", marginBottom: 6 }}>
          TOP MOVERS
        </div>
        {[...tokens].sort((a, b) => b.priceChange - a.priceChange).slice(0, 4).map(t => (
          <div key={t.id} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "5px 0", borderBottom: `1px solid rgba(255,255,255,0.04)`,
          }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 12 }}>{t.image}</span>
              <span style={{ fontSize: 11, fontWeight: 600 }}>{t.name}</span>
              <span style={{ ...mono, fontSize: 9, color: C.textMuted }}>${t.symbol}</span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <MiniChart data={t.priceHistory} pos={t.priceChange >= 0} />
              <span style={{ ...mono, fontSize: 11, fontWeight: 700, color: t.priceChange >= 0 ? C.green : C.red }}>
                {t.priceChange >= 0 ? "▲" : "▼"}{Math.abs(t.priceChange).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Agent performance */}
      <div style={{ ...glass, border: `1px solid ${C.green}15`, marginBottom: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.8px", color: C.green, marginBottom: 10 }}>
          ◉ AGENT PERFORMANCE
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {[
            { label: "Trades Executed", value: "47", sub: "This session" },
            { label: "Security Blocks", value: "3", sub: "Threats stopped", color: C.red },
            { label: "MEV Bundles", value: "41", sub: "Front-runs prevented", color: C.purple },
            { label: "Auto-Claims", value: "12", sub: "Royalties claimed", color: C.amber },
          ].map(s => (
            <StatCard key={s.label} label={s.label} value={s.value} sub={s.sub} color={s.color} />
          ))}
        </div>
      </div>
    </div>
  )
}
