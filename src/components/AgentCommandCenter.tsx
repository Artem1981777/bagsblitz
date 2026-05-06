import { useState, useCallback } from "react"
import { C, glass, mono, pill } from "../theme"
import { AgentStream } from "./AgentStream"
import { YieldOptimizer } from "./YieldOptimizer"
import { SecuritySuite } from "./SecuritySuite"
import { Dashboard } from "./Dashboard"
import { WhaleFeed } from "./WhaleFeed"
import { TradeQueue } from "./TradeQueue"
import type { AgentThought, YieldPosition, RoyaltyEntry, Token, TxEvent, JitoBundle, TradeQueueEntry } from "../types"

type CenterTab = "stream" | "whales" | "queue" | "security" | "yield" | "dashboard"

const TABS: { id: CenterTab; label: string; icon: string; color: string }[] = [
  { id: "stream",    label: "Stream",   icon: "◉", color: "#14f195" },
  { id: "whales",    label: "Whales",   icon: "🐋", color: "#f59e0b" },
  { id: "queue",     label: "Queue",    icon: "◈", color: "#14f195" },
  { id: "security",  label: "Security", icon: "⬡", color: "#9945ff" },
  { id: "yield",     label: "Yield",    icon: "◆", color: "#10b981" },
  { id: "dashboard", label: "Stats",    icon: "▣", color: "#ec4899" },
]

