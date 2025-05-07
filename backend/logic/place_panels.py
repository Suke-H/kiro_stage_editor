from __future__ import annotations

from copy import deepcopy
from typing import List

from models.grid import Grid, GridCellKey, Side
from models.panel import PanelCellTypeKey
from models.panel_placement import PanelPlacement

def _can_place_single(grid: Grid, placement: PanelPlacement) -> bool:
    """フロントエンドと同じルールで『置ける？』を判定"""
    panel      = placement.panel
    hx, hy     = placement.highlight.x, placement.highlight.y
    gx, gy     = placement.point.x, placement.point.y
    top_left_x = gx - hx
    top_left_y = gy - hy

    rows, cols = len(panel.cells), len(panel.cells[0])
    g_rows, g_cols = len(grid.root), len(grid.root[0])

    # 盤外にはみ出す？
    if top_left_x < 0 or top_left_y < 0 or \
       top_left_y + rows > g_rows or top_left_x + cols > g_cols:
        return False

    for dy, row in enumerate(panel.cells):
        for dx, cell in enumerate(row):
            if cell is not PanelCellTypeKey.Black:
                continue
            tx, ty = top_left_x + dx, top_left_y + dy
            target = grid.root[ty][tx]

            # Empty に黒パネルは置けない
            if target.type == GridCellKey.Empty:
                return False
    return True


def place_panels(original: Grid,
                 placements: List[PanelPlacement],
                 *,
                 mutate: bool = False) -> Grid:
    """
    指定されたすべての PanelPlacement を適用して
    黒マスの重なるセルを flip したあとの新しい Grid を返す
    (mutate=True なら original を直接変更)
    """
    grid = original if mutate else deepcopy(original)

    for pl in placements:
        if not _can_place_single(grid, pl):
            raise ValueError(f'invalid placement: {pl}')

        panel      = pl.panel
        hx, hy     = pl.highlight.x, pl.highlight.y
        gx, gy     = pl.point.x, pl.point.y
        top_left_x = gx - hx
        top_left_y = gy - hy

        for dy, row in enumerate(panel.cells):
            for dx, cell in enumerate(row):
                if cell is not PanelCellTypeKey.Black:
                    continue
                tx, ty = top_left_x + dx, top_left_y + dy
                cell_to_flip = grid.root[ty][tx]

                # neutral は flip しない（Start/Goal など）
                if cell_to_flip.side == Side.front:
                    cell_to_flip.side = Side.back
                elif cell_to_flip.side == Side.back:
                    cell_to_flip.side = Side.front
                # neutral: no-op
    return grid
