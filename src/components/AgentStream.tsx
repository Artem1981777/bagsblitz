import { useEffect, useRef } from "react"
import { C, glass, mono, pill } from "../theme"
import type { AgentThought } from "../types"

const TYPE_CONFIG = {
  scan:     { color: C.blue,   icon: "◉", label: "SCAN" },
  alert:    { color: C.amber,  icon: "⚠", label: "ALERT" },
  action:   { color: C.green,  icon: "▶", label: "ACTION" },
  yield:    { color: "#10b981",icon: "◈", label: "YIELD" },
  security: { color: C.purple, icon: "⬡", label: "SECURE" },
  mev:      { color: "#f97316",icon: "⚡", label: "MEV" },
  social:   { color: "#ec4899",icon: "◆", label: "SOCIAL" },
  analysis: { color: C.green,  icon: "◎", label: "AI" },
}

function ThoughtRow({ t }: { t: AgentThought }) {
  const cfg = TYPE_CONFIG[t.type] || TYPE_CONFIG.scan
  const ts = new Date(t.timestamp)
  const time = ts.toTimeString().slice(0, 8)
  return (
    <div style={{ padding: "8px 0", borderBottom: `1px solid rgba(255,255,255,0.04)`, animation: "fadeIn 0.3s ease" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <span style={{ ...mono, fontSize: 9, color: C.textDim, flexShrink: 0, paddingTop: 1 }}>{time}</span>
        <span style={{ ...pill(cfg.color), fontSize: 9, flexShrink: 0 }}>{cfg.icon} {cfg.label}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: C.text, lineHeight: 1.5, fontWeight: 500 }}>{t.message}</div>
          {t.detail && (
            <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2, lineHeight: 1.4 }}>{t.detail}</div>
          )}
        </div>
        {t.confidence !== undefined && (
          <span style={{ ...mono, fontSize: 9, color: cfg.color, flexShrink: 0, paddingTop: 1 }}>
            {t.confidence}%
          </span>
        )}
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center", padding: "8px 0" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 5, height: 5, borderRadius: "50%", background: C.green,
          animation: `pulse 1.2s ease ${i * 0.2}s infinite`,
        }} />
      ))}
      <span style={{ fontSize: 10, color: C.textMuted, marginLeft: 4 }}>Agent thinking...</span>
    </div>
  )
}

export function AgentStream({ thoughts, isActive, onToggle }: {
  thoughts: AgentThought[]
  isActive: boolean
  onToggle: () => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [thoughts.length])

  return (
    <div style={{ ...glass, border: `1px solid ${C.green}20`, marginBottom: 0, padding: 0, overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 14px", borderBottom: `1px solid rgba(255,255,255,0.06)`,
        background: "rgba(20,241,149,0.03)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: isActive ? C.green : C.textDim,
            boxShadow: isActive ? `0 0 8px ${C.green}` : "none",
            animation: isActive ? "pulse 2s infinite" : "none",
          }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1px", color: C.green }}>
            LIVE AGENT THOUGHT STREAM
          </span>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ ...mono, fontSize: 9, color: C.textMuted }}>{thoughts.length} events</span>
          <button onClick={onToggle} style={{
            background: isActive ? `${C.red}15` : `${C.green}15`,
            border: `1px solid ${isActive ? C.red : C.green}30`,
            borderRadius: 6, color: isActive ? C.red : C.green,
            padding: "3px 8px", fontSize: 9, cursor: "pointer", fontWeight: 700,
          }}>
            {isActive ? "PAUSE" : "RESUME"}
          </button>
        </div>
      </div>

      {/* Stream */}
      <div ref={scrollRef} style={{
        height: 340, overflowY: "auto", padding: "0 14px",
        scrollbarWidth: "thin", scrollbarColor: `${C.border} transparent`,
      }}>
        {isActive && <TypingDots />}
        {thoughts.length === 0 ? (
          <div style={{ textAlign: "center", color: C.textMuted, fontSize: 11, padding: "40px 0" }}>
            Agent stream starting...
          </div>
        ) : (
          thoughts.map(t => <ThoughtRow key={t.id} t={t} />)
        )}
      </div>

      {/* Footer stats */}
      <div style={{
        padding: "8px 14px", borderTop: `1px solid rgba(255,255,255,0.04)`,
        display: "flex", gap: 12, background: "rgba(0,0,0,0.2)",
      }}>
        {(["scan", "alert", "action", "yield", "security"] as const).map(type => {
          const count = thoughts.filter(t => t.type === type).length
          const cfg = TYPE_CONFIG[type]
          return (
            <div key={type} style={{ display: "flex", gap: 3, alignItems: "center" }}>
              <span style={{ fontSize: 9, color: cfg.color }}>{cfg.icon}</span>
              <span style={{ ...mono, fontSize: 9, color: C.textMuted }}>{count}</span>
            </div>
          )
        })}
        <span style={{ marginLeft: "auto", ...mono, fontSize: 9, color: C.textMuted }}>
          elizaOS v0.1.9
        </span>
      </div>
    </div>
  )
}
