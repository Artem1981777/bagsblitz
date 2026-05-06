export const C = {
  bg: "#050508",
  bgPanel: "#0a0a10",
  surface: "rgba(255,255,255,0.03)",
  surfaceHover: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.08)",
  borderHover: "rgba(255,255,255,0.15)",
  green: "#14f195",
  purple: "#9945ff",
  red: "#ff3366",
  amber: "#f59e0b",
  blue: "#3b82f6",
  text: "#ffffff",
  textMuted: "#6b7280",
  textDim: "#374151",
} as const

export const glass = {
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: `1px solid rgba(255,255,255,0.08)`,
  borderRadius: 16,
  padding: 16,
  marginBottom: 8,
} as const

export const pill = (c: string) => ({
  background: c + "15",
  border: `1px solid ${c}30`,
  borderRadius: 6,
  padding: "2px 8px",
  fontSize: 10,
  fontWeight: 600,
  color: c,
  letterSpacing: "0.3px",
  display: "inline-flex",
  alignItems: "center",
  gap: 3,
})

export const btnPrimary = {
  background: `linear-gradient(135deg, #9945ff, #6366f1)`,
  border: "none",
  borderRadius: 12,
  color: "#fff",
  padding: "12px 20px",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 13,
  letterSpacing: "0.3px",
  transition: "all 0.2s",
  boxShadow: "0 4px 20px rgba(153,69,255,0.3)",
} as const

export const btnGhost = {
  background: "rgba(255,255,255,0.05)",
  border: `1px solid rgba(255,255,255,0.08)`,
  borderRadius: 10,
  color: "#fff",
  padding: "8px 14px",
  cursor: "pointer",
  fontSize: 12,
  transition: "all 0.2s",
} as const

export const input = {
  background: "rgba(255,255,255,0.05)",
  border: `1px solid rgba(255,255,255,0.08)`,
  borderRadius: 10,
  padding: "11px 14px",
  color: "#fff",
  fontSize: 13,
  width: "100%",
  outline: "none",
  boxSizing: "border-box" as const,
  transition: "all 0.2s",
} as const

export const mono: React.CSSProperties = {
  fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace",
}

export const glow = (c: string) => ({ boxShadow: `0 0 20px ${c}20` })
