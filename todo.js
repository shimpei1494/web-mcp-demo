// ふつうのTODOアプリ。AI・WebMCPに関するコードは一切含まない。
// 画面のボタンも、webmcp.js から呼ばれるツールも、同じ todoStore を通る。

const STORAGE_KEY = 'webmcp-demo-todos';

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function save(todos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // 保存できなくても画面上は動かす
  }
}

export const todoStore = {
  todos: load(),
  listeners: new Set(),

  subscribe(fn) {
    this.listeners.add(fn);
  },

  emit() {
    save(this.todos);
    this.listeners.forEach((fn) => fn(this.todos));
  },

  list() {
    return this.todos.map((t) => ({ ...t }));
  },

  add(text) {
    const todo = { id: crypto.randomUUID().slice(0, 8), text, done: false };
    this.todos.push(todo);
    this.emit();
    return todo;
  },

  find(id) {
    const todo = this.todos.find((t) => t.id === id);
    if (!todo) throw new Error(`id "${id}" のTODOは見つかりません`);
    return todo;
  },

  setDone(id, done) {
    const todo = this.find(id);
    todo.done = done;
    this.emit();
    return todo;
  },

  remove(id) {
    const todo = this.find(id);
    this.todos = this.todos.filter((t) => t.id !== id);
    this.emit();
    return todo;
  },
};

// ---- 画面描画 ----

const listEl = document.getElementById('todo-list');
const formEl = document.getElementById('todo-form');
const inputEl = document.getElementById('todo-input');
const countEl = document.getElementById('todo-count');

export function highlight(id) {
  const el = listEl.querySelector(`[data-id="${id}"]`);
  if (!el) return;
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');
}

function render(todos) {
  listEl.replaceChildren(
    ...todos.map((todo) => {
      const li = document.createElement('li');
      li.dataset.id = todo.id;
      li.className = todo.done ? 'done' : '';

      const check = document.createElement('input');
      check.type = 'checkbox';
      check.checked = todo.done;
      check.setAttribute('aria-label', `${todo.text} を完了にする`);
      check.addEventListener('change', () => todoStore.setDone(todo.id, check.checked));

      const text = document.createElement('span');
      text.className = 'text';
      text.textContent = todo.text;

      const id = document.createElement('code');
      id.className = 'id';
      id.textContent = todo.id;

      const del = document.createElement('button');
      del.className = 'delete';
      del.textContent = '削除';
      del.addEventListener('click', () => todoStore.remove(todo.id));

      li.append(check, text, id, del);
      return li;
    })
  );
  const remaining = todos.filter((t) => !t.done).length;
  countEl.textContent = `${todos.length}件中 ${remaining}件が未完了`;
}

formEl.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = inputEl.value.trim();
  if (!text) return;
  todoStore.add(text);
  inputEl.value = '';
});

todoStore.subscribe(render);
render(todoStore.todos);
