/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BAGS_KEY?: string
  readonly VITE_CLAUDE_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

