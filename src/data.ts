import type { Token } from "./types"

export const BAGS_API = "https://public-api-v2.bags.fm/api/v1"
export const BAGS_KEY = (import.meta as any).env.VITE_BAGS_KEY
export const BBLITZ_MINT = "GiiRMcD1Ci4o6vP3evycKTrpjYQfScL4xobmkNMcBAGS"

export const rand = (t: Token): Token => {
  const d = (Math.random() - 0.48) * 0.015
  const np = Math.max(t.price * (1 + d), 0.0000001)
  return {
    ...t,
    price: np,
    priceChange: t.priceChange + (Math.random() - 0.5) * 2,
    volume: t.volume + Math.random() * 1000,
    marketCap: t.marketCap * (1 + d),
    bondingProgress: Math.min(t.bondingProgress + Math.random() * 0.1, 100),
    priceHistory: [...t.priceHistory.slice(-19), np],
  }
}

export const fmt = (n: number) =>
  n >= 1e6 ? (n / 1e6).toFixed(2) + "M" : n >= 1000 ? (n / 1000).toFixed(1) + "K" : n.toFixed(0)

export const ago = (ts: number) => {
  const s = Math.floor((Date.now() - ts) / 1000)
  return s < 60 ? s + "s" : s < 3600 ? Math.floor(s / 60) + "m" : Math.floor(s / 3600) + "h"
}

export const MOCK_TOKENS: Token[] = [
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
  { id:"12", name:"Photo DAO", symbol:"PHOTO", description:"Photography collective with print sale royalties", image:"📸", price:0.00080507, priceChange:248.9, marketCap:5021, volume:2158, holders:4543, bondingProgress:50.7, royaltyPct:8, creator:"Anon...1000", createdAt:Date.now()-12424688, priceHistory:[0.00040253,0.00056355,0.00068431,0.00072456,0.00076482,0.00080507], mint:"" },
  { id:"13", name:"Theater Guild", symbol:"THTR", description:"Stage performance funding with ticket revenue", image:"🎭", price:0.00081174, priceChange:254.8, marketCap:6605, volume:2796, holders:4058, bondingProgress:60.0, royaltyPct:12, creator:"Anon...1001", createdAt:Date.now()-26376428, priceHistory:[0.00040587,0.00056822,0.00068998,0.00073057,0.00077115,0.00081174], mint:"" },
  { id:"14", name:"Dance Studio", symbol:"DNCE", description:"Dance school tokens with class revenue sharing", image:"💃", price:0.00072878, priceChange:216.0, marketCap:1675, volume:756, holders:1245, bondingProgress:75.8, royaltyPct:15, creator:"Anon...1002", createdAt:Date.now()-75653513, priceHistory:[0.00036439,0.00051015,0.00061946,0.0006559,0.00069234,0.00072878], mint:"" },
  { id:"15", name:"Chef Token", symbol:"CHEF", description:"Culinary creator fund with restaurant royalties", image:"👨‍🍳", price:0.00055571, priceChange:-2.6, marketCap:4986, volume:1124, holders:2464, bondingProgress:9.1, royaltyPct:8, creator:"Anon...1003", createdAt:Date.now()-16270285, priceHistory:[0.00027785,0.000389,0.00047235,0.00050014,0.00052792,0.00055571], mint:"" },
  { id:"16", name:"Travel Blog", symbol:"TRVL", description:"Travel content creator with booking commissions", image:"✈️", price:1.019e-05, priceChange:30.4, marketCap:31, volume:15, holders:708, bondingProgress:55.3, royaltyPct:7, creator:"Anon...1004", createdAt:Date.now()-41425599, priceHistory:[5.1e-06,7.13e-06,8.66e-06,9.17e-06,9.68e-06,1.019e-05], mint:"" },
  { id:"17", name:"Fitness Club", symbol:"FIT", description:"Personal trainer DAO with membership revenue", image:"💪", price:0.00053184, priceChange:97.1, marketCap:834, volume:103, holders:1293, bondingProgress:19.8, royaltyPct:7, creator:"Anon...1005", createdAt:Date.now()-61208984, priceHistory:[0.00026592,0.00037229,0.00045206,0.00047866,0.00050525,0.00053184], mint:"" },
  { id:"18", name:"Beauty Brand", symbol:"GLAM", description:"Cosmetics creator token with product royalties", image:"💄", price:0.0007657, priceChange:223.8, marketCap:4396, volume:1102, holders:1864, bondingProgress:28.9, royaltyPct:12, creator:"Anon...1006", createdAt:Date.now()-772640, priceHistory:[0.00038285,0.00053599,0.00065085,0.00068913,0.00072742,0.0007657], mint:"" },
  { id:"19", name:"Tech Review", symbol:"TECH", description:"Technology reviewer with affiliate commissions", image:"💻", price:0.00035861, priceChange:5.2, marketCap:466, volume:223, holders:1496, bondingProgress:92.1, royaltyPct:8, creator:"Anon...1007", createdAt:Date.now()-32451537, priceHistory:[0.0001793,0.00025103,0.00030482,0.00032275,0.00034068,0.00035861], mint:"" },
  { id:"20", name:"Science Fund", symbol:"SCIN", description:"Research funding DAO with patent royalties", image:"🔬", price:0.0001178, priceChange:228.5, marketCap:702, volume:333, holders:4711, bondingProgress:53.9, royaltyPct:5, creator:"Anon...1008", createdAt:Date.now()-56504403, priceHistory:[5.89e-05,8.246e-05,0.00010013,0.00010602,0.00011191,0.0001178], mint:"" },
  { id:"21", name:"Anime Studio", symbol:"ANME", description:"Japanese animation funding with streaming royalties", image:"🎌", price:0.00062029, priceChange:258.1, marketCap:1319, volume:571, holders:2125, bondingProgress:31.2, royaltyPct:12, creator:"Anon...1012", createdAt:Date.now()-23226491, priceHistory:[0.00031015,0.0004342,0.00052725,0.00055826,0.00058928,0.00062029], mint:"" },
  { id:"22", name:"Garden DAO", symbol:"GRDN", description:"Urban farming collective with harvest revenue", image:"🌿", price:0.000721, priceChange:295.3, marketCap:5874, volume:2306, holders:3086, bondingProgress:43.8, royaltyPct:8, creator:"Anon...1019", createdAt:Date.now()-30857569, priceHistory:[0.0003605,0.0005047,0.00061285,0.0006489,0.00068495,0.000721], mint:"" },
]
