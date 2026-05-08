import { useEffect, useState } from "react"

/**
 * Provides a time value that updates on an interval without calling Date.now()
 * during render (keeps components idempotent under React's purity rules).
 */
export function useNow(refreshMs: number = 1000) {
  const [now, setNow] = useState(0)

  useEffect(() => {
    let alive = true
    const tick = () => { if (alive) setNow(Date.now()) }
    tick()
    const id = setInterval(tick, refreshMs)
    return () => { alive = false; clearInterval(id) }
  }, [refreshMs])

  return now
}

