# app/logic/solve.py
from __future__ import annotations

from itertools import product
from typing import List, Optional

from models.grid import Grid
from models.panel import Panel
from models.panel_placement import PanelPlacement, Vector
from models.path import Result
from logic.find_path import find_path
from logic.place_panels import place_panels, _can_place_single   # _can... を再利用


def _enumerate_single_panel(grid: Grid, panel: Panel) -> List[PanelPlacement]:
    """1 枚のパネルについて取り得るすべての配置を列挙"""
    g_rows, g_cols = len(grid.root), len(grid.root[0])
    p_rows, p_cols = len(panel.cells), len(panel.cells[0])

    placements: List[PanelPlacement] = []
    # highlight (=hx,hy) は黒セルに限定すると大幅に数が減る
    black_cells = [(x, y)
                   for y, row in enumerate(panel.cells)
                   for x, c in enumerate(row) if c.name == 'Black']

    for gy, gx in product(range(g_rows), range(g_cols)):
        anchor = Vector(x=gx, y=gy)
        for hx, hy in black_cells:
            pl = PanelPlacement(panel=panel,
                                highlight=Vector(x=hx, y=hy),
                                point=anchor)
            if _can_place_single(grid, pl):
                placements.append(pl)
    return placements


def solve(initial: Grid,
          panels: List[Panel]) -> Optional[List[PanelPlacement]]:
    """
    与えられたグリッドとパネル集合に対し、
    『クリア(HasClearPath)になる最初の配置列』を返す。
    見つからなければ None
    """
    # 前計算：各パネルの全パターン
    all_opts = [_enumerate_single_panel(initial, p) for p in panels]

    # ✔ どのパネルも「置かない」という選択肢も含めたいなら
    #   `opts = [[]] + list_opts` などで補完してから product を回す
    for comb in product(*all_opts):
        # product は tuple; list にして mutate 可能に
        grid_after = place_panels(initial, list(comb))
        path_result = find_path(grid_after)
        if path_result.result == Result.HasClearPath:
            return list(comb)

    return None       # クリア不可