export function AgentCommandCenter({
  thoughts, isActive, onToggle,
  yieldPositions, royalties, tokens,
  agentCycle, onAction,
  txEvents, bundles, whaleCount, mevBlockCount,
  jitoEnabled, onJitoToggle,
  tradeQueue, onExecute, onDismiss, onCopyTrade,
}: {
  thoughts: AgentThought[]
  isActive: boolean
  onToggle: () => void
  yieldPositions: YieldPosition[]
  royalties: RoyaltyEntry[]
  tokens: Token[]
  agentCycle: number
  onAction: (msg: string) => void
  txEvents: TxEvent[]
  bundles: JitoBundle[]
  whaleCount: number
  mevBlockCount: number
  jitoEnabled: boolean
  onJitoToggle: (v: boolean) => void
  tradeQueue: TradeQueueEntry[]
  onExecute: (id: string) => void
  onDismiss: (id: string) => void
  onCopyTrade: (tx: TxEvent) => void
}) {
  const [tab, setTab] = useState<CenterTab>("stream")

  // When Copy Trade is triggered from the Whale Feed, switch to Queue tab
  const handleCopyTrade = useCallback((tx: TxEvent) => {
    onCopyTrade(tx)
    setTab("queue")
  }, [onCopyTrade])

  // Badges
  const newWhales     = txEvents.filter(t => t.isWhale && Date.now() - t.timestamp < 15000).length
  const readyQueue    = tradeQueue.filter(e => e.status === "queued").length
  const blockedQueue  = tradeQueue.filter(e => e.status === "blocked").length
  const validatingCnt = tradeQueue.filter(e => e.status === "validating").length
  const queueBadge    = readyQueue + blockedQueue + validatingCnt

  // Ids of txs already in the queue (for CopyTrade dedup)
  const copiedIds = new Set(tradeQueue.map(e => e.sourceTx.id))

  return (
    <div style={{ padding: 12, position: "relative", zIndex: 1 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 2 }}>Command Center</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>elizaOS · Autonomous SocialFi Infrastructure</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%",
              background: isActive ? C.green : C.textDim,
              boxShadow: isActive ? `0 0 8px ${C.green}` : "none",
              animation: isActive ? "pulse 2s infinite" : "none",
            }} />
            <span style={{ fontSize: 10, color: isActive ? C.green : C.textMuted, fontWeight: 700, letterSpacing: "0.5px" }}>
              {isActive ? "ACTIVE" : "PAUSED"}
            </span>
          </div>
          <div style={{ ...mono, fontSize: 9, color: C.textMuted, marginTop: 2 }}>cycle #{agentCycle.toString().padStart(4, "0")}</div>
        </div>
      </div>

      {/* Status strip */}
      <div style={{
        ...glass, padding: "8px 14px", marginBottom: 10,
        background: "linear-gradient(135deg,rgba(20,241,149,0.04),rgba(153,69,255,0.04))",
        border: `1px solid rgba(20,241,149,0.12)`,
        display: "flex", overflowX: "auto", scrollbarWidth: "none",
      }}>
        {[
          { label: "Watched",  value: tokens.length.toString(),     color: C.green },
          { label: "Whales",   value: whaleCount.toString(),         color: "#f59e0b" },
          { label: "MEV Off",  value: mevBlockCount.toString(),      color: C.purple },
          { label: "Queued",   value: readyQueue.toString(),         color: C.green },
          { label: "Blocked",  value: blockedQueue.toString(),       color: "#ff3366" },
          { label: "Jito",     value: jitoEnabled ? "ON" : "OFF",    color: jitoEnabled ? C.purple : C.textDim },
        ].map((s, i) => (
          <div key={s.label} style={{
            flexShrink: 0, textAlign: "center", flex: 1,
            borderRight: i < 5 ? `1px solid rgba(255,255,255,0.05)` : "none",
            padding: "0 4px",
          }}>
            <div style={{ ...mono, fontSize: 12, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 7, color: C.textMuted, letterSpacing: "0.4px", marginTop: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 2, marginBottom: 10,
        background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 3,
        border: `1px solid rgba(255,255,255,0.06)`,
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "5px 1px", borderRadius: 7, border: "none", cursor: "pointer",
            background: tab === t.id ? "rgba(255,255,255,0.07)" : "transparent",
            color: tab === t.id ? t.color : C.textMuted,
            fontSize: 7.5, fontWeight: 700, letterSpacing: "0.1px", transition: "all 0.2s",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            position: "relative",
          }}>
            <span style={{ fontSize: 10 }}>{t.icon}</span>
            <span>{t.label}</span>

            {/* Whale badge */}
            {t.id === "whales" && newWhales > 0 && (
              <span style={{ position: "absolute", top: 1, right: 2, background: "#f59e0b", color: "#000", borderRadius: "50%", width: 12, height: 12, fontSize: 7, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {newWhales > 9 ? "9+" : newWhales}
              </span>
            )}

            {/* Queue badge */}
            {t.id === "queue" && queueBadge > 0 && (
              <span style={{ position: "absolute", top: 1, right: 2, background: blockedQueue > 0 && readyQueue === 0 ? "#ff3366" : C.green, color: "#000", borderRadius: "50%", width: 12, height: 12, fontSize: 7, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {queueBadge > 9 ? "9+" : queueBadge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Panels */}
      {tab === "stream" && (
        <AgentStream thoughts={thoughts} isActive={isActive} onToggle={onToggle} />
      )}
      {tab === "whales" && (
        <WhaleFeed
          txEvents={txEvents} bundles={bundles}
          whaleCount={whaleCount} mevBlockCount={mevBlockCount}
          jitoEnabled={jitoEnabled}
          onCopyTrade={handleCopyTrade}
          copiedIds={copiedIds}
        />
      )}
      {tab === "queue" && (
        <TradeQueue queue={tradeQueue} onExecute={onExecute} onDismiss={onDismiss} />
      )}
      {tab === "security" && (
        <SecuritySuite
          onAction={onAction}
          onJitoToggle={onJitoToggle}
          jitoEnabled={jitoEnabled}
          recentTxs={txEvents}
          bundles={bundles}
        />
      )}
      {tab === "yield" && (
        <YieldOptimizer positions={yieldPositions} royalties={royalties} onAction={onAction} />
      )}
      {tab === "dashboard" && (
        <Dashboard tokens={tokens} royalties={royalties} positions={yieldPositions} />
      )}
    </div>
  )
}
