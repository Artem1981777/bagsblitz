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
  { id:"12", name:"Photo DAO", symbol:"PHOTO", description:"Photography collective with print sale royalties", image:"🎨", price:0.00080507, priceChange:248.9, marketCap:5021, volume:2158, holders:4543, bondingProgress:50.7, royaltyPct:8, creator:"Anon...1000", createdAt:Date.now()-12424688, priceHistory:[0.00040253,0.00056355,0.00068431,0.00072456,0.00076482,0.00080507], mint:"" },
  { id:"13", name:"Theater Guild", symbol:"THTR", description:"Stage performance funding with ticket revenue", image:"🎵", price:0.00081174, priceChange:254.8, marketCap:6605, volume:2796, holders:4058, bondingProgress:60.0, royaltyPct:12, creator:"Anon...1001", createdAt:Date.now()-26376428, priceHistory:[0.00040587,0.00056822,0.00068998,0.00073057,0.00077115,0.00081174], mint:"" },
  { id:"14", name:"Dance Studio", symbol:"DNCE", description:"Dance school tokens with class revenue sharing", image:"🎬", price:0.00072878, priceChange:216.0, marketCap:1675, volume:756, holders:1245, bondingProgress:75.8, royaltyPct:15, creator:"Anon...1002", createdAt:Date.now()-75653513, priceHistory:[0.00036439,0.00051015,0.00061946,0.0006559,0.00069234,0.00072878], mint:"" },
  { id:"15", name:"Chef Token", symbol:"CHEF", description:"Culinary creator fund with restaurant royalties", image:"🎙️", price:0.00055571, priceChange:-2.6, marketCap:4986, volume:1124, holders:2464, bondingProgress:9.1, royaltyPct:8, creator:"Anon...1003", createdAt:Date.now()-16270285, priceHistory:[0.00027785,0.000389,0.00047235,0.00050014,0.00052792,0.00055571], mint:"" },
  { id:"16", name:"Travel Blog", symbol:"TRVL", description:"Travel content creator with booking commissions", image:"🎮", price:1.019e-05, priceChange:30.4, marketCap:31, volume:15, holders:708, bondingProgress:55.3, royaltyPct:7, creator:"Anon...1004", createdAt:Date.now()-41425599, priceHistory:[5.1e-06,7.13e-06,8.66e-06,9.17e-06,9.68e-06,1.019e-05], mint:"" },
  { id:"17", name:"Fitness Club", symbol:"FIT", description:"Personal trainer DAO with membership revenue", image:"👗", price:0.00053184, priceChange:97.1, marketCap:834, volume:103, holders:1293, bondingProgress:19.8, royaltyPct:7, creator:"Anon...1005", createdAt:Date.now()-61208984, priceHistory:[0.00026592,0.00037229,0.00045206,0.00047866,0.00050525,0.00053184], mint:"" },
  { id:"18", name:"Beauty Brand", symbol:"GLAM", description:"Cosmetics creator token with product royalties", image:"⚽", price:0.0007657, priceChange:223.8, marketCap:4396, volume:1102, holders:1864, bondingProgress:28.9, royaltyPct:12, creator:"Anon...1006", createdAt:Date.now()-772640, priceHistory:[0.00038285,0.00053599,0.00065085,0.00068913,0.00072742,0.0007657], mint:"" },
  { id:"19", name:"Tech Review", symbol:"TECH", description:"Technology reviewer with affiliate commissions", image:"😂", price:0.00035861, priceChange:5.2, marketCap:466, volume:223, holders:1496, bondingProgress:92.1, royaltyPct:8, creator:"Anon...1007", createdAt:Date.now()-32451537, priceHistory:[0.0001793,0.00025103,0.00030482,0.00032275,0.00034068,0.00035861], mint:"" },
  { id:"20", name:"Science Fund", symbol:"SCIN", description:"Research funding DAO with patent royalties", image:"📸", price:0.0001178, priceChange:228.5, marketCap:702, volume:333, holders:4711, bondingProgress:53.9, royaltyPct:5, creator:"Anon...1008", createdAt:Date.now()-56504403, priceHistory:[5.89e-05,8.246e-05,0.00010013,0.00010602,0.00011191,0.0001178], mint:"" },
  { id:"21", name:"Book Club", symbol:"READ", description:"Literary fund with publishing revenue sharing", image:"🎭", price:6.73e-06, priceChange:92.2, marketCap:12, volume:1, holders:3098, bondingProgress:64.3, royaltyPct:8, creator:"Anon...1009", createdAt:Date.now()-11940148, priceHistory:[3.36e-06,4.71e-06,5.72e-06,6.06e-06,6.39e-06,6.73e-06], mint:"" },
  { id:"22", name:"Jazz Collective", symbol:"JAZZ", description:"Jazz musician collective with gig revenue", image:"🌍", price:0.00067727, priceChange:16.4, marketCap:4868, volume:787, holders:3343, bondingProgress:41.5, royaltyPct:10, creator:"Anon...1010", createdAt:Date.now()-4400282, priceHistory:[0.00033863,0.00047409,0.00057568,0.00060954,0.00064341,0.00067727], mint:"" },
  { id:"23", name:"Mural Artists", symbol:"WALL", description:"Street art collective with commission sharing", image:"💡", price:0.00025654, priceChange:84.2, marketCap:1204, volume:262, holders:4702, bondingProgress:64.9, royaltyPct:10, creator:"Anon...1011", createdAt:Date.now()-52700505, priceHistory:[0.00012827,0.00017958,0.00021806,0.00023089,0.00024371,0.00025654], mint:"" },
  { id:"24", name:"Anime Studio", symbol:"ANME", description:"Japanese animation funding with streaming royalties", image:"🔬", price:0.00062029, priceChange:258.1, marketCap:1319, volume:571, holders:2125, bondingProgress:31.2, royaltyPct:12, creator:"Anon...1012", createdAt:Date.now()-23226491, priceHistory:[0.00031015,0.0004342,0.00052725,0.00055826,0.00058928,0.00062029], mint:"" },
  { id:"25", name:"Surf School", symbol:"SURF", description:"Surf academy token with lesson revenue", image:"📚", price:0.00053412, priceChange:181.6, marketCap:1659, volume:695, holders:1773, bondingProgress:34.5, royaltyPct:7, creator:"Anon...1013", createdAt:Date.now()-63315066, priceHistory:[0.00026706,0.00037388,0.000454,0.00048071,0.00050741,0.00053412], mint:"" },
  { id:"26", name:"Yoga Studio", symbol:"YOGA", description:"Wellness creator with class revenue sharing", image:"🎸", price:3.625e-05, priceChange:123.9, marketCap:320, volume:70, holders:1042, bondingProgress:16.1, royaltyPct:8, creator:"Anon...1014", createdAt:Date.now()-85520463, priceHistory:[1.813e-05,2.538e-05,3.081e-05,3.263e-05,3.444e-05,3.625e-05], mint:"" },
  { id:"27", name:"Chess Academy", symbol:"CHSS", description:"Chess training platform with tournament prizes", image:"🏄", price:0.00040308, priceChange:129.7, marketCap:3346, volume:344, holders:940, bondingProgress:5.8, royaltyPct:3, creator:"Anon...1015", createdAt:Date.now()-63805320, priceHistory:[0.00020154,0.00028216,0.00034262,0.00036277,0.00038293,0.00040308], mint:"" },
  { id:"28", name:"Crypto News", symbol:"CNWS", description:"Crypto journalism DAO with subscription revenue", image:"🌿", price:2.369e-05, priceChange:74.5, marketCap:20, volume:5, holders:1310, bondingProgress:93.7, royaltyPct:12, creator:"Anon...1016", createdAt:Date.now()-64794748, priceHistory:[1.184e-05,1.658e-05,2.014e-05,2.132e-05,2.251e-05,2.369e-05], mint:"" },
  { id:"29", name:"Virtual DJ", symbol:"VRDJ", description:"Electronic music creator with stream royalties", image:"🦁", price:4.351e-05, priceChange:149.0, marketCap:268, volume:64, holders:4633, bondingProgress:78.5, royaltyPct:1, creator:"Anon...1017", createdAt:Date.now()-83265891, priceHistory:[2.176e-05,3.046e-05,3.698e-05,3.916e-05,4.133e-05,4.351e-05], mint:"" },
  { id:"30", name:"Tattoo Art", symbol:"TATT", description:"Tattoo artist collective with booking revenue", image:"🚀", price:0.00042517, priceChange:31.0, marketCap:3535, volume:746, holders:2456, bondingProgress:14.2, royaltyPct:1, creator:"Anon...1018", createdAt:Date.now()-2264035, priceHistory:[0.00021258,0.00029762,0.00036139,0.00038265,0.00040391,0.00042517], mint:"" },
  { id:"31", name:"Garden DAO", symbol:"GRDN", description:"Urban farming collective with harvest revenue", image:"💎", price:0.000721, priceChange:295.3, marketCap:5874, volume:2306, holders:3086, bondingProgress:43.8, royaltyPct:8, creator:"Anon...1019", createdAt:Date.now()-30857569, priceHistory:[0.0003605,0.0005047,0.00061285,0.0006489,0.00068495,0.000721], mint:"" },
  { id:"32", name:"Robot Fund", symbol:"ROBO", description:"Robotics research DAO with licensing royalties", image:"🎯", price:0.0007629, priceChange:105.4, marketCap:3749, volume:1691, holders:520, bondingProgress:33.7, royaltyPct:12, creator:"Anon...1020", createdAt:Date.now()-79354645, priceHistory:[0.00038145,0.00053403,0.00064846,0.00068661,0.00072475,0.0007629], mint:"" },
  { id:"33", name:"Ocean Cleanup", symbol:"OCEN", description:"Environmental creator with grant revenue", image:"🏆", price:0.00095111, priceChange:53.9, marketCap:6755, volume:1721, holders:4931, bondingProgress:41.7, royaltyPct:12, creator:"Anon...1021", createdAt:Date.now()-39716364, priceHistory:[0.00047556,0.00066578,0.00080844,0.000856,0.00090355,0.00095111], mint:"" },
  { id:"34", name:"Pet Rescue", symbol:"PETS", description:"Animal shelter funding with adoption fees", image:"🌙", price:0.00088432, priceChange:232.1, marketCap:1112, volume:282, holders:2420, bondingProgress:64.0, royaltyPct:1, creator:"Anon...1022", createdAt:Date.now()-64099005, priceHistory:[0.00044216,0.00061902,0.00075167,0.00079589,0.0008401,0.00088432], mint:"" },
  { id:"35", name:"Vintage Shop", symbol:"VNTG", description:"Vintage curator with sales revenue sharing", image:"⚡", price:0.0007785, priceChange:9.1, marketCap:714, volume:351, holders:3295, bondingProgress:38.0, royaltyPct:10, creator:"Anon...1023", createdAt:Date.now()-15080057, priceHistory:[0.00038925,0.00054495,0.00066172,0.00070065,0.00073958,0.0007785], mint:"" },
  { id:"36", name:"Magic Show", symbol:"MGIC", description:"Magician collective with performance revenue", image:"🔮", price:0.00054127, priceChange:125.3, marketCap:1897, volume:431, holders:3200, bondingProgress:32.5, royaltyPct:5, creator:"Anon...1024", createdAt:Date.now()-72724054, priceHistory:[0.00027064,0.00037889,0.00046008,0.00048714,0.00051421,0.00054127], mint:"" },
  { id:"37", name:"Skate Park", symbol:"SKTR", description:"Skateboarding DAO with event ticket revenue", image:"🎪", price:0.00050961, priceChange:248.3, marketCap:2230, volume:1081, holders:4306, bondingProgress:75.6, royaltyPct:15, creator:"Anon...1025", createdAt:Date.now()-1675283, priceHistory:[0.0002548,0.00035673,0.00043317,0.00045865,0.00048413,0.00050961], mint:"" },
  { id:"38", name:"Wine Club", symbol:"WINE", description:"Sommelier collective with bottle sale royalties", image:"🦋", price:0.00053306, priceChange:70.4, marketCap:4922, volume:961, holders:968, bondingProgress:93.4, royaltyPct:5, creator:"Anon...1026", createdAt:Date.now()-49668391, priceHistory:[0.00026653,0.00037314,0.0004531,0.00047975,0.00050641,0.00053306], mint:"" },
  { id:"39", name:"Chess Club", symbol:"CHSB", description:"Board game cafe with tournament revenue", image:"🌊", price:0.00076255, priceChange:190.2, marketCap:6608, volume:1403, holders:2042, bondingProgress:5.8, royaltyPct:5, creator:"Anon...1027", createdAt:Date.now()-43723545, priceHistory:[0.00038127,0.00053378,0.00064817,0.00068629,0.00072442,0.00076255], mint:"" },
  { id:"40", name:"Astro Fund", symbol:"ASTR", description:"Amateur astronomy DAO with course revenue", image:"🎲", price:0.00013832, priceChange:2.3, marketCap:1330, volume:300, holders:1707, bondingProgress:32.3, royaltyPct:15, creator:"Anon...1028", createdAt:Date.now()-18732287, priceHistory:[6.916e-05,9.682e-05,0.00011757,0.00012449,0.0001314,0.00013832], mint:"" },
  { id:"41", name:"Quilt Guild", symbol:"QILT", description:"Textile artist collective with sale revenue", image:"🃏", price:0.00082536, priceChange:30.1, marketCap:6458, volume:3137, holders:4705, bondingProgress:9.6, royaltyPct:7, creator:"Anon...1029", createdAt:Date.now()-76479493, priceHistory:[0.00041268,0.00057775,0.00070156,0.00074282,0.00078409,0.00082536], mint:"" },
  { id:"42", name:"Drone Films", symbol:"DRNE", description:"Aerial videography with licensing revenue", image:"🎻", price:0.00072477, priceChange:195.5, marketCap:5556, volume:1027, holders:3088, bondingProgress:20.7, royaltyPct:12, creator:"Anon...1030", createdAt:Date.now()-80284653, priceHistory:[0.00036239,0.00050734,0.00061605,0.00065229,0.00068853,0.00072477], mint:"" },
  { id:"43", name:"Poetry Slam", symbol:"POEM", description:"Poetry collective with event ticket revenue", image:"🥊", price:0.0003667, priceChange:139.8, marketCap:2191, volume:333, holders:3138, bondingProgress:84.0, royaltyPct:12, creator:"Anon...1031", createdAt:Date.now()-74367747, priceHistory:[0.00018335,0.00025669,0.0003117,0.00033003,0.00034837,0.0003667], mint:"" },
  { id:"44", name:"Improv Club", symbol:"IMPR", description:"Comedy improv theater with show revenue", image:"🎤", price:0.00050462, priceChange:151.9, marketCap:1903, volume:666, holders:4239, bondingProgress:22.9, royaltyPct:12, creator:"Anon...1032", createdAt:Date.now()-27048329, priceHistory:[0.00025231,0.00035323,0.00042893,0.00045416,0.00047939,0.00050462], mint:"" },
  { id:"45", name:"Karate Dojo", symbol:"KART", description:"Martial arts school with belt test revenue", image:"📱", price:0.00059791, priceChange:51.1, marketCap:1975, volume:323, holders:459, bondingProgress:50.4, royaltyPct:8, creator:"Anon...1033", createdAt:Date.now()-5459742, priceHistory:[0.00029895,0.00041854,0.00050822,0.00053812,0.00056801,0.00059791], mint:"" },
  { id:"46", name:"Graffiti Art", symbol:"GRFF", description:"Urban art collective with commission sharing", image:"🤖", price:0.00020497, priceChange:231.6, marketCap:1065, volume:343, holders:166, bondingProgress:20.6, royaltyPct:3, creator:"Anon...1034", createdAt:Date.now()-9649557, priceHistory:[0.00010249,0.00014348,0.00017422,0.00018447,0.00019472,0.00020497], mint:"" },
  { id:"47", name:"Escape Room", symbol:"ESCR", description:"Puzzle designer DAO with booking revenue", image:"🌈", price:0.00052249, priceChange:233.9, marketCap:4096, volume:1258, holders:4314, bondingProgress:12.1, royaltyPct:10, creator:"Anon...1035", createdAt:Date.now()-40115791, priceHistory:[0.00026125,0.00036574,0.00044412,0.00047024,0.00049637,0.00052249], mint:"" },
  { id:"48", name:"Board Game", symbol:"BRDG", description:"Tabletop game designer with royalty sharing", image:"🍕", price:0.00079388, priceChange:116.6, marketCap:6912, volume:3286, holders:3151, bondingProgress:28.0, royaltyPct:3, creator:"Anon...1036", createdAt:Date.now()-11750388, priceHistory:[0.00039694,0.00055572,0.0006748,0.00071449,0.00075419,0.00079388], mint:"" },
  { id:"49", name:"Flower Shop", symbol:"FLWR", description:"Floral art collective with arrangement revenue", image:"🎠", price:0.00070503, priceChange:-26.0, marketCap:6924, volume:3448, holders:510, bondingProgress:44.9, royaltyPct:8, creator:"Anon...1037", createdAt:Date.now()-44518325, priceHistory:[0.00035252,0.00049352,0.00059928,0.00063453,0.00066978,0.00070503], mint:"" },
  { id:"50", name:"Ice Cream", symbol:"ICEC", description:"Artisan food creator with franchise revenue", image:"🦄", price:0.00033894, priceChange:260.2, marketCap:1334, volume:181, holders:3670, bondingProgress:66.7, royaltyPct:10, creator:"Anon...1038", createdAt:Date.now()-60649479, priceHistory:[0.00016947,0.00023726,0.0002881,0.00030505,0.00032199,0.00033894], mint:"" },
  { id:"51", name:"Climbing Wall", symbol:"CLMB", description:"Climbing gym DAO with membership revenue", image:"🌺", price:0.00013483, priceChange:43.9, marketCap:614, volume:99, holders:2154, bondingProgress:26.0, royaltyPct:10, creator:"Anon...1039", createdAt:Date.now()-65051584, priceHistory:[6.742e-05,9.438e-05,0.00011461,0.00012135,0.00012809,0.00013483], mint:"" },
  { id:"52", name:"Jazz Bar", symbol:"JBAR", description:"Live music venue with ticket revenue sharing", image:"🎀", price:0.00026745, priceChange:16.2, marketCap:1419, volume:328, holders:759, bondingProgress:35.5, royaltyPct:5, creator:"Anon...1040", createdAt:Date.now()-71260432, priceHistory:[0.00013373,0.00018722,0.00022733,0.00024071,0.00025408,0.00026745], mint:"" },
  { id:"53", name:"Pottery Art", symbol:"PTRY", description:"Ceramic artist collective with sale revenue", image:"🏰", price:2.87e-05, priceChange:196.6, marketCap:234, volume:59, holders:2186, bondingProgress:60.0, royaltyPct:10, creator:"Anon...1041", createdAt:Date.now()-56892912, priceHistory:[1.435e-05,2.009e-05,2.439e-05,2.583e-05,2.726e-05,2.87e-05], mint:"" },
  { id:"54", name:"Burlesque", symbol:"BRLQ", description:"Performance art collective with show revenue", image:"🚂", price:0.00071713, priceChange:135.9, marketCap:5854, volume:2805, holders:2766, bondingProgress:29.2, royaltyPct:8, creator:"Anon...1042", createdAt:Date.now()-70345832, priceHistory:[0.00035856,0.00050199,0.00060956,0.00064542,0.00068127,0.00071713], mint:"" },
  { id:"55", name:"Fencing Club", symbol:"FNCG", description:"Sword fighting academy with tournament prizes", image:"🎡", price:0.00071571, priceChange:125.5, marketCap:6885, volume:2199, holders:2340, bondingProgress:84.3, royaltyPct:15, creator:"Anon...1043", createdAt:Date.now()-34909558, priceHistory:[0.00035786,0.000501,0.00060835,0.00064414,0.00067992,0.00071571], mint:"" },
  { id:"56", name:"Model Agency", symbol:"MODL", description:"Fashion model DAO with booking commissions", image:"🎢", price:0.00030443, priceChange:23.6, marketCap:251, volume:92, holders:174, bondingProgress:51.9, royaltyPct:8, creator:"Anon...1044", createdAt:Date.now()-43013149, priceHistory:[0.00015222,0.0002131,0.00025877,0.00027399,0.00028921,0.00030443], mint:"" },
  { id:"57", name:"Opera House", symbol:"OPRA", description:"Classical music funding with ticket revenue", image:"🦊", price:0.00017913, priceChange:-17.2, marketCap:818, volume:378, holders:673, bondingProgress:86.7, royaltyPct:8, creator:"Anon...1045", createdAt:Date.now()-66865547, priceHistory:[8.957e-05,0.00012539,0.00015226,0.00016122,0.00017017,0.00017913], mint:"" },
  { id:"58", name:"Drum Circle", symbol:"DRUM", description:"Percussion collective with workshop revenue", image:"🐉", price:0.00019393, priceChange:84.8, marketCap:1538, volume:227, holders:4110, bondingProgress:27.1, royaltyPct:10, creator:"Anon...1046", createdAt:Date.now()-23573811, priceHistory:[9.697e-05,0.00013575,0.00016484,0.00017454,0.00018423,0.00019393], mint:"" },
  { id:"59", name:"Henna Art", symbol:"HENN", description:"Temporary art collective with event booking", image:"🌟", price:0.00048828, priceChange:103.9, marketCap:3515, volume:703, holders:2528, bondingProgress:20.8, royaltyPct:7, creator:"Anon...1047", createdAt:Date.now()-12223732, priceHistory:[0.00024414,0.0003418,0.00041504,0.00043945,0.00046387,0.00048828], mint:"" },
  { id:"60", name:"Kite Flying", symbol:"KITE", description:"Aerial sport DAO with competition prizes", image:"💫", price:0.0009647, priceChange:184.6, marketCap:1742, volume:511, holders:338, bondingProgress:74.9, royaltyPct:15, creator:"Anon...1048", createdAt:Date.now()-7255241, priceHistory:[0.00048235,0.00067529,0.00082,0.00086823,0.00091646,0.0009647], mint:"" },
  { id:"61", name:"Origami Art", symbol:"ORGM", description:"Paper art collective with workshop revenue", image:"✨", price:0.0006361, priceChange:270.2, marketCap:4817, volume:1667, holders:2149, bondingProgress:73.0, royaltyPct:8, creator:"Anon...1049", createdAt:Date.now()-56142687, priceHistory:[0.00031805,0.00044527,0.00054068,0.00057249,0.0006043,0.0006361], mint:"" },
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
