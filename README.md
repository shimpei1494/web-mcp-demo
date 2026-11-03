# web-mcp-demo

WebMCP を理解するためのデモアプリです。ふつうのTODOアプリ（React）に、数ファイルだけで WebMCP 対応を足しています。

## 伝えたいこと

「フロントの情報をバックエンドのLLMに送って、結果で画面を操作する」方式との違いは、**AIを誰が持っているか**です。

|                        | アプリにAIを内蔵する方式                   | WebMCP                                                         |
| ---------------------- | ------------------------------------------ | -------------------------------------------------------------- |
| LLM・APIキー・費用     | アプリ側が用意する                         | 不要（ユーザーのエージェントが持つ）                           |
| アプリがやること       | プロンプト設計、チャットUI、推論結果の反映 | 既存の関数に名前・説明・入力スキーマを付けて登録するだけ       |
| 使えるAI               | そのアプリ専用                             | ユーザーが普段使うブラウザのエージェント。複数サイトをまたげる |
| エージェントの操作方法 | —                                          | 画面のスクレイピングやクリック推測ではなく、関数呼び出し       |

このデモでは、`src/todos/` にはAIに関するコードが一切なく、`src/TodoTools.tsx` で `todoStore` の関数をツールとして登録しているだけです。

## 技術スタック

Vite + React + TypeScript。lint は oxlint、format は oxfmt。WebMCP 用のライブラリは使わず、ブラウザ標準の `registerTool()` を自前フックで呼んでいます。

## ファイル構成

- `src/todos/`：ふつうのTODOアプリ。AI・WebMCP のコードなし
  - `todoStore.ts`：追加・完了・削除と localStorage 保存
  - `TodoApp.tsx`：TODO画面
- `src/webmcp/`：WebMCP の土台
  - `types.ts`：まだ DOM 型にない `modelContext` の型定義と機能検出
  - `useWebMCPTool.ts`：コンポーネントの表示中だけツールを登録し、アンマウント時に `AbortController` で解除するフック
- `src/toolDefinitions.ts`：公開するツールの名前・説明・入力スキーマ
- `src/TodoTools.tsx`：4つのツールを登録する
  - `list_todos`：一覧を返す（読み取り専用）
  - `add_todo`：追加する
  - `complete_todo`：完了にする
  - `delete_todo`：削除する。取り消せない操作なので、実行前に `confirm()` でユーザーに確認する
- `src/App.tsx`：画面右側に「公開しているツール」と「エージェントからの呼び出しログ」を表示。ログはデモ用の見える化で、WebMCP の動作には不要

## 動かし方

```sh
npm install
npm run dev      # 開発サーバー
npm run check    # oxlint + oxfmt --check + 型チェック
npm run format   # oxfmt で整形
npm run build    # 本番ビルド
```

### WebMCP を有効にする

1. Chrome 149 以降で `chrome://flags/#enable-webmcp-testing` を有効にして再起動する
2. Chrome 拡張機能「Model Context Tool Inspector」をインストールする
3. デモを開くと「WebMCP 有効」と表示され、Inspector に4つのツールが出る
4. Inspector からツールを実行すると、TODOが変わり、右側のログに入力と結果が出る

WebMCP 非対応のブラウザでも、TODOアプリとしてはそのまま使えます。

## 注意

- WebMCP は W3C Community Group のドラフトで、API は変化中です。2026年7月に `navigator.modelContext` から `document.modelContext` に移ったため、両方を見て判定しています。
- 実際にツールを呼ぶエージェントはまだ限られます（Gemini in Chrome が最初の想定）。
