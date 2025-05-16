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
    """1枚のパネルについて、黒セルハイライトを１つだけに固定して全配置を列挙"""
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


def solve_single(initial: Grid,
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

def solve_all(initial: Grid,
              panels: List[Panel],
              *,
              allow_skip: bool = True
              ) -> List[List[PanelPlacement]]:
    """
    クリア(HasClearPath)になる **すべての** 配置列を返す。
    1 つも無ければ空 list。
    `allow_skip=True` で「パネルを置かない」選択肢も許可。
    """
    # 各パネルの取り得る全パターン
    all_opts = [_enumerate_single_panel(initial, p) for p in panels]

    if allow_skip:
        # 置かない (= None) を追加
        all_opts = [[None] + opts for opts in all_opts]

    solutions: List[List[PanelPlacement]] = []

    for comb in product(*all_opts):
        # None を除外（＝置かないパネル）
        placements = [pl for pl in comb if pl is not None]

        grid_after = place_panels(initial, placements)
        path_result = find_path(grid_after)
        if path_result.result == Result.HasClearPath:
            solutions.append(placements)

    return solutions
