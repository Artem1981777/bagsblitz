import { C, glass, mono, pill } from "../theme"
import type { Token } from "../types"
import { fmt, ago, BBLITZ_MINT } from "../data"
import { MiniChart } from "./MiniChart"

export function TokenFeed({ tokens, liveTokens, filter, onFilter, onSelect }: {
  tokens: Token[]
  liveTokens: any[]
  filter: "hot" | "new" | "top"
  onFilter: (f: "hot" | "new" | "top") => void
  onSelect: (t: Token) => void
}) {
  const sorted = [...tokens].sort((a, b) =>
    filter === "new" ? b.createdAt - a.createdAt :
    filter === "top" ? b.marketCap - a.marketCap :
    b.volume - a.volume
  )

  return (
    <div style={{ padding: "12px 12px 0", position: "relative", zIndex: 1 }}>
      {/* BBLITZ banner */}
      <div style={{
        ...glass, background: "linear-gradient(135deg,rgba(153,69,255,0.1),rgba(20,241,149,0.05))",
        border: `1px solid rgba(153,69,255,0.3)`, marginBottom: 12, padding: "12px 14px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: "#9945ff", fontWeight: 700, letterSpacing: "1px", marginBottom: 2 }}>
              $BBLITZ IS LIVE ON BAGS.FM
            </div>
            <div style={{ fontSize: 10, color: C.textMuted, ...mono }}>
              {BBLITZ_MINT.slice(0, 12)}...{BBLITZ_MINT.slice(-4)}
            </div>
          </div>
          <a href={`https://bags.fm/$BBLITZ`} target="_blank" rel="noreferrer" style={{
            background: "linear-gradient(135deg,#9945ff,#14f195)",
            border: "none", borderRadius: 8, color: "#000", padding: "6px 12px",
            fontSize: 11, fontWeight: 700, cursor: "pointer", textDecoration: "none",
          }}>Trade →</a>
        </div>
      </div>

      {/* Live ticker */}
      {liveTokens.length > 0 && (
        <div style={{ ...glass, padding: "7px 12px", marginBottom: 10, overflowX: "auto", scrollbarWidth: "none", display: "flex", gap: 16 }}>
          {liveTokens.slice(0, 8).map((t: any, i: number) => (
            <div key={i} style={{ flexShrink: 0, display: "flex", gap: 4 }}>
              <span style={{ fontSize: 10, color: C.textMuted, ...mono }}>${t.symbol || t.ticker}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.green, ...mono }}>
                {t.price ? "$" + parseFloat(t.price).toFixed(8) : ""}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {(["hot", "new", "top"] as const).map(f => (
          <button key={f} onClick={() => onFilter(f)} style={{
            background: filter === f ? `rgba(153,69,255,0.2)` : "transparent",
            border: `1px solid ${filter === f ? "#9945ff" : "rgba(255,255,255,0.08)"}`,
            borderRadius: 8, padding: "6px 14px",
            color: filter === f ? "#9945ff" : C.textMuted,
            cursor: "pointer", fontSize: 11, fontWeight: 600, letterSpacing: "0.5px", transition: "all 0.2s",
          }}>
            {f === "hot" ? "🔥 Hot" : f === "new" ? "✦ New" : "👑 Top"}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 10, color: C.textMuted, alignSelf: "center", ...mono }}>
          {tokens.length} tokens
        </span>
      </div>

      {/* Token cards */}
      {sorted.map(t => (
        <div key={t.id} onClick={() => onSelect(t)} style={{
          ...glass, cursor: "pointer", transition: "all 0.2s", position: "relative", overflow: "hidden",
        }}>
          {t.priceChange > 100 && (
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${C.green},transparent)` }} />
          )}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: `linear-gradient(135deg,rgba(153,69,255,0.2),rgba(20,241,149,0.1))`,
              border: `1px solid rgba(255,255,255,0.08)`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
            }}>
              {t.image.startsWith("http")
                ? <img src={t.image} style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover" }} />
                : t.image}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.3px" }}>{t.name}</span>
                <span style={{ ...pill(C.textDim), fontSize: 9, color: C.textMuted }}>${t.symbol}</span>
                {t.priceChange > 80 && <span style={{ ...pill(C.green), fontSize: 9 }}>🔥</span>}
                {t.bondingProgress > 80 && <span style={{ ...pill("#9945ff"), fontSize: 9 }}>⚡</span>}
                <span style={{ ...pill("#f59e0b"), marginLeft: "auto", fontSize: 9 }}>{t.royaltyPct}% royalty</span>
              </div>
              <div style={{ color: C.textMuted, fontSize: 11, marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {t.description}
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: t.priceChange >= 0 ? C.green : C.red, fontWeight: 700, ...mono }}>
                  {t.priceChange >= 0 ? "▲" : "▼"}{Math.abs(t.priceChange).toFixed(1)}%
                </span>
                <span style={{ fontSize: 10, color: C.textMuted, ...mono }}>MC ${fmt(t.marketCap)}</span>
                <span style={{ fontSize: 10, color: C.textMuted }}>👥{fmt(t.holders)}</span>
                <span style={{ fontSize: 10, color: C.textDim, ...mono, marginLeft: "auto" }}>{ago(t.createdAt)}</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 4, height: 3 }}>
                <div style={{
                  background: t.bondingProgress > 80
                    ? `linear-gradient(90deg,#9945ff,#14f195)`
                    : `linear-gradient(90deg,#14f195,#9945ff)`,
                  height: 3, borderRadius: 4,
                  width: t.bondingProgress + "%", transition: "width 0.8s",
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                <span style={{ fontSize: 9, color: C.textDim }}>bonding curve</span>
                <span style={{ fontSize: 9, color: t.bondingProgress > 80 ? "#9945ff" : C.textDim, ...mono }}>
                  {t.bondingProgress.toFixed(0)}%
                </span>
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 700, ...mono }}>${t.price.toFixed(8)}</div>
              <MiniChart data={t.priceHistory} pos={t.priceChange >= 0} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
