import { useState, useSyncExternalStore, type FormEvent } from 'react'
import { todoStore } from './todoStore'

// ふつうのTODO画面。AI・WebMCPに関するコードは一切含まない。
export type Highlight = { id: string; seq: number } | null

export function TodoApp({ highlight }: { highlight: Highlight }) {
  const todos = useSyncExternalStore(todoStore.subscribe, todoStore.getSnapshot)
  const [text, setText] = useState('')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    todoStore.add(trimmed)
    setText('')
  }

  const remaining = todos.filter((t) => !t.done).length

  return (
    <section className="panel">
      <h2>TODO</h2>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="やることを入力"
          aria-label="やること"
          autoComplete="off"
        />
        <button type="submit">追加</button>
      </form>
      <ul className="todo-list">
        {todos.map((todo) => {
          const flash = todo.id === highlight?.id
          return (
            <li
              // ハイライト対象は key を変えて再マウントし、アニメーションを毎回再生する
              key={flash ? `${todo.id}-${highlight.seq}` : todo.id}
              className={[todo.done && 'done', flash && 'flash'].filter(Boolean).join(' ')}
            >
              <input
                type="checkbox"
                checked={todo.done}
                onChange={(e) => todoStore.setDone(todo.id, e.target.checked)}
                aria-label={`${todo.text} を完了にする`}
              />
              <span className="text">{todo.text}</span>
              <code className="id">{todo.id}</code>
              <button className="delete" onClick={() => todoStore.remove(todo.id)}>
                削除
              </button>
            </li>
          )
        })}
      </ul>
      <p className="muted">
        {todos.length}件中 {remaining}件が未完了
      </p>
    </section>
  )
}
