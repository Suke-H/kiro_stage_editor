from __future__ import annotations

from itertools import product
from typing import List, Optional

from models.grid import Grid
from models.panel import Panel
from models.panel_placement import PanelPlacement, Vector
from models.path import Result
from logic.find_path import find_path
from logic.place_panels import place_panels, _can_place_single


def _enumerate_single_panel(grid: Grid, panel: Panel) -> List[PanelPlacement]:
    """1枚のパネルの全配置を列挙"""

    g_rows, g_cols = len(grid.root), len(grid.root[0])

    # パネル内の最初の黒セル (hx, hy) を探す
    first_black = next(
        ((x, y)
         for y, row in enumerate(panel.cells)
         for x, c in enumerate(row)
         if c.name == 'Black'),
        None
    )
    if first_black is None:
        return []  # 黒セルが1つもないなら何もできない

    hx, hy = first_black

    placements: List[PanelPlacement] = []
    for gy in range(g_rows):
        for gx in range(g_cols):
            pl = PanelPlacement(
                panel=panel,
                highlight=Vector(x=hx, y=hy),
                point=Vector(x=gx, y=gy),
            )
            if _can_place_single(grid, pl):
                placements.append(pl)
    return placements

def solve_single(
    initial: Grid,
    panels: List[Panel]
) -> Optional[List[PanelPlacement]]:
    """
    与えられたグリッドとパネル集合に対し、
    『クリア(HasClearPath)になる最初の配置列』を返す。
    """
    # 各パネルの全配置パターン
    all_opts: List[List[PanelPlacement]] = [
        _enumerate_single_panel(initial, p) for p in panels
    ]

    # 直積を回して最初にクリアになるものを返す
    for comb in product(*all_opts):
        placements: List[PanelPlacement] = list(comb)

        # 配置適用＆有効判定
        grid_after, ok = place_panels(initial, placements)
        if not ok:
            continue

        # パス探索
        path_result = find_path(grid_after)
        if path_result.result == Result.HasClearPath:
            return placements

    return None

def solve_all(
    initial: Grid,
    panels: List[Panel],
    *,
    allow_skip: bool = True
) -> List[List[PanelPlacement]]:
    """
    クリア(HasClearPath)になるすべての配置列を返す。
    None（置かない）も許可する場合は allow_skip=True。
    """
    # 各パネルの取り得る全パターン
    all_opts = [_enumerate_single_panel(initial, p) for p in panels]
    if allow_skip:
        all_opts = [[None] + opts for opts in all_opts]

    solutions: List[List[PanelPlacement]] = []

    for comb in product(*all_opts):
        placements = [pl for pl in comb if pl is not None]

        # place_panels の戻り値をアンパック
        grid_after, ok = place_panels(initial, placements)
        if not ok:
            # 配置不可ならスキップ
            continue

        path_result = find_path(grid_after)
        if path_result.result == Result.HasClearPath:
            solutions.append(placements)

    return solutions
