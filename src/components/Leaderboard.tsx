import { C, glass, mono, pill } from "../theme"
import type { Token } from "../types"
import { fmt } from "../data"
import { MiniChart } from "./MiniChart"

export function Leaderboard({ tokens, onSelect }: {
  tokens: Token[]
  onSelect: (t: Token) => void
}) {
  const sorted = [...tokens].sort((a, b) => b.marketCap - a.marketCap)

  const rankColors = ["#ffd700", "#c0c0c0", "#cd7f32"]

  return (
    <div style={{ padding: 12, position: "relative", zIndex: 1 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 4 }}>Leaderboard</div>
        <div style={{ fontSize: 12, color: C.textMuted }}>Ranked by market cap · Real-time</div>
      </div>

      {/* Top 3 podium */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
        {sorted.slice(0, 3).map((t, i) => (
          <div key={t.id} onClick={() => onSelect(t)} style={{
            ...glass, textAlign: "center", cursor: "pointer", padding: "12px 8px",
            background: i === 0 ? "linear-gradient(135deg,rgba(255,215,0,0.08),transparent)" : undefined,
            border: `1px solid ${i === 0 ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.08)"}`,
          }}>
            <div style={{ fontSize: 9, color: rankColors[i] || C.textMuted, fontWeight: 800, letterSpacing: "1px", marginBottom: 4 }}>
              #{i + 1} {i === 0 ? "GOLD" : i === 1 ? "SILVER" : "BRONZE"}
            </div>
            <div style={{ fontSize: 22, marginBottom: 4 }}>
              {t.image.startsWith("http")
                ? <img src={t.image} style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover" }} />
                : t.image}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 2 }}>{t.name}</div>
            <div style={{ ...mono, fontSize: 10, color: "#9945ff" }}>${t.symbol}</div>
            <div style={{ ...mono, fontSize: 10, color: C.green, marginTop: 4 }}>${fmt(t.marketCap)}</div>
          </div>
        ))}
      </div>

      {/* Full list */}
      <div style={glass}>
        {sorted.map((t, i) => (
          <div key={t.id} onClick={() => onSelect(t)} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 0",
            borderBottom: i < sorted.length - 1 ? `1px solid rgba(255,255,255,0.05)` : "none",
            cursor: "pointer", transition: "all 0.2s",
          }}>
            <span style={{
              fontSize: 11, width: 22, ...mono, fontWeight: 700, flexShrink: 0, textAlign: "center",
              color: i === 0 ? "#ffd700" : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : C.textMuted,
            }}>
              #{i + 1}
            </span>
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: "linear-gradient(135deg,rgba(153,69,255,0.2),rgba(20,241,149,0.1))",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
            }}>
              {t.image.startsWith("http")
                ? <img src={t.image} style={{ width: 34, height: 34, borderRadius: 10, objectFit: "cover" }} />
                : t.image}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 12, letterSpacing: "-0.2px" }}>{t.name}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
                <span style={{ ...mono, fontSize: 9, color: "#9945ff" }}>${t.symbol}</span>
                <span style={{ fontSize: 9, color: C.textMuted }}>MC ${fmt(t.marketCap)}</span>
              </div>
            </div>
            <div style={{ display: "flex", flex: "column", alignItems: "flex-end", gap: 4 }}>
              <MiniChart data={t.priceHistory} pos={t.priceChange >= 0} />
              <span style={{
                ...mono, fontSize: 10, fontWeight: 700,
                color: t.priceChange >= 0 ? C.green : C.red,
              }}>
                {t.priceChange >= 0 ? "▲" : "▼"}{Math.abs(t.priceChange).toFixed(1)}%
              </span>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ ...mono, fontSize: 10, color: C.textMuted }}>👥{fmt(t.holders)}</div>
              <span style={{ ...pill("#f59e0b"), fontSize: 8 }}>{t.royaltyPct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
