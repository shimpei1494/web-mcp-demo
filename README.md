# web-mcp-demo

WebMCP を理解するためのデモアプリです。ふつうのTODOアプリに、`webmcp.js` 1ファイルだけで WebMCP 対応を足しています。

## 伝えたいこと

「フロントの情報をバックエンドのLLMに送って、結果で画面を操作する」方式との違いは、**AIを誰が持っているか**です。

| | アプリにAIを内蔵する方式 | WebMCP |
|---|---|---|
| LLM・APIキー・費用 | アプリ側が用意する | 不要（ユーザーのエージェントが持つ） |
| アプリがやること | プロンプト設計、チャットUI、推論結果の反映 | 既存の関数に名前・説明・入力スキーマを付けて登録するだけ |
| 使えるAI | そのアプリ専用 | ユーザーが普段使うブラウザのエージェント。複数サイトをまたげる |
| エージェントの操作方法 | — | 画面のスクレイピングやクリック推測ではなく、関数呼び出し |

このデモでは、`todo.js` にはAIに関するコードが一切なく、`webmcp.js` で `todoStore` の関数をツールとして登録しているだけです。

## ファイル構成

- `todo.js`：ふつうのTODOアプリ（追加・完了・削除、localStorage保存）
- `webmcp.js`：WebMCP 対応のすべて。4つのツールを登録する
  - `list_todos`：一覧を返す（読み取り専用）
  - `add_todo`：追加する
  - `complete_todo`：完了にする
  - `delete_todo`：削除する。取り消せない操作なので、実行前に `confirm()` でユーザーに確認する
- 画面右側に「公開しているツール」と「エージェントからの呼び出しログ」を表示します。ログはデモ用の見える化で、WebMCP の動作には不要です。

## 動かし方

ビルド不要です。ES Modules を使うので、ローカルサーバー経由で開いてください。

```sh
python3 -m http.server 8000
# http://localhost:8000 を開く
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
