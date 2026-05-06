import { C, glass, mono, pill, btnPrimary, btnGhost, glow } from "../theme"
import type { Token } from "../types"
import { fmt } from "../data"
import { Share2, ExternalLink, Brain } from "lucide-react"
import { MiniChart } from "./MiniChart"

interface AIAnalysis {
  score: number
  verdict: string
  report: string
}

export function TokenDetail({ token, aiAnalysis, analyzing, onBack, onAnalyze, onBuy, onShare }: {
  token: Token
  aiAnalysis: AIAnalysis | null
  analyzing: boolean
  onBack: () => void
  onAnalyze: () => void
  onBuy: () => void
  onShare: () => void
}) {
  const S = {
    header: {
      background: "rgba(5,5,8,0.8)", backdropFilter: "blur(20px)",
      borderBottom: `1px solid rgba(255,255,255,0.08)`,
      padding: "0 16px", height: 56, display: "flex", alignItems: "center",
      justifyContent: "space-between", position: "sticky" as const, top: 0, zIndex: 50,
    },
  }

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      <div style={S.header}>
        <button onClick={onBack} style={{
          background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.08)`,
          borderRadius: 8, color: C.textMuted, cursor: "pointer",
          fontSize: 18, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
        }}>←</button>
        <span style={{ fontWeight: 700, ...mono, fontSize: 13 }}>${token.symbol}</span>
        <button onClick={onShare} style={{
          background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.08)`,
          borderRadius: 8, color: C.textMuted, cursor: "pointer",
          width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Share2 size={14} />
        </button>
      </div>

      <div style={{ padding: 12 }}>
        {/* Hero */}
        <div style={{ ...glass, background: "linear-gradient(135deg,rgba(153,69,255,0.08),rgba(20,241,149,0.03))" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: "linear-gradient(135deg,rgba(153,69,255,0.2),rgba(20,241,149,0.1))",
              border: `1px solid rgba(255,255,255,0.08)`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0,
            }}>
              {token.image.startsWith("http")
                ? <img src={token.image} style={{ width: 56, height: 56, borderRadius: 16, objectFit: "cover" }} />
                : token.image}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.5px", marginBottom: 4 }}>{token.name}</div>
              <div style={{ color: C.textMuted, fontSize: 12, marginBottom: 8 }}>{token.description}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span style={{ ...pill(C.green) }}>{token.royaltyPct}% creator royalty</span>
                {token.mint && (
                  <a href={`https://bags.fm/$${token.symbol}`} target="_blank" rel="noreferrer"
                    style={{ ...pill("#9945ff"), display: "flex", alignItems: "center", gap: 3, textDecoration: "none" }}>
                    <ExternalLink size={9} />Bags.fm
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Price chart */}
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "10px 12px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 9, color: C.textMuted, letterSpacing: "0.5px" }}>PRICE CHART</span>
              <span style={{ ...mono, fontSize: 10, color: token.priceChange >= 0 ? C.green : C.red, fontWeight: 700 }}>
                {token.priceChange >= 0 ? "▲" : "▼"}{Math.abs(token.priceChange).toFixed(1)}%
              </span>
            </div>
            <MiniChart data={token.priceHistory} pos={token.priceChange >= 0} width={280} height={60} />
          </div>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
            {[
              { l: "Price", v: "$" + token.price.toFixed(8), c: token.priceChange >= 0 ? C.green : C.red },
              { l: "Market Cap", v: "$" + fmt(token.marketCap), c: C.text },
              { l: "Volume", v: "$" + fmt(token.volume), c: C.text },
              { l: "Holders", v: fmt(token.holders), c: C.text },
              { l: "24h Change", v: (token.priceChange >= 0 ? "+" : "") + token.priceChange.toFixed(1) + "%", c: token.priceChange >= 0 ? C.green : C.red },
              { l: "Progress", v: token.bondingProgress.toFixed(0) + "%", c: "#9945ff" },
            ].map(s => (
              <div key={s.l} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: s.c, ...mono }}>{s.v}</div>
                <div style={{ fontSize: 9, color: C.textMuted, marginTop: 2, letterSpacing: "0.3px" }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Bonding bar */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: C.textMuted }}>Bonding Curve Progress</span>
              <span style={{ fontSize: 10, color: "#9945ff", fontWeight: 700, ...mono }}>{token.bondingProgress.toFixed(1)}%</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 6, height: 6 }}>
              <div style={{
                background: `linear-gradient(90deg,${C.green},#9945ff)`,
                height: 6, borderRadius: 6, width: token.bondingProgress + "%", transition: "width 1s",
              }} />
            </div>
            <div style={{ fontSize: 9, color: C.textMuted, marginTop: 4 }}>
              {token.bondingProgress >= 100 ? "🎉 Graduated to DEX!" : `${(100 - token.bondingProgress).toFixed(0)}% until DEX graduation`}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ ...btnPrimary, flex: 1, padding: 13, fontSize: 13 }} onClick={onBuy}>
              Buy ${token.symbol}
            </button>
            <button style={{ ...btnGhost, flex: 1, padding: 13, fontSize: 13 }} onClick={() => {}}>
              Sell
            </button>
          </div>
        </div>

        {/* AI Due Diligence */}
        <div style={{ ...glass, border: `1px solid rgba(153,69,255,0.2)`, ...glow("#9945ff") }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: "rgba(153,69,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Brain size={13} color="#9945ff" />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.3px" }}>AI Due Diligence</div>
                <div style={{ fontSize: 9, color: C.textMuted }}>elizaOS · BagsBlitz Agent</div>
              </div>
            </div>
            <button onClick={onAnalyze} disabled={analyzing} style={{
              background: "rgba(153,69,255,0.2)", border: `1px solid rgba(153,69,255,0.4)`,
              borderRadius: 8, color: "#9945ff", padding: "6px 12px", fontSize: 11, cursor: "pointer",
              fontWeight: 700, transition: "all 0.2s",
            }}>
              {analyzing ? <span style={{ animation: "pulse 1s infinite" }}>Analyzing...</span> : "🤖 Analyze"}
            </button>
          </div>

          {!aiAnalysis && !analyzing && (
            <div style={{ fontSize: 11, color: C.textMuted, textAlign: "center", padding: "16px 0", borderTop: `1px solid rgba(255,255,255,0.08)` }}>
              Get AI-powered investment analysis for this token
            </div>
          )}

          {aiAnalysis && (
            <div style={{ borderTop: `1px solid rgba(255,255,255,0.08)`, paddingTop: 12 }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
                <div style={{
                  textAlign: "center", background: "rgba(255,255,255,0.04)",
                  borderRadius: 12, padding: "12px 16px", minWidth: 72,
                }}>
                  <div style={{
                    fontSize: 28, fontWeight: 900, ...mono,
                    color: aiAnalysis.score > 75 ? C.green : aiAnalysis.score > 55 ? "#f59e0b" : C.red,
                  }}>
                    {aiAnalysis.score}
                  </div>
                  <div style={{ fontSize: 8, color: C.textMuted, letterSpacing: "1px", marginTop: 2 }}>SCORE</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 18, fontWeight: 800, marginBottom: 4,
                    color: aiAnalysis.verdict === "INVEST" ? C.green : aiAnalysis.verdict === "WATCH" ? "#f59e0b" : C.red,
                  }}>
                    {aiAnalysis.verdict === "INVEST" ? "✅ INVEST" : aiAnalysis.verdict === "WATCH" ? "👀 WATCH" : "❌ AVOID"}
                  </div>
                  <div style={{ fontSize: 10, color: C.textMuted }}>AI Confidence: {aiAnalysis.score}%</div>
                </div>
              </div>
              <div style={{
                fontSize: 12, color: C.textMuted, lineHeight: 1.7,
                background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 12,
              }}>
                {aiAnalysis.report}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
