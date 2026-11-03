// エージェントに公開するツールの名前・説明・入力スキーマ。
// エージェントはこの説明文を読んで、どのツールをどう呼ぶかを判断する。

import type { ModelContextTool } from './webmcp/types'

export const toolDefinitions = {
  list_todos: {
    description: 'TODOの一覧を返す。各TODOは id, text, done（完了済みか）を持つ。',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
  },
  add_todo: {
    description: 'TODOを1件追加し、追加したTODOを返す。',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string', description: 'TODOの内容' } },
      required: ['text'],
    },
  },
  complete_todo: {
    description: '指定した id のTODOを完了にする。id は list_todos で確認できる。',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'TODOの id' } },
      required: ['id'],
    },
  },
  delete_todo: {
    description:
      '指定した id のTODOを削除する。取り消せない操作なので、実行前に画面でユーザーの確認を求める。',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'TODOの id' } },
      required: ['id'],
    },
    annotations: { destructiveHint: true },
  },
} satisfies Record<string, Omit<ModelContextTool, 'name' | 'execute'>>
