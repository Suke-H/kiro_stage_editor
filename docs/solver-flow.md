

# ソルバー全体のフロー

```text
DFS 1：フェーズ状態を探索
│
└─ 現在のフェーズ
   └─ DFS 2：パネル配置順を全探索
      └─ 各配置盤面を評価
         └─ DFS 3：最短距離の経路を探索
              │
              ├─ Clear ─────────────→ 解として保存
              ├─ 失敗・到達不能 ────→ この枝を終了
              ├─ Flag / Switch ─────→ 変化後の盤面でDFS 2を継続
              └─ Rest到達
                   ↓
                 休憩後の状態 S' は以前通ったことがあるか？
                   ├─ Yes → この枝を終了
                   └─ No  → S'を記録し、DFS 1で次フェーズを探索

```

## 例1: 反転のみ

`solver.basic.test.ts`の「基本的なパズル1を解く」を使う。

```text
cells=h1w7gswbbbbg
panels=h1w4gbbbb
```


```mermaid
flowchart TD
  S0["DFS 1: フェーズ S0<br/>S . X X X X G<br/>パネル: 横4"]
  P0["DFS 2: パネルなし<br/>S . X X X X G"]
  P1["DFS 2: 横4を x=1 に配置<br/>S X . . . X G"]
  P2["DFS 2: 横4を x=2 に配置<br/>S . . . . . G"]
  D0["DFS 3: 最短距離の経路を探索"]
  D1["DFS 3: 最短距離の経路を探索"]
  D2["DFS 3: 最短距離の経路を探索"]
  Fail0["到達不能: 枝を終了"]
  Fail1["到達不能: 枝を終了"]
  Clear["Clear: 解として保存"]

  S0 --> P0 --> D0 --> Fail0
  S0 --> P1 --> D1 --> Fail1
  S0 --> P2 --> D2 --> Clear
```


## 実例2: 複数のRest

`solver.rest.test.ts`の「複数Rest地点があるパズルを解く」を使う。

```text
cells=h4w5gewwwwwwswwwwrwwrwwdg
panels=h1w2gbb_h2w1gbb
```


```mermaid
flowchart TD
  S0["DFS 1: S0 / Start<br/>E....<br/>..S..<br/>..R..<br/>R..DG"]
  S0P0["DFS 2: パネルなし"]
  S0P1["DFS 2: P横2を x=1, y=0 に配置"]
  S0D0["DFS 3: Rest R1へ到達"]
  S0D1["DFS 3: Rest R1へ到達"]
  Check1{"休憩後の状態 S1 は<br/>以前通ったことがあるか?"}
  Stop1["Yes: 枝を終了"]

  S1["No: S1を記録<br/>DFS 1: Rest R1から開始<br/>E....<br/>.....<br/>..S..<br/>R..DG"]
  S1P0["DFS 2: パネルなし"]
  S1P1["DFS 2: P縦2を x=3, y=1<br/>P横2を x=1, y=3 に配置"]
  Fail1["DFS 3: 失敗 / 枝を終了"]
  Rest2["DFS 3: Rest R2へ到達"]
  Check2{"休憩後の状態 S2 は<br/>以前通ったことがあるか?"}

  S2["No: S2を記録<br/>DFS 1: Rest R2から開始<br/>E....<br/>.....<br/>..R..<br/>S..DG"]
  S2P0["DFS 2: パネルなし"]
  S2P1["DFS 2: P縦2を x=1, y=2<br/>P横2を x=2, y=1 に配置"]
  Fail2["DFS 3: 失敗 / 枝を終了"]
  Clear["DFS 3: Clear / 解として保存"]

  S0 --> S0P0 --> S0D0 --> Check1
  S0 --> S0P1 --> S0D1 --> Check1
  Check1 -- Yes --> Stop1
  Check1 -- No --> S1
  S1 --> S1P0 --> Fail1
  S1 --> S1P1 --> Rest2 --> Check2
  Check2 -- No --> S2
  S2 --> S2P0 --> Fail2
  S2 --> S2P1 --> Clear
```
