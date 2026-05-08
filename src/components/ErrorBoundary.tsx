import type { ReactNode } from "react"
import { Component } from "react"
import { C, glass, mono } from "../theme"

type Props = { children: ReactNode }
type State = { hasError: boolean; message?: string }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(err: unknown): State {
    const message = err instanceof Error ? err.message : "Unknown error"
    return { hasError: true, message }
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div style={{ minHeight: "100vh", background: C.bg, color: C.text, padding: 14 }}>
        <div style={{ ...glass, maxWidth: 720, margin: "18vh auto 0", padding: 16 }}>
          <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 6 }}>BagsBlitz crashed</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 10 }}>
            A render error occurred. Reload the page; if it persists, report this message.
          </div>
          <div style={{ ...mono, fontSize: 11, color: C.red, whiteSpace: "pre-wrap" }}>
            {this.state.message ?? "Unknown error"}
          </div>
          <button
            onClick={() => location.reload()}
            style={{
              marginTop: 12,
              background: "linear-gradient(135deg,#9945ff,#14f195)",
              border: "none",
              borderRadius: 10,
              color: "#000",
              padding: "10px 14px",
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </div>
    )
  }
}

