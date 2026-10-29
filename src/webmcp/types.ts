// WebMCP の型定義（W3C Web Machine Learning CG のドラフト時点）。
// まだ TypeScript の DOM 型に含まれていないため自前で宣言する。

export type JsonSchema = {
  type: 'object'
  properties: Record<string, { type: string; description?: string }>
  required?: string[]
}

export type ToolAnnotations = {
  readOnlyHint?: boolean
  destructiveHint?: boolean
  untrustedContentHint?: boolean
}

export type ModelContextTool<Input = Record<string, unknown>> = {
  name: string
  description: string
  inputSchema?: JsonSchema
  annotations?: ToolAnnotations
  execute: (input: Input, options?: { signal?: AbortSignal }) => Promise<string>
}

export type ModelContext = {
  registerTool: (
    tool: ModelContextTool<never>,
    options?: { signal?: AbortSignal },
  ) => Promise<void> | void
}

declare global {
  interface Document {
    modelContext?: ModelContext
  }
  interface Navigator {
    modelContext?: ModelContext
  }
}

// 2026年7月のドラフトで navigator から document に移った。Chrome の Origin Trial は両方を提供している。
export const modelContext: ModelContext | undefined =
  document.modelContext ?? navigator.modelContext
