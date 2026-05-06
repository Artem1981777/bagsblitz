import { C } from "../theme"

export function MiniChart({ data, pos, width = 60, height = 24 }: { data: number[], pos: boolean, width?: number, height?: number }) {
  if (data.length < 2) return null
  const min = Math.min(...data), max = Math.max(...data), r = max - min || 1
  const w = width, h = height
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / r) * h}`).join(" ")
  const fillPts = `0,${h} ${pts} ${w},${h}`
  return (
    <svg width={w} height={h}>
      <defs>
        <linearGradient id={"g" + (pos ? "p" : "n")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={pos ? C.green : C.red} stopOpacity="0.25" />
          <stop offset="100%" stopColor={pos ? C.green : C.red} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill={`url(#g${pos ? "p" : "n"})`} />
      <polyline points={pts} fill="none" stroke={pos ? C.green : C.red} strokeWidth="1.5" />
    </svg>
  )
}
