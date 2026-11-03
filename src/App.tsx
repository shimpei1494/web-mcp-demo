import { useCallback, useState } from 'react'
import { toolDefinitions } from './toolDefinitions'
import { TodoTools, type CallLogEntry } from './TodoTools'
import { TodoApp, type Highlight } from './todos/TodoApp'
import { modelContext } from './webmcp/types'

export default function App() {
  const [log, setLog] = useState<CallLogEntry[]>([])
  const [highlight, setHighlight] = useState<Highlight>(null)

  const onCall = useCallback((entry: Omit<CallLogEntry, 'seq'>) => {
    setLog((prev) => [{ ...entry, seq: (prev[0]?.seq ?? 0) + 1 }, ...prev])
  }, [])

  const onTouch = useCallback((id: string) => {
    setHighlight((prev) => ({ id, seq: (prev?.seq ?? 0) + 1 }))
  }, [])

  const toolCount = Object.keys(toolDefinitions).length

  return (
    <>
      <header>
        <h1>WebMCP TODO デモ</h1>
        <p className="lead">
          このアプリにはAIのコードが一切ありません。<code>src/TodoTools.tsx</code>{' '}
          で既存の関数をツールとして登録しているだけで、ブラウザのAIエージェントから操作できます。
        </p>
        {modelContext ? (
          <p className="status ok">WebMCP 有効：{toolCount}個のツールをブラウザに登録しました。</p>
        ) : (
          <p className="status ng">
            このブラウザは WebMCP に対応していません。Chrome 149 以降で
            chrome://flags/#enable-webmcp-testing を有効にしてください。アプリ自体は普通に使えます。
          </p>
        )}
      </header>

      <main>
        <TodoApp highlight={highlight} />

        <section className="panel">
          <h2>公開しているツール</h2>
          <ul className="tools">
            {Object.entries(toolDefinitions).map(([name, def]) => (
              <li key={name}>
                <code>{name}</code>
                <span>{def.description}</span>
              </li>
            ))}
          </ul>

          <h2>エージェントからの呼び出しログ</h2>
          <p className="muted">
            エージェント（または Model Context Tool
            Inspector）がツールを呼ぶと、ここに入力と結果が出ます。画面のボタン操作は記録されません。
          </p>
          <ol className="log">
            {log.map((entry) => (
              <li key={entry.seq} className={entry.error ? 'error' : undefined}>
                <strong>
                  {entry.time} {entry.name}
                </strong>
                <pre className="in">{JSON.stringify(entry.input, null, 2)}</pre>
                <pre className="out">→ {entry.output}</pre>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <TodoTools onCall={onCall} onTouch={onTouch} />
    </>
  )
}
