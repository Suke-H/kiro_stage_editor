# CLAUDE.md

必ず日本語で回答してください。
Pythonの実行・ライブラリ追加等はすべてpoetryコマンドを使用してください。
このファイルは、Claude Code (claude.ai/code) がこのリポジトリでコードを操作する際のガイドラインを提供します。

## プロジェクト概要
パズルゲーム「Kiro」（帰路）のWebベースステージエディタで、Unityに依存せずにゲームステージの作成・編集が可能です。本プロジェクトはReduxによる状態管理を持つReact/TypeScriptフロントエンドと、パズルロジック用のPython FastAPIバックエンドで構成されています。

## 開発コマンド

### フロントエンド (React/TypeScript/Vite)
```bash
cd frontend
npm run dev        # 開発サーバー起動
npm run build      # 本番用ビルド（TypeScriptコンパイル含む）
npm run lint       # ESLint実行
npm run preview    # 本番ビルドのプレビュー
```

### バックエンド (Python/FastAPI)
```bash
cd backend
poetry install            # 依存関係のインストール
poetry run uvicorn main:app --reload  # 開発サーバー起動
poetry run pytest        # 全テスト実行
poetry run pytest tests/test_find_path.py  # 特定のテストファイル実行

# モデル自動生成（JSONスキーマからPydantic v2モデルを生成）
poetry run datamodel-codegen --input ../frontend/src/schemas/grid.json --input-file-type jsonschema --output-model-type pydantic_v2.BaseModel --output models/grid.py
poetry run datamodel-codegen --input ../frontend/src/schemas/path.json --input-file-type jsonschema --output-model-type pydantic_v2.BaseModel --output models/path.py
poetry run datamodel-codegen --input ../frontend/src/schemas/panel.json --input-file-type jsonschema --output-model-type pydantic_v2.BaseModel --output models/panel.py
poetry run datamodel-codegen --input ../frontend/src/schemas/panel-placement.json --input-file-type jsonschema --output-model-type pydantic_v2.BaseModel --output models/panel_placement.py
```

### フルスタック開発
```bash
./start.sh  # フロントエンドとバックエンドの両方を起動（nginx付き本番セットアップ）
```

## Git操作

Claude Codeが使用するGitコマンド：

```bash
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

注意：Generated withコメントやCo-Authored-Byは不要


## アーキテクチャ

### フロントエンド状態管理（Redux）
アプリケーションはRedux Toolkitを使用し、以下の主要スライスで構成されています：
- `grid-slice`: ゲームグリッドの状態とセル管理
- `panel-list-slice`: パネルの作成と管理
- `panel-placement-slice`: パネル配置ロジック
- `studio-mode-slice`: アプリケーションモード切り替え（Editor/Play/Solver）
- `solution-slice`: パズル解答の追跡

全スライスは `frontend/src/store/slices/` に配置され、`frontend/src/store/index.ts` で設定されています。

### バックエンドAPI構造
モジュラーなルーター構造を持つFastAPIアプリケーション：
- `routers/health.py`: ヘルスチェックエンドポイント
- `routers/judge.py`: ゲームロジック検証
- `routers/solver.py`: パズル解法アルゴリズム
- `logic/`: コアパズルアルゴリズム（経路探索、パネル配置）
- `models/`: Pydanticデータモデル（JSONスキーマから自動生成）

### データモデルとスキーマ同期
フロントエンドとバックエンドは `frontend/src/schemas/` にあるJSONスキーマを通じて同一のデータ構造を共有します。`backend/models/` のPythonモデルはdatamodel-code-generatorを使用してこれらのスキーマから自動生成されます。

### ゲームモード
アプリケーションは3つのモードをサポートします：
1. **エディターモード**: グリッドとパネルの作成・編集、YAML出力・入力
2. **プレイモード**: アンドゥ・リセット機能付きのインタラクティブなパズル解法
3. **ソルバーモード**: 自動パズル解法（予定機能）

### ゲームのコア概念
- **グリッド**: 様々なタイプのセル（Start、Goal、DummyGoal、Crow、Wolfなど）を持つ2Dゲームボード
- **パネル**: グリッド上に配置可能な移動可能なピース
- **フェーズ**: 手の進行を追跡するゲーム状態システム
- **経路探索**: ゲームルールを考慮したパズル解答の検証アルゴリズム

### テスト
バックエンドのテストは `backend/tests/` にあり、包括的な経路探索テストケースを含みます。テスト結果は複雑なシナリオのデバッグのため、タイムスタンプ付きで `backend/path_logs/` に記録されます。

### デプロイメント
プロジェクトはDockerでコンテナ化され、Google Cloud Runにデプロイされます。設定には `nginx/default.conf` のnginxリバースプロキシセットアップが含まれます。