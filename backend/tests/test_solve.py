from typing import List

import pytest

from logic.find_path import find_path
from models.grid import Grid, GridCell, GridCellKey, Side
from models.path import Result  # PathResult.Result enum

CHARMAP = {
    "S": (GridCellKey.Start,     Side.neutral),
    "G": (GridCellKey.Goal,      Side.neutral),
    "D": (GridCellKey.DummyGoal, Side.neutral),
    "C": (GridCellKey.Crow,      Side.neutral),
    "#": (GridCellKey.Empty,     Side.neutral),

    ".": (GridCellKey.Normal,    Side.front),
    "x": (GridCellKey.Normal,    Side.back),
}

def grid_from(lines: List[str]) -> Grid:
    rows: List[list[GridCell]] = []
    for line in lines:
        row: List[GridCell] = []
        for ch in line.strip():
            if ch not in CHARMAP:
                raise ValueError(f"Unknown cell char: {ch!r}")
            cell_type, side = CHARMAP[ch]
            row.append(GridCell(type=cell_type, side=side))
        rows.append(row)
    return Grid(root=rows)


# 1) 同距離なら本物ゴール優先
def test_real_goal_priority():
    """
    S→G と S→D が等距離なら、Result は HasClearPath
    """
    grid = grid_from([
        "S.G",
        "...",
        "D..",
    ])
    res = find_path(grid)
    assert res.result == Result.HasClearPath


# 2) ダミーの方が近い → FailPath
def test_dummy_shorter_fails():
    """
    D が距離 1、G が距離 3 の場合は HasFailPath
    """
    grid = grid_from([
        "SD.",
        ".x.",  # x は back 側の壁なので迂回させる
        "..G",
    ])
    res = find_path(grid)
    assert res.result == Result.HasFailPath


# 3) 同距離ならカラス多い方を選択 → ClearPath
def test_crow_tiebreak():
    """
    ２つの等距離経路のうち、
    カラス C を通る経路を選べば HasClearPath
    """
    grid = grid_from([
        "S..",
        ".x.",   # ここは壁でも行けるもう一方のルートを選ぶ感じ
        "C.G",
    ])
    res = find_path(grid)
    assert res.result == Result.HasClearPath
    # オプションで「本当に C を通っているか」もチェックするなら：
    assert any(vec.x == 0 and vec.y == 2 for vec in res.path.root)
