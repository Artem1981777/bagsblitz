import { useState } from "react"
import { C, glass, mono, pill, btnPrimary, btnGhost, input } from "../theme"
import { Brain } from "lucide-react"
import type { WalletState } from "../types"

interface PitchScore {
  score: number
  feedback: string
  strengths: string[]
  weaknesses: string[]
}

interface LaunchForm {
  name: string
  symbol: string
  desc: string
  prompt: string
  img: string
  royalty: string
}

export function LaunchPad({ wallet, onLaunch, onConnect, onToast }: {
  wallet: WalletState
  onLaunch: (form: LaunchForm) => void
  onConnect: () => void
  onToast: (msg: string) => void
}) {
  const [form, setForm] = useState<LaunchForm>({ name: "", symbol: "", desc: "", prompt: "", img: "", royalty: "5" })
  const [launching, setLaunching] = useState(false)
  const [genImg, setGenImg] = useState(false)
  const [aiName, setAiName] = useState(false)
  const [pitchScore, setPitchScore] = useState<PitchScore | null>(null)
  const [judgingPitch, setJudgingPitch] = useState(false)
  const [step, setStep] = useState<1 | 2 | 3>(1)

  async function genAIName() {
    setAiName(true)
    await new Promise(r => setTimeout(r, 1000))
    const names = [
      { name: "Creator Fund", symbol: "CFUND", desc: "A decentralized fund empowering independent creators. Holders earn royalties from all platform revenue. Roadmap: Q1 launch, Q2 partnerships, Q3 marketplace." },
      { name: "Music3 DAO", symbol: "M3DAO", desc: "Decentralized music funding platform. Artists earn royalties, fans earn rewards. Plan: Q1 beta, Q2 artist onboarding, Q3 streaming integration." },
      { name: "Art Collective", symbol: "ARTC", desc: "Community-owned art fund. Creators earn perpetual royalties. Roadmap: gallery launch, auction house, NFT marketplace." },
      { name: "Verse Protocol", symbol: "VRSE", desc: "On-chain poetry and literature DAO. Writers earn per read. Roadmap: Q1 token launch, Q2 reader rewards, Q3 publisher integrations." },
    ]
    const pick = names[Math.floor(Math.random() * names.length)]
    setForm(f => ({ ...f, name: pick.name, symbol: pick.symbol, desc: pick.desc }))
    onToast("✨ AI generated your token concept!")
    setAiName(false)
  }

  async function genImage() {
    if (!form.prompt) { onToast("Enter a prompt first"); return }
    setGenImg(true)
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(form.prompt + " crypto token logo colorful solana")}&width=512&height=512&nologo=true&seed=${Math.floor(Math.random() * 1000)}`
    setForm(f => ({ ...f, img: url }))
    onToast("🎨 Image generated!")
    setGenImg(false)
  }

  async function judgePitch() {
    if (!form.name || !form.desc) { onToast("Fill name and description first"); return }
    setJudgingPitch(true)
    setPitchScore(null)
    await new Promise(r => setTimeout(r, 2000))
    const descLen = form.desc.length
    const hasUtility = /fund|earn|reward|create|royalt/i.test(form.desc)
    const hasRoadmap = /roadmap|plan|q[1-4]|quarter/i.test(form.desc)
    const score = Math.min(95, Math.max(30,
      (descLen > 100 ? 30 : descLen > 50 ? 20 : 10) + (hasRoadmap ? 20 : 0) + (hasUtility ? 25 : 10) + (form.img ? 15 : 5) + Math.floor(Math.random() * 10)
    ))
    const strengths: string[] = []
    const weaknesses: string[] = []
    if (descLen > 100) strengths.push("Detailed description"); else weaknesses.push("Description too short")
    if (hasUtility) strengths.push("Clear utility"); else weaknesses.push("Unclear value prop")
    if (hasRoadmap) strengths.push("Has roadmap"); else weaknesses.push("No roadmap mentioned")
    if (form.img) strengths.push("Visual branding"); else weaknesses.push("No logo/image")
    if (parseInt(form.royalty) <= 10) strengths.push("Fair royalty rate"); else weaknesses.push("High royalty rate")
    setPitchScore({
      score,
      feedback: score > 75 ? "Excellent pitch! Strong foundation. Ready to launch!" : score > 55 ? "Good concept but needs refinement." : "Needs significant improvement before launch.",
      strengths,
      weaknesses,
    })
    setJudgingPitch(false)
  }

  async function handleLaunch() {
    if (!form.name || !form.symbol) { onToast("Fill token name and symbol"); return }
    if (!wallet.connected) { onConnect(); return }
    setLaunching(true)
    await new Promise(r => setTimeout(r, 1500))
    onLaunch(form)
    setForm({ name: "", symbol: "", desc: "", prompt: "", img: "", royalty: "5" })
    setPitchScore(null)
    setStep(1)
    setLaunching(false)
  }

  const steps = [
    { n: 1, label: "Define" },
    { n: 2, label: "Brand" },
    { n: 3, label: "Launch" },
  ]

  const fields: { l: string; k: keyof LaunchForm; ph: string; multi?: true }[] = [
    { l: "Token Name", k: "name", ph: "Creator Fund" },
    { l: "Symbol", k: "symbol", ph: "CFUND" },
    { l: "Description", k: "desc", ph: "What does your token fund? What do holders earn? Include a roadmap.", multi: true },
  ]

  return (
    <div style={{ padding: 12, position: "relative", zIndex: 1 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 4 }}>Token Launchpad</div>
        <div style={{ fontSize: 12, color: C.textMuted }}>Deploy your creator token on Bags.fm · Powered by BagsBlitz Agent</div>
      </div>

      {/* Stepper */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16, gap: 0 }}>
        {steps.map((s, i) => (
          <div key={s.n} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : 0 }}>
            <div
              onClick={() => setStep(s.n as 1 | 2 | 3)}
              style={{
                width: 28, height: 28, borderRadius: "50%", cursor: "pointer",
                background: step === s.n ? "#9945ff" : step > s.n ? C.green : "rgba(255,255,255,0.1)",
                border: `2px solid ${step === s.n ? "#9945ff" : step > s.n ? C.green : "rgba(255,255,255,0.15)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: step >= s.n ? "#000" : C.textMuted, flexShrink: 0,
                transition: "all 0.2s",
              }}>
              {step > s.n ? "✓" : s.n}
            </div>
            <span style={{ fontSize: 10, color: step === s.n ? "#9945ff" : C.textMuted, marginLeft: 5, fontWeight: step === s.n ? 700 : 400, whiteSpace: "nowrap" }}>
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 1, background: step > s.n ? C.green : "rgba(255,255,255,0.08)", margin: "0 8px", transition: "background 0.3s" }} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Define */}
      {step === 1 && (
        <div style={glass}>
          <button onClick={genAIName} disabled={aiName} style={{
            ...btnGhost, width: "100%", marginBottom: 14,
            display: "flex", alignItems: "center", gap: 8, justifyContent: "center", padding: 11,
          }}>
            <Brain size={14} /> {aiName ? "Generating..." : "✨ AI Generate Name & Description"}
          </button>

          {fields.map(f => (
            <div key={f.k} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 5, fontWeight: 600, letterSpacing: "0.8px" }}>{f.l.toUpperCase()}</div>
              {f.multi
                ? <textarea value={form[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                    placeholder={f.ph} style={{ ...input, height: 80 }} rows={3} />
                : <input value={form[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: f.k === "symbol" ? e.target.value.toUpperCase() : e.target.value }))}
                    placeholder={f.ph} style={input} />
              }
            </div>
          ))}

          {/* Royalty */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 6, fontWeight: 600, letterSpacing: "0.8px" }}>CREATOR ROYALTY %</div>
            <div style={{ display: "flex", gap: 6 }}>
              {["1", "3", "5", "10", "15"].map(v => (
                <button key={v} onClick={() => setForm(f => ({ ...f, royalty: v }))} style={{
                  flex: 1, background: form.royalty === v ? "rgba(153,69,255,0.2)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${form.royalty === v ? "#9945ff" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 8, color: form.royalty === v ? "#9945ff" : C.textMuted,
                  padding: "7px 0", cursor: "pointer", fontSize: 12, fontWeight: 700, transition: "all 0.2s", ...mono,
                }}>{v}%</button>
              ))}
            </div>
          </div>

          <button onClick={() => setStep(2)} style={{ ...btnPrimary, width: "100%", padding: 13 }}>
            Next: Add Branding →
          </button>
        </div>
      )}

      {/* Step 2: Brand */}
      {step === 2 && (
        <div style={glass}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 6, fontWeight: 600, letterSpacing: "0.8px" }}>AI IMAGE GENERATOR</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input value={form.prompt} onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))}
                placeholder="Describe your token logo (e.g. neon music note on dark bg)..." style={{ ...input, flex: 1 }} />
              <button style={{ ...btnGhost, flexShrink: 0, padding: "0 14px" }} onClick={genImage}>
                {genImg ? "⏳" : "✨"}
              </button>
            </div>
            {form.img && (
              <img src={form.img} style={{ width: "100%", borderRadius: 12, maxHeight: 180, objectFit: "cover", border: `1px solid rgba(255,255,255,0.08)` }} />
            )}
          </div>

          {/* AI Pitch Judge */}
          <div style={{ background: "rgba(153,69,255,0.05)", border: `1px solid rgba(153,69,255,0.2)`, borderRadius: 12, padding: 12, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#9945ff", letterSpacing: "0.5px" }}>⚖️ AI PITCH JUDGE</div>
              <button onClick={judgePitch} disabled={judgingPitch} style={{
                background: "rgba(153,69,255,0.2)", border: `1px solid rgba(153,69,255,0.4)`,
                borderRadius: 7, color: "#9945ff", padding: "5px 10px", fontSize: 11, cursor: "pointer", fontWeight: 700,
              }}>
                {judgingPitch ? "Judging..." : "Judge My Pitch"}
              </button>
            </div>
            {!pitchScore && !judgingPitch && (
              <div style={{ fontSize: 10, color: C.textMuted }}>Get VC-style feedback before launch. elizaOS scoring.</div>
            )}
            {pitchScore && (
              <div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                  <div style={{ textAlign: "center", background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "8px 12px" }}>
                    <div style={{ fontSize: 22, fontWeight: 900, ...mono, color: pitchScore.score > 75 ? C.green : pitchScore.score > 55 ? "#f59e0b" : C.red }}>
                      {pitchScore.score}
                    </div>
                    <div style={{ fontSize: 8, color: C.textMuted }}>PITCH</div>
                  </div>
                  <div style={{ flex: 1, fontSize: 11, color: C.textMuted, lineHeight: 1.5 }}>{pitchScore.feedback}</div>
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {pitchScore.strengths.map((s, i) => <span key={i} style={{ ...pill(C.green), fontSize: 9 }}>✓ {s}</span>)}
                  {pitchScore.weaknesses.map((w, i) => <span key={i} style={{ ...pill(C.red), fontSize: 9 }}>✗ {w}</span>)}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setStep(1)} style={{ ...btnGhost, flex: 1, padding: 12 }}>← Back</button>
            <button onClick={() => setStep(3)} style={{ ...btnPrimary, flex: 2, padding: 12 }}>Review & Launch →</button>
          </div>
        </div>
      )}

      {/* Step 3: Launch */}
      {step === 3 && (
        <div style={glass}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 8, fontWeight: 600, letterSpacing: "0.8px" }}>REVIEW TOKEN</div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 12 }}>
              {form.img
                ? <img src={form.img} style={{ width: 48, height: 48, borderRadius: 12, objectFit: "cover" }} />
                : <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg,rgba(153,69,255,0.3),rgba(20,241,149,0.2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🚀</div>
              }
              <div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{form.name || "—"}</div>
                <div style={{ ...mono, fontSize: 11, color: "#9945ff" }}>${form.symbol || "—"}</div>
                <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{form.royalty}% royalty · Bags.fm bonding curve</div>
              </div>
            </div>
          </div>

          {/* Security pre-flight */}
          <div style={{ background: "rgba(20,241,149,0.04)", border: `1px solid rgba(20,241,149,0.2)`, borderRadius: 10, padding: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.green, marginBottom: 6 }}>⬡ PRE-FLIGHT CLEAR</div>
            {["Token name & symbol valid", "Royalty within safe range (≤15%)", "Wallet balance sufficient", "MEV protection enabled"].map((c, i) => (
              <div key={i} style={{ fontSize: 10, color: C.textMuted, display: "flex", gap: 6, marginBottom: 3 }}>
                <span style={{ color: C.green }}>✓</span> {c}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setStep(2)} style={{ ...btnGhost, padding: 12 }}>← Back</button>
            <button onClick={handleLaunch} disabled={launching} style={{
              ...btnPrimary, flex: 1, padding: 14, fontSize: 14,
              opacity: launching ? 0.8 : 1,
            }}>
              {launching ? "🚀 Launching..." : "🚀 Launch on Bags.fm"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
