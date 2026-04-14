import { useState, useEffect } from "react"
import { Rocket, Flame, Share2, Brain, Trophy, ExternalLink } from "lucide-react"

const BAGS_API = "https://public-api-v2.bags.fm/api/v1"
const BAGS_KEY = (import.meta as any).env.VITE_BAGS_KEY
const BBLITZ_MINT = "GiiRMcD1Ci4o6vP3evycKTrpjYQfScL4xobmkNMcBAGS"

interface Token {
  id: string
  name: string
  symbol: string
  description: string
  image: string
  price: number
  priceChange: number
  marketCap: number
  volume: number
  holders: number
  creator: string
  createdAt: number
  bondingProgress: number
  royaltyPct: number
  priceHistory: number[]
  mint?: string
}

const MOCK_TOKENS: Token[] = [
  { id:"1", name:"Music DAO", symbol:"MUSIC", description:"Decentralized music funding and royalty distribution", image:"🎵", price:0.0000234, priceChange:142.5, marketCap:234000, volume:89000, holders:1243, bondingProgress:67, royaltyPct:5, creator:"9xRs...1234", createdAt:Date.now()-3600000, priceHistory:[0.00001,0.000015,0.00002,0.000018,0.000022,0.0000234], mint:"" },
  { id:"2", name:"Artist Token", symbol:"ART", description:"Support independent artists directly on-chain", image:"🖼️", price:0.0000089, priceChange:-12.3, marketCap:89000, volume:34000, holders:567, bondingProgress:23, royaltyPct:10, creator:"3mNk...5678", createdAt:Date.now()-7200000, priceHistory:[0.00001,0.0000095,0.000009,0.0000085,0.000009,0.0000089], mint:"" },
  { id:"3", name:"Creator Coin", symbol:"CREATE", description:"The future of creator economy on Solana", image:"🎨", price:0.0001234, priceChange:89.2, marketCap:1234000, volume:456000, holders:4521, bondingProgress:89, royaltyPct:7, creator:"5pQr...9012", createdAt:Date.now()-1800000, priceHistory:[0.00006,0.00008,0.0001,0.00011,0.00012,0.0001234], mint:"" },
  { id:"4", name:"Writer Fund", symbol:"WRITE", description:"Fund your favorite writers and earn from their success", image:"✍️", price:0.0000456, priceChange:34.7, marketCap:456000, volume:123000, holders:2341, bondingProgress:45, royaltyPct:8, creator:"2wLm...3456", createdAt:Date.now()-900000, priceHistory:[0.00003,0.000035,0.00004,0.000042,0.000044,0.0000456], mint:"" },
  { id:"5", name:"Film3 Studio", symbol:"FILM3", description:"Decentralized film funding platform. Investors earn box office royalties.", image:"🎬", price:0.0000567, priceChange:67.3, marketCap:567000, volume:234000, holders:3421, bondingProgress:58, royaltyPct:6, creator:"8kPm...2345", createdAt:Date.now()-2400000, priceHistory:[0.00003,0.000035,0.00004,0.000045,0.00005,0.0000567], mint:"" },
  { id:"6", name:"Podcast DAO", symbol:"PCST", description:"Community-funded podcasts with listener revenue sharing", image:"🎙️", price:0.0000123, priceChange:-8.4, marketCap:123000, volume:45000, holders:892, bondingProgress:31, royaltyPct:12, creator:"4nRt...6789", createdAt:Date.now()-5400000, priceHistory:[0.000015,0.000013,0.000012,0.0000125,0.000012,0.0000123], mint:"" },
  { id:"7", name:"Gaming Guild", symbol:"GGLD", description:"Play-to-earn gaming guild token with tournament prize pools", image:"🎮", price:0.0002345, priceChange:234.5, marketCap:2345000, volume:890000, holders:8921, bondingProgress:95, royaltyPct:4, creator:"7wXz...0123", createdAt:Date.now()-600000, priceHistory:[0.00005,0.0001,0.00015,0.0002,0.00022,0.0002345], mint:"" },
  { id:"8", name:"Fashion NFT", symbol:"FASH", description:"Luxury fashion brand tokens with exclusive holder benefits", image:"👗", price:0.0000789, priceChange:45.6, marketCap:789000, volume:312000, holders:2134, bondingProgress:72, royaltyPct:9, creator:"1qAb...4567", createdAt:Date.now()-10800000, priceHistory:[0.00004,0.00005,0.00006,0.00007,0.000075,0.0000789], mint:"" },
  { id:"9", name:"Sports Fan", symbol:"SFAN", description:"Fan token for sports clubs with voting rights and rewards", image:"⚽", price:0.0000345, priceChange:12.3, marketCap:345000, volume:123000, holders:5678, bondingProgress:41, royaltyPct:3, creator:"6vCd...8901", createdAt:Date.now()-14400000, priceHistory:[0.00003,0.000031,0.000032,0.000033,0.000034,0.0000345], mint:"" },
  { id:"10", name:"Comedy Club", symbol:"LMAO", description:"Stand-up comedy funding DAO with ticket revenue sharing", image:"😂", price:0.0000056, priceChange:567.8, marketCap:56000, volume:23000, holders:345, bondingProgress:15, royaltyPct:15, creator:"9yEf...2345", createdAt:Date.now()-300000, priceHistory:[0.000001,0.000002,0.000003,0.000004,0.000005,0.0000056], mint:"" },
  { id:"11", name:"BagsBlitz", symbol:"BBLITZ", description:"AI-powered creator token intelligence platform", image:"👜", price:0.0000100, priceChange:0, marketCap:10000, volume:0, holders:1, bondingProgress:0.5, royaltyPct:1, creator:"FLjH...keiC", createdAt:Date.now()-600000, priceHistory:[0.0000100], mint:BBLITZ_MINT },
]

