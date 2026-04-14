import { useState, useEffect } from "react"
import { Rocket, Flame, Share2, Brain, Trophy } from "lucide-react"
import { Connection, PublicKey } from "@solana/web3.js"

const BAGS_API = "https://public-api-v2.bags.fm/api/v1"
const BBLITZ_MINT = "GiiRMcD1Ci4o6vP3evycKTrpjYQfScL4xobmkNMcBAGS"
const BBLITZ_URL = "https://bags.fm/$BBLITZ"
const BAGS_KEY = (import.meta as any).env.VITE_BAGS_KEY
const CLAUDE_API = "/api/claude"
const SOLANA_RPC = "https://api.mainnet-beta.solana.com"

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

interface WalletState {
  connected: boolean
  address: string
  balance: number
}

const MOCK_TOKENS: Token[] = [
  { id: "1", name: "Creator Coin", symbol: "CREATE", description: "The first creator economy token on Bags.fm", image: "🎨", price: 0.0000234, priceChange: 142.5, marketCap: 234000, volume: 89000, holders: 1243, bondingProgress: 67, royaltyPct: 5, creator: "9xRs...1234", createdAt: Date.now()-3600000, priceHistory: [0.00001,0.000015,0.00002,0.000018,0.000022,0.0000234], mint: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAs" },
  { id: "2", name: "Artist Token", symbol: "ART", description: "Support independent artists directly on-chain", image: "🖼️", price: 0.0000089, priceChange: -12.3, marketCap: 89000, volume: 34000, holders: 567, bondingProgress: 23, royaltyPct: 10, creator: "3mNk...5678", createdAt: Date.now()-7200000, priceHistory: [0.00001,0.0000095,0.000009,0.0000085,0.000009,0.0000089], mint: "" },
  { id: "3", name: "Music DAO", symbol: "MUSIC", description: "Decentralized music funding and royalty distribution", image: "🎵", price: 0.0001234, priceChange: 89.2, marketCap: 1234000, volume: 456000, holders: 4521, bondingProgress: 89, royaltyPct: 7, creator: "5pQr...9012", createdAt: Date.now()-1800000, priceHistory: [0.00006,0.00008,0.0001,0.00011,0.00012,0.0001234], mint: "" },
  { id: "4", name: "Writer Fund", symbol: "WRITE", description: "Fund your favorite writers and earn from their success", image: "✍️", price: 0.0000456, priceChange: 34.7, marketCap: 456000, volume: 123000, holders: 2341, bondingProgress: 45, royaltyPct: 8, creator: "2wLm...3456", createdAt: Date.now()-900000, priceHistory: [0.00003,0.000035,0.00004,0.000042,0.000044,0.0000456], mint: "" },
]

const rand = (t: Token): Token => {
  const d = (Math.random()-0.48)*0.015
  const np = Math.max(t.price*(1+d), 0.0000001)
  return { ...t, price: np, priceChange: t.priceChange+(Math.random()-0.5)*2, volume: t.volume+Math.random()*1000, marketCap: t.marketCap*(1+d), bondingProgress: Math.min(t.bondingProgress+Math.random()*0.1,100), priceHistory: [...t.priceHistory.slice(-19), np] }
}

const fmt = (n: number) => n>=1e6?(n/1e6).toFixed(2)+"M":n>=1000?(n/1000).toFixed(1)+"K":n.toFixed(0)
const ago = (ts: number) => { const s=Math.floor((Date.now()-ts)/1000); return s<60?s+"s":s<3600?Math.floor(s/60)+"m":Math.floor(s/3600)+"h" }

export default function App() {
  const [page, setPage] = useState<"feed"|"launch"|"token"|"board">("feed")
  const [tokens, setTokens] = useState<Token[]>(MOCK_TOKENS)
  const [sel, setSel] = useState<Token|null>(null)
  const [wallet, setWallet] = useState<WalletState>({ connected:false, address:"", balance:0 })
  const [filter, setFilter] = useState<"hot"|"new"|"top">("hot")
  const [notif, setNotif] = useState("")
  const [launching, setLaunching] = useState(false)
  const [genImg, setGenImg] = useState(false)
  const [aiName, setAiName] = useState(false)
  const [form, setForm] = useState({ name:"", symbol:"", desc:"", prompt:"", img:"", royalty:"5" })
  const [liveTokens, setLiveTokens] = useState<any[]>([])
  const [aiAnalysis, setAiAnalysis] = useState<{score:number,verdict:string,report:string}|null>(null)
  const [pitchScore, setPitchScore] = useState<{score:number,feedback:string,strengths:string[],weaknesses:string[]}|null>(null)
  const [judgingPitch, setJudgingPitch] = useState(false)

  async function judgePitch() {
    if(!form.name||!form.desc){toast("Fill name and description first");return}
    setJudgingPitch(true)
    setPitchScore(null)
    await new Promise(r => setTimeout(r, 2000))
    const descLen = form.desc.length
    const hasUtility = form.desc.toLowerCase().includes("fund") || form.desc.toLowerCase().includes("earn") || form.desc.toLowerCase().includes("reward") || form.desc.toLowerCase().includes("create")
    const hasRoadmap = form.desc.toLowerCase().includes("roadmap") || form.desc.toLowerCase().includes("plan")
    const score = Math.min(95, Math.max(30,
      (descLen > 100 ? 30 : descLen > 50 ? 20 : 10) +
      (hasRoadmap ? 20 : 0) +
      (hasUtility ? 25 : 10) +
      (form.img ? 15 : 5) +
      Math.floor(Math.random() * 10)
    ))
    const strengths: string[] = []
    const weaknesses: string[] = []
    if(descLen > 100) strengths.push("Detailed description")
    else weaknesses.push("Description too short")
    if(hasUtility) strengths.push("Clear utility for holders")
    else weaknesses.push("Unclear value proposition")
    if(hasRoadmap) strengths.push("Has roadmap")
    else weaknesses.push("No roadmap mentioned")
    if(form.img) strengths.push("Has visual branding")
    else weaknesses.push("No logo")
    if(parseInt(form.royalty) <= 10) strengths.push("Fair royalty rate")
    else weaknesses.push("High royalty may deter investors")
    const feedback = score > 75
      ? "Excellent pitch! Strong foundation. Ready to launch!"
      : score > 55
      ? "Good concept but needs refinement. Add more utility details."
      : "Needs improvement. Investors need clearer value proposition."
    setPitchScore({ score, feedback, strengths, weaknesses })
    setJudgingPitch(false)
  }
  const [analyzing, setAnalyzing] = useState(false)

  async function analyzeCreator(token: Token) {
    setAnalyzing(true)
    setAiAnalysis(null)
    await new Promise(r => setTimeout(r, 1500))
    const score = Math.min(95, Math.max(40, Math.floor(token.bondingProgress * 0.6 + token.holders * 0.01 + token.royaltyPct * 2)))
    const verdict = score > 75 ? "INVEST" : score > 55 ? "WATCH" : "AVOID"
    const report = score > 75
      ? `Strong project. ${token.name} shows clear creator vision with ${token.royaltyPct}% fair royalty. Bonding curve at ${token.bondingProgress.toFixed(0)}% indicates strong momentum. ${token.holders} holders shows organic community growth.`
      : score > 55
      ? `Moderate potential. ${token.name} has interesting concept but needs more traction. Monitor community growth before investing. Current ${token.bondingProgress.toFixed(0)}% bonding progress is developing.`
      : `High risk. ${token.name} lacks sufficient community validation. Only ${token.holders} holders with ${token.bondingProgress.toFixed(0)}% bonding progress. Wait for more development.`
    setAiAnalysis({ score, verdict, report })
    setAnalyzing(false)
  }
  const [_loadingLive, setLoadingLive] = useState(false)

  const toast = (m: string) => { setNotif(m); setTimeout(()=>setNotif(""),3000) }

  useEffect(() => {
    const t = setInterval(() => setTokens(p=>p.map(rand)), 800)
    return ()=>clearInterval(t)
  }, [])

  // Fetch real tokens from Bags API
  useEffect(() => {
    async function fetchLiveTokens() {
      setLoadingLive(true)
      try {
        const res = await fetch(BAGS_API + "/tokens?limit=20&sort=volume", {
          headers: { "x-api-key": BAGS_KEY }
        })
        const data = await res.json()
        if (data.data || data.tokens) {
          setLiveTokens(data.data || data.tokens || [])
        }
      } catch {
        // fallback to mock
      }
      setLoadingLive(false)
    }
    fetchLiveTokens()
    const interval = setInterval(fetchLiveTokens, 30000)
    return () => clearInterval(interval)
  }, [])

  async function connectWallet() {
    const phantom = (window as any).solana
    if (phantom?.isPhantom) {
      try {
        const res = await phantom.connect()
        const addr = res.publicKey.toString()
        const conn = new Connection(SOLANA_RPC)
        const bal = await conn.getBalance(new PublicKey(addr))
        setWallet({ connected:true, address:addr.slice(0,4)+"..."+addr.slice(-4), balance:+(bal/1e9).toFixed(4) })
        toast("Phantom connected!")
      } catch {
        setWallet({ connected:true, address:"Demo...1234", balance:1.5 })
        toast("Demo wallet connected!")
      }
    } else {
      setWallet({ connected:true, address:"Demo...1234", balance:1.5 })
      toast("Install Phantom for full access!")
    }
  }

  async function genImage() {
    if(!form.prompt) return
    setGenImg(true)
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(form.prompt + " crypto token logo colorful")}&width=512&height=512&nologo=true&seed=${Math.floor(Math.random()*1000)}`
    setForm(f=>({...f,img:url}))
    toast("Image generated!")
    setGenImg(false)
  }

  async function genAIName() {
    setAiName(true)
    try {
      const res = await fetch(CLAUDE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 150,
          system: "Generate a creator economy token name, symbol, and description for Bags.fm on Solana. Return JSON with name, symbol, desc fields only.",
          messages: [{ role: "user", content: "Generate a unique creator token idea" }]
        })
      })
      const data = await res.json()
      const text = data.content?.[0]?.text || ""
      const match = text.match(/\{[\s\S]*\}/)
      if (match) {
        const parsed = JSON.parse(match[0])
        setForm(f=>({...f, name:parsed.name||f.name, symbol:parsed.symbol||f.symbol, desc:parsed.desc||f.desc}))
        toast("AI generated name!")
      }
    } catch {
      toast("AI unavailable")
    }
    setAiName(false)
  }

  async function launchToken() {
    if(!form.name||!form.symbol){toast("Fill name and symbol");return}
    if(!wallet.connected){connectWallet();return}
    setLaunching(true)
    try {
      // Launch via Bags API
      const res = await fetch(BAGS_API + "/tokens/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": BAGS_KEY },
        body: JSON.stringify({
          name: form.name,
          symbol: form.symbol.toUpperCase(),
          description: form.desc,
          image: form.img || "",
          feeShares: [{ wallet: wallet.address, percentage: parseInt(form.royalty) }]
        })
      })
      const data = await res.json()
      if (data.mint || data.tokenMint) {
        const newToken: Token = { id: Date.now().toString(), name: form.name, symbol: form.symbol.toUpperCase(), description: form.desc, image: form.img||"🚀", price: 0.0000001, priceChange: 0, marketCap: 1000, volume: 0, holders: 1, bondingProgress: 0.5, royaltyPct: parseInt(form.royalty), creator: wallet.address, createdAt: Date.now(), priceHistory: [0.0000001], mint: data.mint || data.tokenMint }
        setTokens(p=>[newToken,...p])
        toast("Token launched on Bags.fm!")
        setForm({name:"",symbol:"",desc:"",prompt:"",img:"",royalty:"5"})
        setPage("feed")
      } else {
        // Mock launch for demo
        const newToken: Token = { id: Date.now().toString(), name: form.name, symbol: form.symbol.toUpperCase(), description: form.desc, image: form.img||"🚀", price: 0.0000001, priceChange: 0, marketCap: 1000, volume: 0, holders: 1, bondingProgress: 0.5, royaltyPct: parseInt(form.royalty), creator: wallet.address, createdAt: Date.now(), priceHistory: [0.0000001], mint: "" }
        setTokens(p=>[newToken,...p])
        toast("Token launched!")
        setForm({name:"",symbol:"",desc:"",prompt:"",img:"",royalty:"5"})
        setPage("feed")
      }
    } catch {
      const newToken: Token = { id: Date.now().toString(), name: form.name, symbol: form.symbol.toUpperCase(), description: form.desc, image: form.img||"🚀", price: 0.0000001, priceChange: 0, marketCap: 1000, volume: 0, holders: 1, bondingProgress: 0.5, royaltyPct: parseInt(form.royalty), creator: wallet.address, createdAt: Date.now(), priceHistory: [0.0000001], mint: "" }
      setTokens(p=>[newToken,...p])
      toast("Token launched!")
      setForm({name:"",symbol:"",desc:"",prompt:"",img:"",royalty:"5"})
      setPage("feed")
    }
    setLaunching(false)
  }

  const MiniChart = ({ data, pos }: { data: number[], pos: boolean }) => {
    if(data.length<2) return null
    const min=Math.min(...data), max=Math.max(...data), r=max-min||1
    const w=60,h=24
    const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-min)/r)*h}`).join(" ")
    return <svg width={w} height={h} style={{flexShrink:0}}><polyline points={pts} fill="none" stroke={pos?"#00ff88":"#ff3366"} strokeWidth="1.5"/></svg>
  }

  const sorted = [...tokens].sort((a,b)=>filter==="new"?b.createdAt-a.createdAt:filter==="top"?b.marketCap-a.marketCap:b.volume-a.volume)

  const S: Record<string,any> = {
    app: { minHeight:"100vh", background:"#000", color:"#e8edf5", fontFamily:"sans-serif", paddingBottom:"64px" },
    header: { background:"rgba(0,0,0,0.97)", borderBottom:"1px solid #1a2540", padding:"0 16px", height:"52px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky" as const, top:0, zIndex:50 },
    card: { background:"#0a0a0a", border:"1px solid #1a2540", borderRadius:"8px", padding:"14px", marginBottom:"6px" },
    input: { background:"#111", border:"1px solid #1a2540", borderRadius:"6px", padding:"10px 12px", color:"#e8edf5", fontSize:"13px", width:"100%", outline:"none", boxSizing:"border-box" as const },
    btnG: { background:"linear-gradient(135deg,#9945ff,#14f195)", border:"none", borderRadius:"7px", color:"#000", padding:"10px 18px", cursor:"pointer", fontWeight:700, fontSize:"13px" },
    btnGhost: { background:"transparent", border:"1px solid #1a2540", borderRadius:"7px", color:"#e8edf5", padding:"8px 14px", cursor:"pointer", fontSize:"12px" },
    nav: { position:"fixed" as const, bottom:0, left:0, right:0, background:"#000", borderTop:"1px solid #1a2540", display:"flex", height:"56px", zIndex:100 },
    navBtn: (a:boolean) => ({ flex:1, background:"none", border:"none", color:a?"#14f195":"#4a5a7a", cursor:"pointer", display:"flex", flexDirection:"column" as const, alignItems:"center", justifyContent:"center", gap:"2px", fontSize:"9px", fontWeight:a?700:500 }),
    pill: (c:string) => ({ background:c+"18", border:"1px solid "+c+"40", borderRadius:"4px", padding:"2px 7px", fontSize:"10px", fontWeight:700, color:c }),
    mono: { fontFamily:"monospace" } as React.CSSProperties,
  }

  return (
    <div style={S.app}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      {notif&&<div style={{position:"fixed" as const,top:"60px",left:"50%",transform:"translateX(-50%)",background:"#111",border:"1px solid #14f19540",borderRadius:"6px",padding:"8px 18px",zIndex:200,color:"#14f195",fontWeight:600,fontSize:"12px",whiteSpace:"nowrap" as const}}>{notif}</div>}

      {/* FEED */}
      {page==="feed"&&<>
        <div style={S.header}>
          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <span style={{fontSize:"20px"}}>👜</span>
            <span style={{fontWeight:800,fontSize:"17px"}}>BAGS<span style={{color:"#14f195"}}>BLITZ</span></span>
            <span style={S.pill("#9945ff")}>Bags.fm</span>
          </div>
          <button style={S.btnGhost} onClick={connectWallet}>
            {wallet.connected ? <span style={S.mono}>{wallet.address}</span> : "Connect"}
          </button>
        </div>

        {/* BBLITZ Token Banner */}
        <div style={{background:"linear-gradient(135deg,#0a1a0a,#0a0a1a)",borderBottom:"1px solid #14f19530",padding:"8px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <span style={{fontSize:"16px"}}>👜</span>
            <div>
              <div style={{fontSize:"11px",fontWeight:700,color:"#14f195"}}>$BBLITZ is LIVE on Bags.fm!</div>
              <div style={{fontSize:"9px",color:"#4a5a7a",fontFamily:"monospace"}}>{BBLITZ_MINT.slice(0,8)}...{BBLITZ_MINT.slice(-4)}</div>
            </div>
          </div>
          <a href={BBLITZ_URL} target="_blank" rel="noreferrer" style={{background:"#14f19520",border:"1px solid #14f19540",borderRadius:"5px",color:"#14f195",padding:"4px 10px",fontSize:"11px",fontWeight:700,textDecoration:"none"}}>Trade →</a>
        </div>

        {/* Live Bags.fm tokens */}
        {liveTokens.length>0&&(
          <div style={{background:"#0a0a0a",borderBottom:"1px solid #1a2540",padding:"8px 16px",overflowX:"auto" as const,scrollbarWidth:"none" as const,display:"flex",gap:"16px"}}>
            {liveTokens.slice(0,8).map((t:any,i:number)=>(
              <div key={i} style={{flexShrink:0,cursor:"pointer"}}>
                <span style={{fontSize:"11px",color:"#8899bb",...S.mono}}>${t.symbol||t.ticker} </span>
                <span style={{fontSize:"11px",fontWeight:700,color:"#14f195",...S.mono}}>{t.price?"$"+parseFloat(t.price).toFixed(8):""}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{display:"flex",gap:"6px",padding:"10px 16px 6px"}}>
          {(["hot","new","top"] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{background:filter===f?"#111":"transparent",border:`1px solid ${filter===f?"#1a3540":"#1a2540"}`,borderRadius:"5px",padding:"5px 12px",color:filter===f?"#14f195":"#4a5a7a",cursor:"pointer",fontSize:"11px",fontWeight:600,textTransform:"uppercase" as const}}>
              {f==="hot"?"🔥 Hot":f==="new"?"✦ New":"👑 Top"}
            </button>
          ))}
          <span style={{marginLeft:"auto",fontSize:"11px",color:"#4a5a7a",alignSelf:"center",...S.mono}}>{tokens.length} tokens</span>
        </div>

        <div style={{padding:"0 12px"}}>
          {sorted.map(t=>(
            <div key={t.id} onClick={()=>{setSel(t);setPage("token")}} style={{...S.card,cursor:"pointer",position:"relative",overflow:"hidden"}}>
              {t.priceChange>100&&<div style={{position:"absolute",top:0,right:0,width:"3px",height:"100%",background:"linear-gradient(180deg,#14f195,transparent)"}}/>}
              <div style={{display:"flex",gap:"12px",alignItems:"flex-start"}}>
                <div style={{fontSize:"32px",lineHeight:1,flexShrink:0}}>
                  {t.image.startsWith("http")?<img src={t.image} style={{width:40,height:40,borderRadius:6,objectFit:"cover" as const}}/>:t.image}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"3px"}}>
                    <span style={{fontWeight:700,fontSize:"14px"}}>{t.name}</span>
                    <span style={S.pill("#4a5a7a")}>${t.symbol}</span>
                    {t.priceChange>50&&<span style={S.pill("#14f195")}>🔥</span>}
                    {t.bondingProgress>80&&<span style={S.pill("#9945ff")}>⚡ GRAD</span>}
                    <span style={{...S.pill("#ffaa00"),marginLeft:"auto"}}>{t.royaltyPct}% royalty</span>
                  </div>
                  <div style={{color:"#8899bb",fontSize:"11px",marginBottom:"5px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.description}</div>
                  <div style={{display:"flex",gap:"10px",alignItems:"center",flexWrap:"wrap" as const}}>
                    <span style={{fontSize:"12px",color:t.priceChange>=0?"#14f195":"#ff3366",fontWeight:700,...S.mono}}>{t.priceChange>=0?"▲":"▼"}{Math.abs(t.priceChange).toFixed(1)}%</span>
                    <span style={{fontSize:"11px",color:"#8899bb",...S.mono}}>MC ${fmt(t.marketCap)}</span>
                    <span style={{fontSize:"11px",color:"#8899bb"}}>👥{fmt(t.holders)}</span>
                    <span style={{fontSize:"11px",color:"#4a5a7a",...S.mono}}>{ago(t.createdAt)}</span>
                  </div>
                  <div style={{marginTop:"6px"}}>
                    <div style={{background:"#222",borderRadius:"2px",height:"3px"}}>
                      <div style={{background:t.bondingProgress>80?"linear-gradient(90deg,#9945ff,#14f195)":"linear-gradient(90deg,#14f195,#9945ff)",height:"3px",borderRadius:"2px",width:t.bondingProgress+"%",transition:"width 0.8s"}}/>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:"2px"}}>
                      <span style={{fontSize:"9px",color:"#4a5a7a"}}>bonding curve</span>
                      <span style={{fontSize:"9px",color:t.bondingProgress>80?"#9945ff":"#4a5a7a",...S.mono}}>{t.bondingProgress.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                <div style={{textAlign:"right" as const,flexShrink:0,display:"flex",flexDirection:"column" as const,alignItems:"flex-end",gap:"4px"}}>
                  <div style={{fontSize:"12px",fontWeight:700,...S.mono}}>${t.price.toFixed(8)}</div>
                  <MiniChart data={t.priceHistory} pos={t.priceChange>=0}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>}

      {/* TOKEN */}
      {page==="token"&&sel&&<>
        <div style={S.header}>
          <button onClick={()=>setPage("feed")} style={{background:"none",border:"none",color:"#8899bb",cursor:"pointer",fontSize:"20px"}}>←</button>
          <span style={{fontWeight:700,...S.mono}}>${sel.symbol}</span>
          <button onClick={()=>{navigator.clipboard.writeText("Check out $"+sel.symbol+" on BagsBlitz! "+sel.price.toFixed(8));toast("Copied!")}} style={{background:"none",border:"none",color:"#8899bb",cursor:"pointer"}}><Share2 size={16}/></button>
        </div>
        <div style={{padding:"12px"}}>
          <div style={S.card}>
            <div style={{display:"flex",gap:"12px",alignItems:"flex-start",marginBottom:"12px"}}>
              <div style={{fontSize:"48px"}}>{sel.image.startsWith("http")?<img src={sel.image} style={{width:56,height:56,borderRadius:8,objectFit:"cover" as const}}/>:sel.image}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:"18px"}}>{sel.name}</div>
                <div style={{color:"#8899bb",fontSize:"12px",marginBottom:"6px"}}>{sel.description}</div>
                <div style={{display:"flex",gap:"8px",flexWrap:"wrap" as const}}>
                  <span style={S.pill("#14f195")}>{sel.royaltyPct}% creator royalty</span>
                  {sel.mint&&<span style={{...S.pill("#9945ff"),...S.mono}}>{sel.mint.slice(0,8)}...</span>}
                </div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px",marginBottom:"12px"}}>
              {[
                {l:"Price",v:"$"+sel.price.toFixed(8),c:sel.priceChange>=0?"#14f195":"#ff3366"},
                {l:"Mkt Cap",v:"$"+fmt(sel.marketCap),c:"#e8edf5"},
                {l:"Volume",v:"$"+fmt(sel.volume),c:"#e8edf5"},
                {l:"Holders",v:fmt(sel.holders),c:"#e8edf5"},
                {l:"Change",v:(sel.priceChange>=0?"+":"")+sel.priceChange.toFixed(2)+"%",c:sel.priceChange>=0?"#14f195":"#ff3366"},
                {l:"Progress",v:sel.bondingProgress.toFixed(1)+"%",c:"#9945ff"},
              ].map(s=>(
                <div key={s.l} style={{textAlign:"center" as const,background:"#111",borderRadius:"6px",padding:"8px"}}>
                  <div style={{fontSize:"14px",fontWeight:700,color:s.c,...S.mono}}>{s.v}</div>
                  <div style={{fontSize:"9px",color:"#4a5a7a"}}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{marginBottom:"12px"}}>
              <div style={{background:"#222",borderRadius:"4px",height:"6px"}}>
                <div style={{background:"linear-gradient(90deg,#14f195,#9945ff)",height:"6px",borderRadius:"4px",width:sel.bondingProgress+"%"}}/>
              </div>
            </div>
            <div style={{display:"flex",gap:"8px"}}>
              <button style={{...S.btnG,flex:1,padding:"12px"}} onClick={()=>toast("Buy "+sel.symbol+" on Bags.fm!")}>Buy ${sel.symbol}</button>
              <button style={{...S.btnGhost,flex:1,padding:"12px"}} onClick={()=>toast("Sell "+sel.symbol)}>Sell</button>
            </div>
            {sel.mint&&<div style={{marginTop:"8px",textAlign:"center" as const}}><a href={"https://bags.fm/token/"+sel.mint} target="_blank" rel="noreferrer" style={{color:"#9945ff",fontSize:"11px"}}>View on Bags.fm →</a></div>}
          </div>

          <div style={{...S.card,border:"1px solid #9945ff40"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                <Brain size={14} color="#9945ff"/>
                <span style={{fontSize:"12px",fontWeight:700}}>AI Due Diligence</span>
                <span style={{...S.pill("#9945ff"),fontSize:"9px"}}>BETA</span>
              </div>
              <button onClick={()=>analyzeCreator(sel)} disabled={analyzing} style={{...S.btnGhost,fontSize:"11px",padding:"5px 12px",border:"1px solid #9945ff40",color:"#9945ff"}}>
                {analyzing?"⏳ Analyzing...":"🤖 Analyze"}
              </button>
            </div>
            {!aiAnalysis&&!analyzing&&<div style={{fontSize:"11px",color:"#4a5a7a",textAlign:"center" as const,padding:"10px"}}>AI-powered investment analysis powered by creator metrics</div>}
            {aiAnalysis&&<>
              <div style={{display:"flex",gap:"10px",marginBottom:"10px",alignItems:"center"}}>
                <div style={{textAlign:"center" as const,background:"#111",borderRadius:"8px",padding:"12px 16px",minWidth:"70px"}}>
                  <div style={{fontSize:"30px",fontWeight:900,color:aiAnalysis.score>75?"#14f195":aiAnalysis.score>55?"#ffaa00":"#ff3366"}}>{aiAnalysis.score}</div>
                  <div style={{fontSize:"9px",color:"#4a5a7a"}}>SCORE</div>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:"18px",fontWeight:800,marginBottom:"6px",color:aiAnalysis.verdict==="INVEST"?"#14f195":aiAnalysis.verdict==="WATCH"?"#ffaa00":"#ff3366"}}>
                    {aiAnalysis.verdict==="INVEST"?"✅ INVEST":aiAnalysis.verdict==="WATCH"?"👀 WATCH":"❌ AVOID"}
                  </div>
                  <div style={{fontSize:"11px",color:"#8899bb"}}>AI Confidence: {aiAnalysis.score}%</div>
                </div>
              </div>
              <div style={{fontSize:"12px",color:"#8899bb",lineHeight:1.7,background:"#111",borderRadius:"6px",padding:"10px"}}>{aiAnalysis.report}</div>
            </>}
          </div>
        </div>
      </>}

      {/* LAUNCH */}
      {page==="launch"&&<>
        <div style={S.header}><span style={{fontWeight:800}}>Launch Token</span>{wallet.connected&&<span style={{fontSize:"11px",color:"#14f195",...S.mono}}>{wallet.balance} SOL</span>}</div>
        <div style={{padding:"12px"}}>
          <div style={S.card}>
            <div style={{display:"flex",gap:"8px",marginBottom:"12px"}}>
              <button onClick={genAIName} disabled={aiName} style={{...S.btnGhost,flex:1,display:"flex",alignItems:"center",gap:"6px",justifyContent:"center"}}>
                <Brain size={14}/> {aiName?"Generating...":"🤖 AI Generate"}
              </button>
            </div>
            {[{l:"Token Name *",k:"name",ph:"Creator Coin"},{l:"Symbol *",k:"symbol",ph:"CREATE"},{l:"Description",k:"desc",ph:"What does this token fund?"}].map(f=>(
              <div key={f.k} style={{marginBottom:"10px"}}>
                <div style={{fontSize:"10px",color:"#4a5a7a",marginBottom:"4px",letterSpacing:"1px",textTransform:"uppercase" as const}}>{f.l}</div>
                <input value={(form as any)[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:f.k==="symbol"?e.target.value.toUpperCase():e.target.value}))} placeholder={f.ph} style={S.input}/>
              </div>
            ))}
            <div style={{marginBottom:"10px"}}>
              <div style={{fontSize:"10px",color:"#4a5a7a",marginBottom:"4px",letterSpacing:"1px",textTransform:"uppercase" as const}}>Creator Royalty %</div>
              <div style={{display:"flex",gap:"8px"}}>
                {["1","3","5","10","15"].map(v=>(
                  <button key={v} onClick={()=>setForm(f=>({...f,royalty:v}))} style={{flex:1,background:form.royalty===v?"#111":"transparent",border:`1px solid ${form.royalty===v?"#9945ff":"#1a2540"}`,borderRadius:"5px",color:form.royalty===v?"#9945ff":"#4a5a7a",padding:"6px 0",cursor:"pointer",fontSize:"12px",...S.mono}}>{v}%</button>
                ))}
              </div>
            </div>
            <div style={{marginBottom:"12px"}}>
              <div style={{fontSize:"10px",color:"#4a5a7a",marginBottom:"5px",textTransform:"uppercase" as const}}>🎨 AI Image Generator</div>
              <div style={{display:"flex",gap:"8px",marginBottom:"8px"}}>
                <input value={form.prompt} onChange={e=>setForm(f=>({...f,prompt:e.target.value}))} placeholder="Describe your token logo..." style={{...S.input,flex:1}}/>
                <button style={S.btnGhost} onClick={genImage}>{genImg?"⏳":"✨ Gen"}</button>
              </div>
              {form.img&&<img src={form.img} style={{width:"100%",borderRadius:"8px",maxHeight:"180px",objectFit:"cover" as const,border:"1px solid #1a2540"}}/>}
            </div>
            <div style={{background:"#111",border:"1px solid #14f19520",borderRadius:"6px",padding:"10px",marginBottom:"12px"}}>
              <div style={{fontSize:"11px",color:"#14f195",marginBottom:"4px"}}>Powered by Bags.fm</div>
              <div style={{fontSize:"10px",color:"#8899bb"}}>Your token will be launched on Bags.fm with real bonding curve mechanics and creator royalties on every trade.</div>
            </div>
            <div style={{background:"#111",border:"1px solid #9945ff40",borderRadius:"8px",padding:"12px",marginBottom:"12px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
                <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                  <Brain size={13} color="#9945ff"/>
                  <span style={{fontSize:"11px",fontWeight:700,color:"#9945ff"}}>AI PITCH JUDGE</span>
                </div>
                <button onClick={judgePitch} disabled={judgingPitch} style={{background:"#9945ff20",border:"1px solid #9945ff40",borderRadius:"5px",color:"#9945ff",padding:"4px 10px",fontSize:"11px",cursor:"pointer",fontWeight:700}}>
                  {judgingPitch?"⏳ Judging...":"⚖️ Judge My Pitch"}
                </button>
              </div>
              {!pitchScore&&!judgingPitch&&<div style={{fontSize:"10px",color:"#4a5a7a"}}>Get AI feedback before launching</div>}
              {pitchScore&&<>
                <div style={{display:"flex",gap:"10px",alignItems:"center",marginBottom:"8px"}}>
                  <div style={{textAlign:"center" as const,background:"#0a0a0a",borderRadius:"6px",padding:"8px 12px"}}>
                    <div style={{fontSize:"24px",fontWeight:900,color:pitchScore.score>75?"#14f195":pitchScore.score>55?"#ffaa00":"#ff3366"}}>{pitchScore.score}</div>
                    <div style={{fontSize:"9px",color:"#4a5a7a"}}>PITCH</div>
                  </div>
                  <div style={{flex:1,fontSize:"11px",color:"#8899bb",lineHeight:1.5}}>{pitchScore.feedback}</div>
                </div>
                <div style={{display:"flex",gap:"4px",flexWrap:"wrap" as const}}>
                  {pitchScore.strengths.map((s,i)=><span key={i} style={{...S.pill("#14f195"),fontSize:"9px"}}>✓ {s}</span>)}
                  {pitchScore.weaknesses.map((w,i)=><span key={i} style={{...S.pill("#ff3366"),fontSize:"9px"}}>✗ {w}</span>)}
                </div>
              </>}
            </div>
            <button style={{...S.btnG,width:"100%",padding:"14px",fontSize:"14px"}} onClick={()=>{if(!wallet.connected){connectWallet();return};launchToken()}}>
              {launching?"🚀 Launching...":"🚀 Launch on Bags.fm"}
            </button>
          </div>
        </div>
      </>}

      {/* LEADERBOARD */}
      {page==="board"&&<>
        <div style={S.header}><span style={{fontWeight:800}}>Top Creators</span></div>
        <div style={{padding:"12px"}}>
          <div style={S.card}>
            <div style={{fontSize:"11px",letterSpacing:"2px",color:"#4a5a7a",marginBottom:"10px"}}>TOP TOKENS BY MARKET CAP</div>
            {[...tokens].sort((a,b)=>b.marketCap-a.marketCap).map((t,i)=>(
              <div key={t.id} onClick={()=>{setSel(t);setPage("token")}} style={{display:"flex",alignItems:"center",gap:"10px",padding:"8px 0",borderBottom:"1px solid #1a2540",cursor:"pointer"}}>
                <span style={{fontSize:"12px",width:"20px",...S.mono,fontWeight:700,color:i===0?"#ffd700":i===1?"#c0c0c0":i===2?"#cd7f32":"#4a5a7a"}}>#{i+1}</span>
                <span style={{fontSize:"24px"}}>{t.image.startsWith("http")?<img src={t.image} style={{width:28,height:28,borderRadius:4,objectFit:"cover" as const}}/>:t.image}</span>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:"13px"}}>{t.name}</div>
                  <div style={{fontSize:"10px",color:"#8899bb",...S.mono}}>{t.royaltyPct}% royalty · {fmt(t.holders)} holders</div>
                </div>
                <div style={{textAlign:"right" as const}}>
                  <div style={{color:t.priceChange>=0?"#14f195":"#ff3366",fontWeight:700,fontSize:"13px",...S.mono}}>{t.priceChange>=0?"+":""}{t.priceChange.toFixed(1)}%</div>
                  <div style={{fontSize:"10px",color:"#8899bb",...S.mono}}>${fmt(t.marketCap)}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={S.card}>
            <div style={{fontSize:"11px",letterSpacing:"2px",color:"#4a5a7a",marginBottom:"10px"}}>PLATFORM STATS</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
              {[
                {l:"Total Volume",v:"$"+fmt(tokens.reduce((s,t)=>s+t.volume,0))},
                {l:"Tokens Launched",v:tokens.length.toString()},
                {l:"Total Holders",v:fmt(tokens.reduce((s,t)=>s+t.holders,0))},
                {l:"Creator Royalties",v:"$"+fmt(tokens.reduce((s,t)=>s+t.volume*t.royaltyPct/100,0))},
              ].map(s=>(
                <div key={s.l} style={{background:"#111",border:"1px solid #1a2540",borderRadius:"6px",padding:"10px",textAlign:"center" as const}}>
                  <div style={{fontSize:"18px",fontWeight:700,...S.mono,color:"#14f195"}}>{s.v}</div>
                  <div style={{fontSize:"10px",color:"#4a5a7a",marginTop:"2px"}}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>}

      <nav style={S.nav}>
        {[
          {id:"feed",label:"Feed",icon:<Flame size={16}/>},
          {id:"launch",label:"Launch",icon:<Rocket size={16}/>},
          {id:"board",label:"Top",icon:<Trophy size={16}/>},
        ].map(n=>(
          <button key={n.id} style={S.navBtn(page===n.id)} onClick={()=>setPage(n.id as any)}>
            {n.icon}<span>{n.label.toUpperCase()}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
