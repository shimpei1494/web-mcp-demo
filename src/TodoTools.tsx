// WebMCP 対応はこのファイルと src/webmcp/ だけ。
// 既存の todoStore の関数に、名前・説明・入力スキーマを付けてブラウザに登録している。
// LLMの呼び出しもAPIキーもバックエンドもない。ツールを呼ぶのはユーザー側のAIエージェント。

import { todoStore } from './todos/todoStore'
import { toolDefinitions } from './toolDefinitions'
import { useWebMCPTool } from './webmcp/useWebMCPTool'

export type CallLogEntry = {
  seq: number
  time: string
  name: string
  input: unknown
  output: string
  error: boolean
}

type Props = {
  onCall: (entry: Omit<CallLogEntry, 'seq'>) => void
  onTouch: (id: string) => void
}

const json = (value: unknown) => JSON.stringify(value, null, 2)

export function TodoTools({ onCall, onTouch }: Props) {
  // 呼び出しを画面のログに出すためのラッパー。WebMCP の動作には不要で、デモ用の見える化。
  const logged =
    <Input,>(name: keyof typeof toolDefinitions, run: (input: Input) => string) =>
    async (input: Input) => {
      const time = new Date().toLocaleTimeString()
      try {
        const output = run(input)
        onCall({ time, name, input, output, error: false })
        return output
      } catch (err) {
        onCall({ time, name, input, output: `エラー: ${(err as Error).message}`, error: true })
        throw err
      }
    }

  useWebMCPTool({
    name: 'list_todos',
    ...toolDefinitions.list_todos,
    execute: logged('list_todos', () => json(todoStore.getSnapshot())),
  })

  useWebMCPTool({
    name: 'add_todo',
    ...toolDefinitions.add_todo,
    execute: logged('add_todo', ({ text }: { text: string }) => {
      const todo = todoStore.add(text)
      onTouch(todo.id)
      return json(todo)
    }),
  })

  useWebMCPTool({
    name: 'complete_todo',
    ...toolDefinitions.complete_todo,
    execute: logged('complete_todo', ({ id }: { id: string }) => {
      const todo = todoStore.setDone(id, true)
      onTouch(id)
      return json(todo)
    }),
  })

  useWebMCPTool({
    name: 'delete_todo',
    ...toolDefinitions.delete_todo,
    execute: logged('delete_todo', ({ id }: { id: string }) => {
      const todo = todoStore.find(id)
      // 取り消せない操作は人間の確認を挟む（human in the loop）
      if (!confirm(`AIエージェントが「${todo.text}」を削除しようとしています。許可しますか？`)) {
        return 'ユーザーが削除を拒否しました。'
      }
      return json(todoStore.remove(id))
    }),
  })

  return null
}
