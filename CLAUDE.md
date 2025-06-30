# CLAUDE.md

必ず日本語で回答してください。
このファイルは、Claude Code (claude.ai/code) がこのリポジトリでコードを操作する際のガイドラインを提供します。

## プロジェクト概要
パズルゲーム「Kiro」（帰路）のWebベースステージエディタで、Unityに依存せずにゲームステージの作成・編集が可能です。本プロジェクトはReduxによる状態管理を持つReact/TypeScriptフロントエンドで、パズルロジックも全てTypeScriptで実装されています。

## 開発コマンド

### 開発 (React/TypeScript/Vite)
```bash
npm run dev        # 開発サーバー起動
npm run build      # 本番用ビルド（TypeScriptコンパイル含む）
npm run lint       # ESLint実行
npm run preview    # 本番ビルドのプレビュー
npm test           # テスト実行
```

**重要: TypeScript Path Mapping設定**
新しいパスエイリアスを追加する場合は、以下の2つのファイルを必ず更新してください：
- `tsconfig.app.json` - アプリケーション用の設定
- `tsconfig.json` - プロジェクト全体の設定

例: `@/logic`エイリアスの追加
```json
// tsconfig.app.json
"paths": {
  "@/logic": ["./logic"],
  "@/logic/*": ["./logic/*"]
}

// tsconfig.json  
"paths": {
  "@/logic": ["./src/logic"],
  "@/logic/*": ["./src/logic/*"]
}
```


## Git操作

Claude Codeが使用するGitコマンド：

```bash
# 必ずプロジェクトのルートディレクトリで実行
git add .               # 全変更をステージング  
git commit -m "絵文字 feat: #<issueno> 修正内容"  # コミット作成
```


### コミットメッセージフォーマット
```
絵文字 <type>: #<issue番号> <修正内容>
```

例：
- `✨ feat: #123 新機能の実装`
- `🐛 fix: #456 バグ修正`
- `♻️ refactor: #789 コードリファクタリング`
- `📝 docs: #012 ドキュメント更新`
- `🧪 test: #345 テスト追加`

**重要：Generated withコメントやCo-Authored-Byは追加しない**

## ⚠️ 重要なコーディングルール ⚠️

### 🚫 絶対禁止事項
- **any型の使用を絶対に禁止**
- TypeScriptの型安全性を損なう実装は一切行わない
- 適切な型定義を必ず行う


## アーキテクチャ

### フロントエンド状態管理（Redux）
アプリケーションはRedux Toolkitを使用し、以下の主要スライスで構成されています：
- `grid-slice`: ゲームグリッドの状態とセル管理
- `panel-list-slice`: パネルの作成と管理
- `panel-placement-slice`: パネル配置ロジック
- `studio-mode-slice`: アプリケーションモード切り替え（Editor/Play/Solver）
- `solution-slice`: パズル解答の追跡

全スライスは `src/store/slices/` に配置され、`src/store/index.ts` で設定されています。

### パズルロジック実装
パズルの全ロジックがTypeScriptで実装されています：
- `src/logic/`: コアパズルアルゴリズム（経路探索、パネル配置、ソルバー）
- `src/schemas/`: データモデルのJSONスキーマ定義
- `src/types/`: TypeScript型定義
- `src/api/`: 内部API関数（ローカル実行）

### ゲームモード
アプリケーションは3つのモードをサポートします：
1. **エディターモード**: グリッドとパネルの作成・編集、YAML出力・入力
2. **プレイモード**: アンドゥ・リセット機能付きのインタラクティブなパズル解法
3. **ソルバーモード**: 自動パズル解法

### ゲームのコア概念
- **グリッド**: 様々なタイプのセル（Start、Goal、DummyGoal、Crow、Wolfなど）を持つ2Dゲームボード
- **パネル**: グリッド上に配置可能な移動可能なピース
- **フェーズ**: 手の進行を追跡するゲーム状態システム
- **経路探索**: ゲームルールを考慮したパズル解答の検証アルゴリズム

### テスト
パズルロジックのテストは `src/__tests__/` にあり、包括的な経路探索、パネル配置、ソルバーテストケースを含みます。Vitestを使用してTypeScriptで書かれています。

### デプロイメント
プロジェクトはDockerでコンテナ化され、Google Cloud Runにデプロイされます。Viteでビルドされた静的ファイルをnginxで配信する構成です。