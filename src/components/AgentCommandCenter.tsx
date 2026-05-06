import { useState } from "react"
import { C, glass, mono, pill } from "../theme"
import { AgentStream } from "./AgentStream"
import { YieldOptimizer } from "./YieldOptimizer"
import { SecuritySuite } from "./SecuritySuite"
import { Dashboard } from "./Dashboard"
import type { AgentThought, YieldPosition, RoyaltyEntry, Token } from "../types"

type CenterTab = "stream" | "yield" | "security" | "dashboard"

const TABS: { id: CenterTab; label: string; icon: string; color: string }[] = [
  { id: "stream",    label: "Thought Stream", icon: "◉", color: "#14f195" },
  { id: "yield",     label: "Yield",          icon: "◈", color: "#10b981" },
  { id: "security",  label: "Security",       icon: "⬡", color: "#9945ff" },
  { id: "dashboard", label: "Dashboard",      icon: "◆", color: "#ec4899" },
]

export function AgentCommandCenter({ thoughts, isActive, onToggle, yieldPositions, royalties, tokens, agentCycle, onAction }: {
  thoughts: AgentThought[]
  isActive: boolean
  onToggle: () => void
  yieldPositions: YieldPosition[]
  royalties: RoyaltyEntry[]
  tokens: Token[]
  agentCycle: number
  onAction: (msg: string) => void
}) {
  const [tab, setTab] = useState<CenterTab>("stream")

  return (
    <div style={{ padding: 12, position: "relative", zIndex: 1 }}>
      {/* Command Center header */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 2 }}>
              Command Center
            </div>
            <div style={{ fontSize: 12, color: C.textMuted }}>
              elizaOS Agent · Autonomous SocialFi Infrastructure
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
              <div style={{
                width: 7, height: 7, borderRadius: "50%",
                background: isActive ? "#14f195" : C.textDim,
                boxShadow: isActive ? `0 0 8px #14f195` : "none",
                animation: isActive ? "pulse 2s infinite" : "none",
              }} />
              <span style={{ fontSize: 10, color: isActive ? "#14f195" : C.textMuted, fontWeight: 700, letterSpacing: "0.5px" }}>
                {isActive ? "ACTIVE" : "PAUSED"}
              </span>
            </div>
            <div style={{ ...mono, fontSize: 9, color: C.textMuted, marginTop: 2 }}>
              cycle #{agentCycle.toString().padStart(4, "0")}
            </div>
          </div>
        </div>
      </div>

      {/* Agent status strip */}
      <div style={{
        ...glass, padding: "10px 14px", marginBottom: 12,
        background: "linear-gradient(135deg,rgba(20,241,149,0.05),rgba(153,69,255,0.05))",
        border: `1px solid rgba(20,241,149,0.15)`,
        display: "flex", gap: 16, overflowX: "auto", scrollbarWidth: "none",
      }}>
        {[
          { label: "Tokens Watched",   value: tokens.length.toString(),         color: "#14f195" },
          { label: "Hot Signals",      value: tokens.filter(t => t.priceChange > 100).length.toString(), color: "#f59e0b" },
          { label: "Yield APY",        value: "47.3%",   color: "#10b981" },
          { label: "MEV Blocks",       value: "41",      color: "#9945ff" },
          { label: "elizaOS",          value: "v0.1.9",  color: "#6b7280" },
        ].map(s => (
          <div key={s.label} style={{ flexShrink: 0, textAlign: "center" }}>
            <div style={{ ...mono, fontSize: 13, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 8, color: C.textMuted, letterSpacing: "0.5px", marginTop: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 4, marginBottom: 10,
        background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 3,
        border: `1px solid rgba(255,255,255,0.06)`,
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "7px 4px", borderRadius: 7, border: "none", cursor: "pointer",
            background: tab === t.id ? "rgba(255,255,255,0.07)" : "transparent",
            color: tab === t.id ? t.color : C.textMuted,
            fontSize: 9, fontWeight: 700, letterSpacing: "0.3px", transition: "all 0.2s",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          }}>
            <span style={{ fontSize: 12 }}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Panel content */}
      {tab === "stream" && (
        <AgentStream thoughts={thoughts} isActive={isActive} onToggle={onToggle} />
      )}
      {tab === "yield" && (
        <YieldOptimizer positions={yieldPositions} royalties={royalties} onAction={onAction} />
      )}
      {tab === "security" && (
        <SecuritySuite onAction={onAction} />
      )}
      {tab === "dashboard" && (
        <Dashboard tokens={tokens} royalties={royalties} positions={yieldPositions} />
      )}
    </div>
  )
}
