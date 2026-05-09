import { BAGS_API, BAGS_KEY } from "../data"

export type LiveTokenTicker = {
  symbol?: string
  ticker?: string
  price?: string | number
}

export async function fetchLiveTokens(): Promise<LiveTokenTicker[]> {
  // Bags API public listing endpoint not available
  return []
}
