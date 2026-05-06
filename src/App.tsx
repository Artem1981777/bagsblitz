import { useState, useEffect } from "react"
import { Rocket, Brain, Trophy, Zap } from "lucide-react"
import { C, mono } from "./theme"
import { MOCK_TOKENS, rand, BAGS_API, BAGS_KEY } from "./data"
import { useAgent } from "./hooks/useAgent"
import type { Token, Page, WalletState } from "./types"

import { TokenFeed } from "./components/TokenFeed"
import { TokenDetail } from "./components/TokenDetail"
import { LaunchPad } from "./components/LaunchPad"
import { Leaderboard } from "./components/Leaderboard"
import { AgentCommandCenter } from "./components/AgentCommandCenter"

export default function App() {
  const [page, setPage] = useState<Page>("feed")
  const [tokens, setTokens] = useState<Token[]>(MOCK_TOKENS)
  const [sel, setSel] = useState<Token | null>(null)
  const [wallet, setWallet] = useState<WalletState>({ connected: false, address: "", balance: 0 })
  const [filter, setFilter] = useState<"hot" | "new" | "top">("hot")
  const [notif, setNotif] = useState("")
  const [liveTokens, setLiveTokens] = useState<any[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<{ score: number; verdict: string; report: string } | null>(null)

  const agent = useAgent()

  const toast = (m: string) => {
    setNotif(m)
    setTimeout(() => setNotif(""), 3000)
  }

  // Simulate live price updates
  useEffect(() => {
    const t = setInterval(() => setTokens(p => p.map(rand)), 800)
    return () => clearInterval(t)
  }, [])

  // Fetch live tokens from bags.fm
  useEffect(() => {
    async function fetchLive() {
      try {
        const res = await fetch(BAGS_API + "/tokens?limit=10&sort=volume", {
          headers: { "x-api-key": BAGS_KEY },
        })
        const data = await res.json()
        if (data.data || data.tokens) setLiveTokens(data.data || data.tokens || [])
      } catch {}
    }
    fetchLive()
    const i = setInterval(fetchLive, 30000)
    return () => clearInterval(i)
  }, [])

  async function connectWallet() {
    const phantom = (window as any).solana
    if (phantom?.isPhantom) {
      try {
        const res = await phantom.connect()
        setWallet({
          connected: true,
          address: res.publicKey.toString().slice(0, 4) + "..." + res.publicKey.toString().slice(-4),
          balance: +(Math.random() * 5 + 0.5).toFixed(3),
        })
        toast("Phantom connected!")
      } catch {
        setWallet({ connected: true, address: "Demo...1234", balance: 1.5 })
        toast("Demo mode active")
      }
    } else {
      setWallet({ connected: true, address: "Demo...1234", balance: 1.5 })
      toast("Install Phantom for full access")
    }
  }

  async function analyzeCreator(token: Token) {
    setAnalyzing(true)
    setAiAnalysis(null)
    agent.addThought({
      type: "analysis",
      message: `Analyzing $${token.symbol}...`,
      detail: `Running elizaOS due-diligence pipeline on ${token.name}`,
      confidence: 72,
    })
    await new Promise(r => setTimeout(r, 1600))
    const score = Math.min(95, Math.max(40,
      Math.floor(token.bondingProgress * 0.6 + token.holders * 0.01 + token.royaltyPct * 2)
    ))
    const verdict = score > 75 ? "INVEST" : score > 55 ? "WATCH" : "AVOID"
    const report = score > 75
      ? `Strong project. ${token.name} shows clear creator vision with ${token.royaltyPct}% fair royalty. Bonding curve at ${token.bondingProgress.toFixed(0)}% indicates strong momentum. ${token.holders} holders shows organic community growth.`
      : score > 55
      ? `Moderate potential. ${token.name} has interesting concept but needs more traction. Monitor before investing. Current ${token.bondingProgress.toFixed(0)}% bonding progress is developing.`
      : `High risk. ${token.name} lacks sufficient community validation. Only ${token.holders} holders. Wait for more development.`
    setAiAnalysis({ score, verdict, report })
    agent.addThought({
      type: "analysis",
      message: `$${token.symbol} analysis complete → ${verdict} (${score}/100)`,
      detail: report.slice(0, 80) + "...",
      confidence: score,
    })
    setAnalyzing(false)
  }

  function handleLaunch(form: any) {
    const newToken: Token = {
      id: Date.now().toString(),
      name: form.name,
      symbol: form.symbol.toUpperCase(),
      description: form.desc,
      image: form.img || "🚀",
      price: 0.0000001,
      priceChange: 0,
      marketCap: 1000,
      volume: 0,
      holders: 1,
      bondingProgress: 0.5,
      royaltyPct: parseInt(form.royalty),
      creator: wallet.address || "Demo...0001",
      createdAt: Date.now(),
      priceHistory: [0.0000001],
      mint: "",
    }
    setTokens(p => [newToken, ...p])
    agent.addThought({
      type: "action",
      message: `🚀 New token launched: $${form.symbol.toUpperCase()}`,
      detail: `${form.name} · ${form.royalty}% royalty · Bags.fm bonding curve initialized`,
      confidence: 98,
    })
    toast(`🚀 ${form.name} launched on Bags.fm!`)
    setPage("feed")
  }

  const nav = [
    { id: "feed",   label: "Discover", icon: <Zap size={16} /> },
    { id: "agent",  label: "Agent",    icon: <Brain size={16} /> },
    { id: "launch", label: "Launch",   icon: <Rocket size={16} /> },
    { id: "board",  label: "Top",      icon: <Trophy size={16} /> },
  ] as const

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.text,
      fontFamily: "-apple-system, 'SF Pro Display', 'Inter', sans-serif",
      paddingBottom: 72,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background orbs */}
      <div style={{ position: "fixed", top: "-20%", right: "-10%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(153,69,255,0.07) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-10%", left: "-10%", width: "35vw", height: "35vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(20,241,149,0.05) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Toast */}
      {notif && (
        <div style={{
          position: "fixed", top: 64, left: "50%", transform: "translateX(-50%)",
          background: "rgba(5,5,8,0.97)", border: `1px solid rgba(255,255,255,0.12)`,
          borderRadius: 10, padding: "9px 18px", zIndex: 300, color: C.text,
          fontWeight: 600, fontSize: 12, whiteSpace: "nowrap",
          backdropFilter: "blur(20px)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          animation: "slideIn 0.2s ease",
        }}>
          {notif}
        </div>
      )}

      {/* Header */}
      <div style={{
        background: "rgba(5,5,8,0.85)", backdropFilter: "blur(20px)",
        borderBottom: `1px solid rgba(255,255,255,0.07)`,
        padding: "0 14px", height: 52,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 7,
            background: "linear-gradient(135deg,#9945ff,#14f195)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
          }}>👜</div>
          <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.5px" }}>
            Bags<span style={{ color: "#9945ff" }}>Blitz</span>
          </span>
          <span style={{
            background: "rgba(20,241,149,0.12)", border: `1px solid rgba(20,241,149,0.25)`,
            borderRadius: 5, padding: "2px 6px", fontSize: 8, fontWeight: 700, color: "#14f195", letterSpacing: "0.5px",
          }}>LIVE</span>
          {agent.isActive && (
            <span style={{
              background: "rgba(153,69,255,0.12)", border: `1px solid rgba(153,69,255,0.25)`,
              borderRadius: 5, padding: "2px 6px", fontSize: 8, fontWeight: 700, color: "#9945ff", letterSpacing: "0.3px",
            }}>elizaOS</span>
          )}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {wallet.connected && (
            <span style={{
              background: "rgba(153,69,255,0.12)", border: `1px solid rgba(153,69,255,0.2)`,
              borderRadius: 6, padding: "3px 8px", fontSize: 9, fontWeight: 600, color: "#9945ff", ...mono,
            }}>
              {wallet.balance} SOL
            </span>
          )}
          <button onClick={connectWallet} style={{
            background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`,
            borderRadius: 8, color: C.text, padding: "5px 10px", cursor: "pointer", fontSize: 10, fontWeight: 600,
            transition: "all 0.2s",
          }}>
            {wallet.connected
              ? <span style={mono}>{wallet.address}</span>
              : "Connect Wallet"}
          </button>
        </div>
      </div>

      {/* Pages */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {page === "feed" && (
          <TokenFeed
            tokens={tokens}
            liveTokens={liveTokens}
            filter={filter}
            onFilter={setFilter}
            onSelect={t => { setSel(t); setAiAnalysis(null); setPage("token") }}
          />
        )}

        {page === "token" && sel && (
          <TokenDetail
            token={sel}
            aiAnalysis={aiAnalysis}
            analyzing={analyzing}
            onBack={() => setPage("feed")}
            onAnalyze={() => analyzeCreator(sel)}
            onBuy={() => toast(`Redirecting to Bags.fm for $${sel.symbol}`)}
            onShare={() => { navigator.clipboard.writeText(window.location.href); toast("Link copied!") }}
          />
        )}

        {page === "launch" && (
          <LaunchPad
            wallet={wallet}
            onLaunch={handleLaunch}
            onConnect={connectWallet}
            onToast={toast}
          />
        )}

        {page === "board" && (
          <Leaderboard
            tokens={tokens}
            onSelect={t => { setSel(t); setAiAnalysis(null); setPage("token") }}
          />
        )}

        {page === "agent" && (
          <AgentCommandCenter
            thoughts={agent.thoughts}
            isActive={agent.isActive}
            onToggle={() => agent.setIsActive(v => !v)}
            yieldPositions={agent.yieldPositions}
            royalties={agent.royalties}
            tokens={tokens}
            agentCycle={agent.agentCycle}
            onAction={msg => { agent.addThought({ type: "action", message: msg, confidence: 90 }); toast(msg.slice(0, 40)) }}
          />
        )}
      </div>

      {/* Bottom navigation */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480,
        background: "rgba(5,5,8,0.92)", backdropFilter: "blur(20px)",
        borderTop: `1px solid rgba(255,255,255,0.07)`,
        display: "flex", height: 60, zIndex: 200,
      }}>
        {nav.map(n => {
          const active = page === n.id || (page === "token" && n.id === "feed")
          return (
            <button key={n.id} onClick={() => setPage(n.id as Page)} style={{
              flex: 1, background: active ? "rgba(153,69,255,0.1)" : "none",
              border: "none", color: active ? "#9945ff" : C.textMuted,
              cursor: "pointer", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 3,
              fontSize: 9, fontWeight: active ? 700 : 400, transition: "all 0.2s",
              letterSpacing: "0.5px",
              borderTop: active ? `2px solid #9945ff` : "2px solid transparent",
            }}>
              {n.icon}
              {n.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
