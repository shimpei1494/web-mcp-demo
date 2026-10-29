// WebMCP 対応はこのファイルだけ。
// やっていることは「既存の todoStore の関数に、名前・説明・入力スキーマを付けてブラウザに登録する」だけで、
// LLMの呼び出しもAPIキーもバックエンドもない。ツールを呼ぶのはユーザー側のAIエージェント。

import { todoStore, highlight } from './todo.js';

// 2026年7月のドラフトで navigator から document に移った。Chrome の Origin Trial は両方を提供している。
const modelContext = document.modelContext ?? navigator.modelContext;

const statusEl = document.getElementById('webmcp-status');
const toolsEl = document.getElementById('tool-list');
const logEl = document.getElementById('call-log');

const json = (value) => JSON.stringify(value, null, 2);

const tools = [
  {
    name: 'list_todos',
    description: 'TODOの一覧を返す。各TODOは id, text, done（完了済みか）を持つ。',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    execute: async () => json(todoStore.list()),
  },
  {
    name: 'add_todo',
    description: 'TODOを1件追加し、追加したTODOを返す。',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'TODOの内容' },
      },
      required: ['text'],
    },
    execute: async ({ text }) => {
      const todo = todoStore.add(text);
      highlight(todo.id);
      return json(todo);
    },
  },
  {
    name: 'complete_todo',
    description: '指定した id のTODOを完了にする。id は list_todos で確認できる。',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'TODOの id' },
      },
      required: ['id'],
    },
    execute: async ({ id }) => {
      const todo = todoStore.setDone(id, true);
      highlight(id);
      return json(todo);
    },
  },
  {
    name: 'delete_todo',
    description: '指定した id のTODOを削除する。取り消せない操作なので、実行前に画面でユーザーの確認を求める。',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'TODOの id' },
      },
      required: ['id'],
    },
    annotations: { destructiveHint: true },
    execute: async ({ id }) => {
      const todo = todoStore.find(id);
      // 取り消せない操作は人間の確認を挟む（human in the loop）
      if (!confirm(`AIエージェントが「${todo.text}」を削除しようとしています。許可しますか？`)) {
        return 'ユーザーが削除を拒否しました。';
      }
      return json(todoStore.remove(id));
    },
  },
];

// 呼び出しを画面のログに出すためのラッパー。WebMCP の動作には不要で、デモ用の見える化。
function withLog(tool) {
  return {
    ...tool,
    execute: async (input = {}, ...rest) => {
      const entry = document.createElement('li');
      entry.innerHTML = '<strong></strong><pre class="in"></pre><pre class="out"></pre>';
      entry.querySelector('strong').textContent = `${new Date().toLocaleTimeString()}  ${tool.name}`;
      entry.querySelector('.in').textContent = json(input);
      logEl.prepend(entry);
      try {
        const result = await tool.execute(input, ...rest);
        entry.querySelector('.out').textContent = `→ ${result}`;
        return result;
      } catch (err) {
        entry.className = 'error';
        entry.querySelector('.out').textContent = `→ エラー: ${err.message}`;
        throw err;
      }
    },
  };
}

function showTools() {
  toolsEl.replaceChildren(
    ...tools.map((t) => {
      const li = document.createElement('li');
      li.innerHTML = '<code></code><span></span>';
      li.querySelector('code').textContent = t.name;
      li.querySelector('span').textContent = t.description;
      return li;
    })
  );
}

showTools();

if (modelContext) {
  for (const tool of tools) {
    await modelContext.registerTool(withLog(tool));
  }
  statusEl.className = 'status ok';
  statusEl.textContent = `WebMCP 有効：${tools.length}個のツールをブラウザに登録しました。`;
} else {
  statusEl.className = 'status ng';
  statusEl.textContent =
    'このブラウザは WebMCP に対応していません。Chrome 149 以降で chrome://flags/#enable-webmcp-testing を有効にしてください。アプリ自体は普通に使えます。';
}
