// ふつうのTODOストア。AI・WebMCPに関するコードは一切含まない。
// 画面のボタンも WebMCP のツールも、同じこの関数群を呼ぶ。

export type Todo = { id: string; text: string; done: boolean }

const STORAGE_KEY = 'webmcp-demo-todos'

function load(): Todo[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Todo[]
  } catch {
    return []
  }
}

let todos: Todo[] = load()
const listeners = new Set<() => void>()

function update(next: Todo[]) {
  todos = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  } catch {
    // 保存できなくても画面上は動かす
  }
  listeners.forEach((fn) => fn())
}

function find(id: string): Todo {
  const todo = todos.find((t) => t.id === id)
  if (!todo) throw new Error(`id "${id}" のTODOは見つかりません`)
  return todo
}

export const todoStore = {
  subscribe(fn: () => void) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },

  getSnapshot: () => todos,

  find,

  add(text: string): Todo {
    const todo = { id: crypto.randomUUID().slice(0, 8), text, done: false }
    update([...todos, todo])
    return todo
  },

  setDone(id: string, done: boolean): Todo {
    const todo = { ...find(id), done }
    update(todos.map((t) => (t.id === id ? todo : t)))
    return todo
  },

  remove(id: string): Todo {
    const todo = find(id)
    update(todos.filter((t) => t.id !== id))
    return todo
  },
}
