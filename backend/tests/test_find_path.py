import pytest
from typing import List
from pathlib import Path
from datetime import datetime

from logic.find_path import find_path
from models.grid import Grid, GridCell, GridCellKey
from models.path import Result, Vector

from tests.cases.grid_cases import grid_test_cases, test_ids, CHARMAP
# import utils.dump_path_log as dump_path_log

# ログ作成場所のパス指定
TIMESTAMP = datetime.now().strftime("%Y%m%d%H%M%S")
LOG_DIR = Path("path_logs") / TIMESTAMP

def grid_from(lines: List[str]) -> Grid:
    """
    文字列のリストを受け取り、グリッド生成
    """
    rows: List[List[GridCell]] = []
    for line in lines:
        row: List[GridCell] = []
        for ch in line:
            cell_type, side = CHARMAP[ch]
            row.append(GridCell(type=cell_type, side=side))
        rows.append(row)
    return Grid(root=rows)

def dump_path_log(
    lines: List[str],
    path: List[Vector],
    file_path: Path
) -> None:
    """
    元の lines と、Normal(front) のセルだけを "." → 矢印 ^v<> に置き換えた
    経路可視化バージョンの両方を、file_path に書き出す。
    """
    # 文字グリッドに変換（オリジナル）
    original = [list(row) for row in lines]

    # 文字グリッドに変換（矢印埋め込み用コピー）
    arrowed = [list(row) for row in lines]
    arrows = {
        (1, 0): '>',
        (-1, 0): '<',
        (0, 1): 'v',
        (0, -1): '^',
    }

    # 経路上で次のセルへの方向を矢印に
    for curr, nxt in zip(path, path[1:]):
        dx, dy = nxt.x - curr.x, nxt.y - curr.y
        arrow = arrows.get((dx, dy), '?')
        if arrowed[curr.y][curr.x] == '.':
            arrowed[curr.y][curr.x] = arrow

    # ファイル書き出し
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write("=== ORIGINAL GRID ===\n")
        for row in original:
            f.write(''.join(row) + '\n')
        f.write("\n=== PATH OVERLAY ===\n")
        for row in arrowed:
            f.write(''.join(row) + '\n')

# テストケースの定義
@pytest.mark.parametrize(
    argnames=("lines", "exp_result", "exp_dummy", "exp_crows"),
    argvalues=grid_test_cases,
    ids=test_ids,
)

def test_find_path(
    lines: List[str],
    exp_result: Result,
    exp_dummy: bool,
    exp_crows: int,
    request,
):
    """
    find_path のテストコード

    - lines: テストケースの文字列リスト
    - exp_result: 期待される結果
    - exp_dummy: ダミーゴールを通過したか
    - exp_crows: 通過したカラスの数
    """

    # ログディレクトリを一度だけ作成
    LOG_DIR.mkdir(parents=True, exist_ok=True)

    # find_path 実行
    grid = grid_from(lines)
    res = find_path(grid)

    # 経路ログ出力
    log_file = LOG_DIR / f"{request.node.name}.txt"
    dump_path_log(lines, res.path.root, log_file)
    print(f"\n[Path log] {log_file}\n")

    # 1. パス結果
    assert res.result == exp_result

    # 2. ダミーゴール到達
    dummy_pos = None
    for y, row in enumerate(grid.root):
        for x, cell in enumerate(row):
            if cell.type == GridCellKey.DummyGoal:
                dummy_pos = (x, y)
                break
        if dummy_pos:
            break

    passed_dummy = False
    if dummy_pos:
        passed_dummy = any((v.x, v.y) == dummy_pos for v in res.path.root)
    assert passed_dummy is exp_dummy

    # 3. カラス通過数
    crow_positions = {
        (x, y)
        for y, row in enumerate(grid.root)
        for x, cell in enumerate(row)
        if cell.type == GridCellKey.Crow
    }
    count_crows = sum(1 for v in res.path.root if (v.x, v.y) in crow_positions)
    assert count_crows == exp_crows