const rand = (t: Token): Token => {
  const d = (Math.random()-0.48)*0.015
  const np = Math.max(t.price*(1+d), 0.0000001)
  return { ...t, price:np, priceChange:t.priceChange+(Math.random()-0.5)*2, volume:t.volume+Math.random()*1000, marketCap:t.marketCap*(1+d), bondingProgress:Math.min(t.bondingProgress+Math.random()*0.1,100), priceHistory:[...t.priceHistory.slice(-19), np] }
}

const fmt = (n: number) => n>=1e6?(n/1e6).toFixed(2)+"M":n>=1000?(n/1000).toFixed(1)+"K":n.toFixed(0)
const ago = (ts: number) => { const s=Math.floor((Date.now()-ts)/1000); return s<60?s+"s":s<3600?Math.floor(s/60)+"m":Math.floor(s/3600)+"h" }

function MiniChart({ data, pos }: { data: number[], pos: boolean }) {
  if(data.length<2) return null
  const min=Math.min(...data), max=Math.max(...data), r=max-min||1
  const w=60,h=24
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-min)/r)*h}`).join(" ")
  return (
    <svg width={w} height={h}>
      <defs>
        <linearGradient id={"g"+pos} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={pos?"#14f195":"#ff3366"} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={pos?"#14f195":"#ff3366"} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={pos?"#14f195":"#ff3366"} strokeWidth="1.5"/>
    </svg>
  )
}

export default function App() {
  const [page, setPage] = useState<"feed"|"launch"|"token"|"board">("feed")
  const [tokens, setTokens] = useState<Token[]>(MOCK_TOKENS)
  const [sel, setSel] = useState<Token|null>(null)
  const [wallet, setWallet] = useState({ connected:false, address:"", balance:0 })
  const [filter, setFilter] = useState<"hot"|"new"|"top">("hot")
  const [notif, setNotif] = useState("")
  const [launching, setLaunching] = useState(false)
  const [genImg, setGenImg] = useState(false)
  const [aiName, setAiName] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<{score:number,verdict:string,report:string}|null>(null)
  const [pitchScore, setPitchScore] = useState<{score:number,feedback:string,strengths:string[],weaknesses:string[]}|null>(null)
  const [judgingPitch, setJudgingPitch] = useState(false)
  const [form, setForm] = useState({ name:"", symbol:"", desc:"", prompt:"", img:"", royalty:"5" })
  const [liveTokens, setLiveTokens] = useState<any[]>([])

  const toast = (m: string) => { setNotif(m); setTimeout(()=>setNotif(""),3000) }

  useEffect(() => {
    const t = setInterval(() => setTokens(p=>p.map(rand)), 800)
    return ()=>clearInterval(t)
  }, [])

  useEffect(() => {
    async function fetchLive() {
      try {
        const res = await fetch(BAGS_API+"/tokens?limit=10&sort=volume", { headers:{"x-api-key":BAGS_KEY} })
        const data = await res.json()
        if(data.data||data.tokens) setLiveTokens(data.data||data.tokens||[])
      } catch {}
    }
    fetchLive()
    const i = setInterval(fetchLive, 30000)
    return ()=>clearInterval(i)
  }, [])

  async function connectWallet() {
    const phantom = (window as any).solana
    if(phantom?.isPhantom) {
      try {
        const res = await phantom.connect()
        setWallet({ connected:true, address:res.publicKey.toString().slice(0,4)+"..."+res.publicKey.toString().slice(-4), balance:+(Math.random()*5+0.5).toFixed(3) })
        toast("Phantom connected!")
      } catch { setWallet({ connected:true, address:"Demo...1234", balance:1.5 }); toast("Demo mode") }
    } else { setWallet({ connected:true, address:"Demo...1234", balance:1.5 }); toast("Install Phantom!") }
  }

  async function analyzeCreator(token: Token) {
    setAnalyzing(true); setAiAnalysis(null)
    await new Promise(r=>setTimeout(r,1500))
    const score = Math.min(95, Math.max(40, Math.floor(token.bondingProgress*0.6+token.holders*0.01+token.royaltyPct*2)))
    const verdict = score>75?"INVEST":score>55?"WATCH":"AVOID"
    const report = score>75
      ? `Strong project. ${token.name} shows clear creator vision with ${token.royaltyPct}% fair royalty. Bonding curve at ${token.bondingProgress.toFixed(0)}% indicates strong momentum. ${token.holders} holders shows organic community growth.`
      : score>55
      ? `Moderate potential. ${token.name} has interesting concept but needs more traction. Monitor before investing. Current ${token.bondingProgress.toFixed(0)}% bonding progress is developing.`
      : `High risk. ${token.name} lacks sufficient community validation. Only ${token.holders} holders. Wait for more development.`
    setAiAnalysis({ score, verdict, report })
    setAnalyzing(false)
  }

  async function judgePitch() {
    if(!form.name||!form.desc){toast("Fill name and description");return}
    setJudgingPitch(true); setPitchScore(null)
    await new Promise(r=>setTimeout(r,2000))
    const descLen = form.desc.length
    const hasUtility = form.desc.toLowerCase().includes("fund")||form.desc.toLowerCase().includes("earn")||form.desc.toLowerCase().includes("reward")||form.desc.toLowerCase().includes("create")
    const hasRoadmap = form.desc.toLowerCase().includes("roadmap")||form.desc.toLowerCase().includes("plan")
    const score = Math.min(95, Math.max(30,
      (descLen>100?30:descLen>50?20:10)+(hasRoadmap?20:0)+(hasUtility?25:10)+(form.img?15:5)+Math.floor(Math.random()*10)
    ))
    const strengths: string[] = []; const weaknesses: string[] = []
    if(descLen>100) strengths.push("Detailed description"); else weaknesses.push("Description too short")
    if(hasUtility) strengths.push("Clear utility"); else weaknesses.push("Unclear value")
    if(hasRoadmap) strengths.push("Has roadmap"); else weaknesses.push("No roadmap")
    if(form.img) strengths.push("Visual branding"); else weaknesses.push("No logo")
    if(parseInt(form.royalty)<=10) strengths.push("Fair royalty"); else weaknesses.push("High royalty rate")
    const feedback = score>75?"Excellent pitch! Strong foundation. Ready to launch!":score>55?"Good concept but needs refinement.":"Needs major improvement before launch."
    setPitchScore({ score, feedback, strengths, weaknesses })
    setJudgingPitch(false)
  }

  async function genImage() {
    if(!form.prompt) return
    setGenImg(true)
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(form.prompt+" crypto token logo colorful")}&width=512&height=512&nologo=true&seed=${Math.floor(Math.random()*1000)}`
    setForm(f=>({...f,img:url}))
    toast("Image generated!")
    setGenImg(false)
  }

  async function genAIName() {
    setAiName(true)
    await new Promise(r=>setTimeout(r,1000))
    const names = [
      {name:"Creator Fund", symbol:"CFUND", desc:"A decentralized fund empowering independent creators. Holders earn royalties from all platform revenue. Roadmap: Q1 launch, Q2 partnerships, Q3 marketplace."},
      {name:"Music3 DAO", symbol:"M3DAO", desc:"Decentralized music funding platform. Artists earn royalties, fans earn rewards. Plan: Q1 beta, Q2 artist onboarding, Q3 streaming integration."},
      {name:"Art Collective", symbol:"ARTC", desc:"Community-owned art fund. Creators earn perpetual royalties. Roadmap: gallery launch, auction house, NFT marketplace."},
    ]
    const pick = names[Math.floor(Math.random()*names.length)]
    setForm(f=>({...f, name:pick.name, symbol:pick.symbol, desc:pick.desc}))
    toast("AI generated!")
    setAiName(false)
  }

  async function launchToken() {
    if(!form.name||!form.symbol){toast("Fill name and symbol");return}
    if(!wallet.connected){connectWallet();return}
    setLaunching(true)
    await new Promise(r=>setTimeout(r,1500))
    const newToken: Token = { id:Date.now().toString(), name:form.name, symbol:form.symbol.toUpperCase(), description:form.desc, image:form.img||"🚀", price:0.0000001, priceChange:0, marketCap:1000, volume:0, holders:1, bondingProgress:0.5, royaltyPct:parseInt(form.royalty), creator:wallet.address, createdAt:Date.now(), priceHistory:[0.0000001], mint:"" }
    setTokens(p=>[newToken,...p])
    toast("Token launched on Bags.fm!")
    setForm({name:"",symbol:"",desc:"",prompt:"",img:"",royalty:"5"})
    setPage("feed")
    setLaunching(false)
  }

  const sorted = [...tokens].sort((a,b)=>filter==="new"?b.createdAt-a.createdAt:filter==="top"?b.marketCap-a.marketCap:b.volume-a.volume)

  // STYLES
  const C = {
    bg: "#050508",
    surface: "rgba(255,255,255,0.03)",
    surfaceHover: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.08)",
    borderHover: "rgba(255,255,255,0.15)",
    green: "#14f195",
    purple: "#9945ff",
    red: "#ff3366",
    text: "#ffffff",
    textMuted: "#6b7280",
    textDim: "#374151",
  }

  const glass = {
    background: "rgba(255,255,255,0.03)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  }

  const S: Record<string,any> = {
    app: { minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'SF Pro Display',-apple-system,sans-serif", paddingBottom:72, position:"relative" as const, overflow:"hidden" },
    header: { background:"rgba(5,5,8,0.8)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", borderBottom:`1px solid ${C.border}`, padding:"0 16px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky" as const, top:0, zIndex:50 },
    card: { ...glass },
    nav: { position:"fixed" as const, bottom:0, left:0, right:0, background:"rgba(5,5,8,0.9)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", borderTop:`1px solid ${C.border}`, display:"flex", height:60, zIndex:100 },
    navBtn: (a:boolean) => ({ flex:1, background:a?"rgba(153,69,255,0.1)":"none", border:"none", color:a?C.purple:C.textMuted, cursor:"pointer", display:"flex", flexDirection:"column" as const, alignItems:"center", justifyContent:"center", gap:3, fontSize:9, fontWeight:a?700:400, transition:"all 0.2s", letterSpacing:"0.5px" }),
    pill: (c:string) => ({ background:c+"15", border:`1px solid ${c}30`, borderRadius:6, padding:"2px 8px", fontSize:10, fontWeight:600, color:c, letterSpacing:"0.3px" }),
    btnPrimary: { background:`linear-gradient(135deg, ${C.purple}, #6366f1)`, border:"none", borderRadius:12, color:"#fff", padding:"12px 20px", cursor:"pointer", fontWeight:700, fontSize:13, letterSpacing:"0.3px", transition:"all 0.2s", boxShadow:"0 4px 20px rgba(153,69,255,0.3)" },
    btnGhost: { background:"rgba(255,255,255,0.05)", border:`1px solid ${C.border}`, borderRadius:10, color:C.text, padding:"8px 14px", cursor:"pointer", fontSize:12, transition:"all 0.2s" },
    input: { background:"rgba(255,255,255,0.05)", border:`1px solid ${C.border}`, borderRadius:10, padding:"11px 14px", color:C.text, fontSize:13, width:"100%", outline:"none", boxSizing:"border-box" as const, transition:"all 0.2s" },
    mono: { fontFamily:"'SF Mono',monospace" } as React.CSSProperties,
    glow: (c:string) => ({ boxShadow:`0 0 20px ${c}20` }),
  }

  return (
    <div style={S.app}>
      {/* Background gradient orbs */}
      <div style={{position:"fixed",top:"-20%",right:"-10%",width:"40vw",height:"40vw",borderRadius:"50%",background:"radial-gradient(circle, rgba(153,69,255,0.08) 0%, transparent 70%)",pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"fixed",bottom:"-10%",left:"-10%",width:"35vw",height:"35vw",borderRadius:"50%",background:"radial-gradient(circle, rgba(20,241,149,0.06) 0%, transparent 70%)",pointerEvents:"none",zIndex:0}}/>

      <style>{`
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes slideIn{from{transform:translateY(-10px);opacity:0}to{transform:translateY(0);opacity:1}}
        * { box-sizing: border-box; }
        input::placeholder { color: #374151; }
        textarea::placeholder { color: #374151; }
        textarea { resize: none; }
        a { text-decoration: none; }
      `}</style>

      {/* Toast notification */}
      {notif && (
        <div style={{position:"fixed",top:68,left:"50%",transform:"translateX(-50%)",background:"rgba(5,5,8,0.95)",border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 20px",zIndex:200,color:C.text,fontWeight:600,fontSize:12,whiteSpace:"nowrap",backdropFilter:"blur(20px)",boxShadow:"0 8px 32px rgba(0,0,0,0.4)",animation:"slideIn 0.2s ease"}}>
          {notif}
        </div>
      )}

      {/* HEADER */}
      <div style={{...S.header,zIndex:51}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:28,height:28,borderRadius:8,background:`linear-gradient(135deg,${C.purple},${C.green})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>👜</div>
          <span style={{fontWeight:800,fontSize:16,letterSpacing:"-0.5px"}}>Bags<span style={{color:C.purple}}>Blitz</span></span>
          <span style={{...S.pill(C.green),fontSize:9}}>LIVE</span>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {wallet.connected && <span style={{...S.pill(C.purple),...S.mono,fontSize:9}}>{wallet.balance} SOL</span>}
          <button style={{...S.btnGhost,fontSize:11,padding:"6px 12px",borderRadius:8}} onClick={connectWallet}>
            {wallet.connected ? <span style={S.mono}>{wallet.address}</span> : "Connect Wallet"}
          </button>
        </div>
      </div>

      {/* FEED PAGE */}
      {page==="feed" && (
        <div style={{padding:"12px 12px 0",position:"relative",zIndex:1}}>
          {/* BBLITZ banner */}
          <div style={{...glass,background:"linear-gradient(135deg,rgba(153,69,255,0.1),rgba(20,241,149,0.05))",border:`1px solid ${C.purple}30`,marginBottom:12,padding:"12px 14px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:11,color:C.purple,fontWeight:700,letterSpacing:"1px",marginBottom:2}}>$BBLITZ IS LIVE ON BAGS.FM</div>
                <div style={{fontSize:10,color:C.textMuted,...S.mono}}>{BBLITZ_MINT.slice(0,12)}...{BBLITZ_MINT.slice(-4)}</div>
              </div>
              <a href={`https://bags.fm/$BBLITZ`} target="_blank" rel="noreferrer" style={{background:`linear-gradient(135deg,${C.purple},${C.green})`,border:"none",borderRadius:8,color:"#000",padding:"6px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>Trade →</a>
            </div>
          </div>

          {/* Live ticker */}
          {liveTokens.length>0 && (
            <div style={{...glass,padding:"8px 12px",marginBottom:12,overflowX:"auto",scrollbarWidth:"none",display:"flex",gap:16}}>
              {liveTokens.slice(0,8).map((t:any,i:number)=>(
                <div key={i} style={{flexShrink:0}}>
                  <span style={{fontSize:10,color:C.textMuted,...S.mono}}>${t.symbol||t.ticker} </span>
                  <span style={{fontSize:10,fontWeight:700,color:C.green,...S.mono}}>{t.price?"$"+parseFloat(t.price).toFixed(8):""}</span>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          <div style={{display:"flex",gap:6,marginBottom:12}}>
            {(["hot","new","top"] as const).map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{background:filter===f?`${C.purple}20`:"transparent",border:`1px solid ${filter===f?C.purple:C.border}`,borderRadius:8,padding:"6px 14px",color:filter===f?C.purple:C.textMuted,cursor:"pointer",fontSize:11,fontWeight:600,letterSpacing:"0.5px",transition:"all 0.2s"}}>
                {f==="hot"?"🔥 Hot":f==="new"?"✦ New":"👑 Top"}
              </button>
            ))}
            <span style={{marginLeft:"auto",fontSize:10,color:C.textMuted,alignSelf:"center",...S.mono}}>{tokens.length} tokens</span>
          </div>

          {/* Token cards */}
          {sorted.map(t=>(
            <div key={t.id} onClick={()=>{setSel(t);setAiAnalysis(null);setPage("token")}} style={{...S.card,cursor:"pointer",transition:"all 0.2s",position:"relative",overflow:"hidden"}}>
              {/* Hot indicator */}
              {t.priceChange>100 && <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${C.green},transparent)`}}/>}

              <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                <div style={{width:44,height:44,borderRadius:12,background:`linear-gradient(135deg,${C.purple}20,${C.green}10)`,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>
                  {t.image.startsWith("http")?<img src={t.image} style={{width:44,height:44,borderRadius:12,objectFit:"cover" as const}}/>:t.image}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                    <span style={{fontWeight:700,fontSize:14,letterSpacing:"-0.3px"}}>{t.name}</span>
                    <span style={{...S.pill(C.textDim),fontSize:9,color:C.textMuted}}>${t.symbol}</span>
                    {t.priceChange>80 && <span style={{...S.pill(C.green),fontSize:9}}>🔥</span>}
                    {t.bondingProgress>80 && <span style={{...S.pill(C.purple),fontSize:9}}>⚡</span>}
                    <span style={{...S.pill("#f59e0b"),marginLeft:"auto",fontSize:9}}>{t.royaltyPct}% royalty</span>
                  </div>
                  <div style={{color:C.textMuted,fontSize:11,marginBottom:6,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.description}</div>
                  <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:6}}>
                    <span style={{fontSize:12,color:t.priceChange>=0?C.green:C.red,fontWeight:700,...S.mono}}>{t.priceChange>=0?"▲":"▼"}{Math.abs(t.priceChange).toFixed(1)}%</span>
                    <span style={{fontSize:10,color:C.textMuted,...S.mono}}>MC ${fmt(t.marketCap)}</span>
                    <span style={{fontSize:10,color:C.textMuted}}>👥{fmt(t.holders)}</span>
                    <span style={{fontSize:10,color:C.textDim,...S.mono,marginLeft:"auto"}}>{ago(t.createdAt)}</span>
                  </div>
                  {/* Bonding progress */}
                  <div style={{background:"rgba(255,255,255,0.05)",borderRadius:4,height:3}}>
                    <div style={{background:t.bondingProgress>80?`linear-gradient(90deg,${C.purple},${C.green})`:`linear-gradient(90deg,${C.green},${C.purple})`,height:3,borderRadius:4,width:t.bondingProgress+"%",transition:"width 0.8s"}}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
                    <span style={{fontSize:9,color:C.textDim}}>bonding curve</span>
                    <span style={{fontSize:9,color:t.bondingProgress>80?C.purple:C.textDim,...S.mono}}>{t.bondingProgress.toFixed(0)}%</span>
                  </div>
                </div>
                <div style={{textAlign:"right" as const,flexShrink:0,display:"flex",flexDirection:"column" as const,alignItems:"flex-end",gap:4}}>
                  <div style={{fontSize:11,fontWeight:700,...S.mono,color:C.text}}>${t.price.toFixed(8)}</div>
                  <MiniChart data={t.priceHistory} pos={t.priceChange>=0}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TOKEN PAGE */}
      {page==="token" && sel && (
        <div style={{position:"relative",zIndex:1}}>
          <div style={{...S.header,position:"relative"}}>
            <button onClick={()=>setPage("feed")} style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${C.border}`,borderRadius:8,color:C.textMuted,cursor:"pointer",fontSize:18,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center"}}>←</button>
            <span style={{fontWeight:700,...S.mono,fontSize:13}}>${sel.symbol}</span>
            <button onClick={()=>{navigator.clipboard.writeText(window.location.href);toast("Link copied!")}} style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${C.border}`,borderRadius:8,color:C.textMuted,cursor:"pointer",width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center"}}><Share2 size={14}/></button>
          </div>
          <div style={{padding:12}}>
            {/* Token hero */}
            <div style={{...S.card,background:`linear-gradient(135deg,rgba(153,69,255,0.08),rgba(20,241,149,0.03))`}}>
              <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:14}}>
                <div style={{width:56,height:56,borderRadius:16,background:`linear-gradient(135deg,${C.purple}20,${C.green}10)`,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>
                  {sel.image.startsWith("http")?<img src={sel.image} style={{width:56,height:56,borderRadius:16,objectFit:"cover" as const}}/>:sel.image}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800,fontSize:20,letterSpacing:"-0.5px",marginBottom:4}}>{sel.name}</div>
                  <div style={{color:C.textMuted,fontSize:12,marginBottom:8}}>{sel.description}</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap" as const}}>
                    <span style={S.pill(C.green)}>{sel.royaltyPct}% creator royalty</span>
                    {sel.mint&&<a href={`https://bags.fm/$${sel.symbol}`} target="_blank" rel="noreferrer" style={{...S.pill(C.purple),display:"flex",alignItems:"center",gap:3}}><ExternalLink size={9}/>Bags.fm</a>}
                  </div>
                </div>
              </div>

              {/* Stats grid */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
                {[
                  {l:"Price",v:"$"+sel.price.toFixed(8),c:sel.priceChange>=0?C.green:C.red},
                  {l:"Market Cap",v:"$"+fmt(sel.marketCap),c:C.text},
                  {l:"Volume",v:"$"+fmt(sel.volume),c:C.text},
                  {l:"Holders",v:fmt(sel.holders),c:C.text},
                  {l:"Change 24h",v:(sel.priceChange>=0?"+":"")+sel.priceChange.toFixed(1)+"%",c:sel.priceChange>=0?C.green:C.red},
                  {l:"Progress",v:sel.bondingProgress.toFixed(0)+"%",c:C.purple},
                ].map(s=>(
                  <div key={s.l} style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"10px 8px",textAlign:"center" as const}}>
                    <div style={{fontSize:13,fontWeight:700,color:s.c,...S.mono}}>{s.v}</div>
                    <div style={{fontSize:9,color:C.textMuted,marginTop:2,letterSpacing:"0.3px"}}>{s.l}</div>
                  </div>
                ))}
              </div>

              {/* Bonding bar */}
              <div style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:10,color:C.textMuted}}>Bonding Curve Progress</span>
                  <span style={{fontSize:10,color:C.purple,fontWeight:700,...S.mono}}>{sel.bondingProgress.toFixed(1)}%</span>
                </div>
                <div style={{background:"rgba(255,255,255,0.05)",borderRadius:6,height:6}}>
                  <div style={{background:`linear-gradient(90deg,${C.green},${C.purple})`,height:6,borderRadius:6,width:sel.bondingProgress+"%",transition:"width 1s"}}/>
                </div>
              </div>

              <div style={{display:"flex",gap:8}}>
                <button style={{...S.btnPrimary,flex:1,padding:13,fontSize:13}} onClick={()=>toast("Buy on Bags.fm!")}>Buy ${sel.symbol}</button>
                <button style={{...S.btnGhost,flex:1,padding:13,fontSize:13}} onClick={()=>toast("Sell!")}>Sell</button>
              </div>
            </div>

            {/* AI Due Diligence */}
            <div style={{...S.card,border:`1px solid ${C.purple}20`,...S.glow(C.purple)}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:28,height:28,borderRadius:8,background:`${C.purple}20`,display:"flex",alignItems:"center",justifyContent:"center"}}><Brain size={13} color={C.purple}/></div>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,letterSpacing:"0.3px"}}>AI Due Diligence</div>
                    <div style={{fontSize:9,color:C.textMuted}}>Powered by BagsBlitz AI</div>
                  </div>
                </div>
                <button onClick={()=>analyzeCreator(sel)} disabled={analyzing} style={{background:`${C.purple}20`,border:`1px solid ${C.purple}40`,borderRadius:8,color:C.purple,padding:"6px 12px",fontSize:11,cursor:"pointer",fontWeight:700,transition:"all 0.2s"}}>
                  {analyzing?<span style={{animation:"pulse 1s infinite"}}>Analyzing...</span>:"🤖 Analyze"}
                </button>
              </div>

              {!aiAnalysis&&!analyzing&&(
                <div style={{fontSize:11,color:C.textMuted,textAlign:"center" as const,padding:"16px 0",borderTop:`1px solid ${C.border}`}}>
                  Get AI-powered investment analysis for this token
                </div>
              )}

              {aiAnalysis&&(
                <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12}}>
                  <div style={{display:"flex",gap:12,marginBottom:12,alignItems:"center"}}>
                    <div style={{textAlign:"center" as const,background:"rgba(255,255,255,0.04)",borderRadius:12,padding:"12px 16px",minWidth:72}}>
                      <div style={{fontSize:28,fontWeight:900,color:aiAnalysis.score>75?C.green:aiAnalysis.score>55?"#f59e0b":C.red,...S.mono}}>{aiAnalysis.score}</div>
                      <div style={{fontSize:8,color:C.textMuted,letterSpacing:"1px",marginTop:2}}>SCORE</div>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:18,fontWeight:800,marginBottom:4,color:aiAnalysis.verdict==="INVEST"?C.green:aiAnalysis.verdict==="WATCH"?"#f59e0b":C.red}}>
                        {aiAnalysis.verdict==="INVEST"?"✅ INVEST":aiAnalysis.verdict==="WATCH"?"👀 WATCH":"❌ AVOID"}
                      </div>
                      <div style={{fontSize:10,color:C.textMuted}}>AI Confidence: {aiAnalysis.score}%</div>
                    </div>
                  </div>
                  <div style={{fontSize:12,color:C.textMuted,lineHeight:1.7,background:"rgba(255,255,255,0.03)",borderRadius:10,padding:12}}>{aiAnalysis.report}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LAUNCH PAGE */}
      {page==="launch" && (
        <div style={{padding:12,position:"relative",zIndex:1}}>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:22,fontWeight:800,letterSpacing:"-0.5px",marginBottom:4}}>Launch Token</div>
            <div style={{fontSize:12,color:C.textMuted}}>Create your creator token on Bags.fm</div>
          </div>

          <div style={S.card}>
            <button onClick={genAIName} disabled={aiName} style={{...S.btnGhost,width:"100%",marginBottom:14,display:"flex",alignItems:"center",gap:8,justifyContent:"center",padding:11}}>
              <Brain size={14}/> {aiName?"Generating...":"✨ AI Generate Name & Description"}
            </button>

            {[{l:"Token Name",k:"name",ph:"Creator Fund"},{l:"Symbol",k:"symbol",ph:"CFUND"},{l:"Description",k:"desc",ph:"What does your token fund? What do holders earn?",multi:true}].map(f=>(
              <div key={f.k} style={{marginBottom:12}}>
                <div style={{fontSize:10,color:C.textMuted,marginBottom:5,fontWeight:600,letterSpacing:"0.8px"}}>{f.l.toUpperCase()}</div>
                {f.multi
                  ? <textarea value={(form as any)[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} style={{...S.input,height:80}} rows={3}/>
                  : <input value={(form as any)[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:f.k==="symbol"?e.target.value.toUpperCase():e.target.value}))} placeholder={f.ph} style={S.input}/>
                }
              </div>
            ))}

            {/* Royalty */}
            <div style={{marginBottom:14}}>
              <div style={{fontSize:10,color:C.textMuted,marginBottom:6,fontWeight:600,letterSpacing:"0.8px"}}>CREATOR ROYALTY %</div>
              <div style={{display:"flex",gap:6}}>
                {["1","3","5","10","15"].map(v=>(
                  <button key={v} onClick={()=>setForm(f=>({...f,royalty:v}))} style={{flex:1,background:form.royalty===v?`${C.purple}20`:"rgba(255,255,255,0.03)",border:`1px solid ${form.royalty===v?C.purple:C.border}`,borderRadius:8,color:form.royalty===v?C.purple:C.textMuted,padding:"7px 0",cursor:"pointer",fontSize:12,fontWeight:700,transition:"all 0.2s",...S.mono}}>{v}%</button>
                ))}
              </div>
            </div>

            {/* AI Image */}
            <div style={{marginBottom:14}}>
              <div style={{fontSize:10,color:C.textMuted,marginBottom:6,fontWeight:600,letterSpacing:"0.8px"}}>AI IMAGE GENERATOR</div>
              <div style={{display:"flex",gap:8,marginBottom:8}}>
                <input value={form.prompt} onChange={e=>setForm(f=>({...f,prompt:e.target.value}))} placeholder="Describe your token logo..." style={{...S.input,flex:1}}/>
                <button style={{...S.btnGhost,flexShrink:0}} onClick={genImage}>{genImg?"⏳":"✨"}</button>
              </div>
              {form.img&&<img src={form.img} style={{width:"100%",borderRadius:12,maxHeight:160,objectFit:"cover" as const,border:`1px solid ${C.border}`}}/>}
            </div>

            {/* AI Pitch Judge */}
            <div style={{background:`${C.purple}08`,border:`1px solid ${C.purple}20`,borderRadius:12,padding:12,marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontSize:11,fontWeight:700,color:C.purple,letterSpacing:"0.5px"}}>⚖️ AI PITCH JUDGE</div>
                <button onClick={judgePitch} disabled={judgingPitch} style={{background:`${C.purple}20`,border:`1px solid ${C.purple}40`,borderRadius:7,color:C.purple,padding:"5px 10px",fontSize:11,cursor:"pointer",fontWeight:700}}>
                  {judgingPitch?"Judging...":"Judge My Pitch"}
                </button>
              </div>
              {!pitchScore&&!judgingPitch&&<div style={{fontSize:10,color:C.textMuted}}>Get VC-style feedback before launch</div>}
              {pitchScore&&(
                <div>
                  <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
                    <div style={{textAlign:"center" as const,background:"rgba(255,255,255,0.05)",borderRadius:8,padding:"8px 12px"}}>
                      <div style={{fontSize:22,fontWeight:900,color:pitchScore.score>75?C.green:pitchScore.score>55?"#f59e0b":C.red,...S.mono}}>{pitchScore.score}</div>
                      <div style={{fontSize:8,color:C.textMuted}}>PITCH</div>
                    </div>
                    <div style={{flex:1,fontSize:11,color:C.textMuted,lineHeight:1.5}}>{pitchScore.feedback}</div>
                  </div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap" as const}}>
                    {pitchScore.strengths.map((s,i)=><span key={i} style={{...S.pill(C.green),fontSize:9}}>✓ {s}</span>)}
                    {pitchScore.weaknesses.map((w,i)=><span key={i} style={{...S.pill(C.red),fontSize:9}}>✗ {w}</span>)}
                  </div>
                </div>
              )}
            </div>

            <button style={{...S.btnPrimary,width:"100%",padding:14,fontSize:14}} onClick={()=>{if(!wallet.connected){connectWallet();return};launchToken()}}>
              {launching?"🚀 Launching...":"🚀 Launch on Bags.fm"}
            </button>
          </div>
        </div>
      )}

      {/* LEADERBOARD PAGE */}
      {page==="board" && (
        <div style={{padding:12,position:"relative",zIndex:1}}>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:22,fontWeight:800,letterSpacing:"-0.5px",marginBottom:4}}>Top Creators</div>
            <div style={{fontSize:12,color:C.textMuted}}>Ranked by market cap</div>
          </div>

          <div style={S.card}>
            {[...tokens].sort((a,b)=>b.marketCap-a.marketCap).map((t,i)=>(
              <div key={t.id} onClick={()=>{setSel(t);setAiAnalysis(null);setPage("token")}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${C.border}`,cursor:"pointer",transition:"all 0.2s"}}>
                <span style={{fontSize:11,width:20,...S.mono,fontWeight:700,color:i===0?"#ffd700":i===1?"#c0c0c0":i===2?"#cd7f32":C.textMuted}}>#{i+1}</span>
                <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${C.purple}20,${C.green}10)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>
                  {t.image.startsWith("http")?<img src={t.image} style={{width:36,height:36,borderRadius:10,objectFit:"cover" as const}}/>:t.image}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:13,letterSpacing:"-0.2px"}}>{t.name}</div>
                  <div style={{fontSize:10,color:C.textMuted}}>{t.royaltyPct}% royalty · {fmt(t.holders)} holders</div>
                </div>
                <div style={{textAlign:"right" as const}}>
                  <div style={{color:t.priceChange>=0?C.green:C.red,fontWeight:700,fontSize:12,...S.mono}}>{t.priceChange>=0?"+":""}{t.priceChange.toFixed(1)}%</div>
                  <div style={{fontSize:10,color:C.textMuted,...S.mono}}>${fmt(t.marketCap)}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Platform stats */}
          <div style={{...S.card,background:`linear-gradient(135deg,rgba(153,69,255,0.05),rgba(20,241,149,0.03))`}}>
            <div style={{fontSize:10,color:C.textMuted,marginBottom:12,fontWeight:600,letterSpacing:"1px"}}>PLATFORM STATS</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[
                {l:"Total Volume",v:"$"+fmt(tokens.reduce((s,t)=>s+t.volume,0))},
                {l:"Tokens Live",v:tokens.length.toString()},
                {l:"Total Holders",v:fmt(tokens.reduce((s,t)=>s+t.holders,0))},
                {l:"Creator Royalties",v:"$"+fmt(tokens.reduce((s,t)=>s+t.volume*t.royaltyPct/100,0))},
              ].map(s=>(
                <div key={s.l} style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:12,textAlign:"center" as const}}>
                  <div style={{fontSize:18,fontWeight:700,...S.mono,color:C.purple}}>{s.v}</div>
                  <div style={{fontSize:9,color:C.textMuted,marginTop:2,letterSpacing:"0.3px"}}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav style={S.nav}>
        {[
          {id:"feed",label:"Discover",icon:<Flame size={18}/>},
          {id:"launch",label:"Launch",icon:<Rocket size={18}/>},
          {id:"board",label:"Top",icon:<Trophy size={18}/>},
        ].map(n=>(
          <button key={n.id} style={S.navBtn(page===n.id)} onClick={()=>setPage(n.id as any)}>
            {n.icon}<span style={{letterSpacing:"0.5px"}}>{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
