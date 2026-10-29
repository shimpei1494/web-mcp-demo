import { useEffect, useRef } from 'react'
import { modelContext, type ModelContextTool } from './types'

// コンポーネントが表示されている間だけ、ツールをブラウザに登録するフック。
// やっていることはブラウザ標準の registerTool() を呼び、アンマウント時に AbortController で解除するだけ。
export function useWebMCPTool<Input>(tool: ModelContextTool<Input>) {
  // tool は毎レンダーで作り直されるので、最新のものを ref で参照する（再登録を避ける）
  const toolRef = useRef(tool)
  useEffect(() => {
    toolRef.current = tool
  })

  const { name } = tool

  // 名前が変わったときだけ登録し直す
  useEffect(() => {
    if (!modelContext) return
    const { description, inputSchema, annotations } = toolRef.current
    const controller = new AbortController()
    Promise.resolve(
      modelContext.registerTool(
        {
          name,
          description,
          inputSchema,
          annotations,
          execute: (input, options) => toolRef.current.execute(input as Input, options),
        },
        { signal: controller.signal },
      ),
    ).catch((err: unknown) => console.warn(`ツール ${name} の登録に失敗しました`, err))
    return () => controller.abort()
  }, [name])
}
