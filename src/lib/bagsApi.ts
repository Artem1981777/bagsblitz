import { BAGS_API, BAGS_KEY } from "../data"

export type LiveTokenTicker = {
  symbol?: string
  ticker?: string
  price?: string | number
}

export async function fetchLiveTokens(): Promise<LiveTokenTicker[]> {
  const headers: HeadersInit = BAGS_KEY ? { "x-api-key": BAGS_KEY } : {}
  const res = await fetch(BAGS_API + "/tokens?limit=10&sort=volume", { headers })
  if (!res.ok) throw new Error(`Bags API error (${res.status})`)
  const data = await res.json()
  return (data?.data || data?.tokens || []) as LiveTokenTicker[]
}

