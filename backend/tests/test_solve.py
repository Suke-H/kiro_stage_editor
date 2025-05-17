import pytest
from typing import List

from logic.find_path import find_path
from models.grid import Grid, GridCell, GridCellKey, Side
from models.path import Result

from tests.cases.grid_cases import grid_test_cases, test_ids, CHARMAP

def grid_from(lines: List[str]) -> Grid:
    rows = []
    for line in lines:
        row = []
        for ch in line:
            cell_type, side = CHARMAP[ch]
            row.append(GridCell(type=cell_type, side=side))
        rows.append(row)
    return Grid(root=rows)

# テストケース定義 
@pytest.mark.parametrize(
    argnames=("lines", "exp_result", "exp_dummy", "exp_crows"),
    argvalues=grid_test_cases,
    ids=test_ids,
)

def test_find_path(
    lines: List[str],
    exp_result: Result,
    exp_dummy: bool,
    exp_crows: int
):
    grid = grid_from(lines)
    res = find_path(grid)

    # 結果
    assert res.result == exp_result

    # ダミーゴール通過フラグ
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
        passed_dummy = any(
            (v.x, v.y) == dummy_pos
            for v in res.path.root
        )
    assert passed_dummy is exp_dummy

    # カラス通過数
    crow_positions = {
        (x, y)
        for y, row in enumerate(grid.root)
        for x, cell in enumerate(row)
        if cell.type == GridCellKey.Crow
    }
    count_crows = sum(
        1 for v in res.path.root
        if (v.x, v.y) in crow_positions
    )
    assert count_crows == exp_crows
