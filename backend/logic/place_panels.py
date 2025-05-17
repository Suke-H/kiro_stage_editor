from __future__ import annotations

from copy import deepcopy
from typing import List, Tuple

from models.grid import Grid, GridCellKey, Side
from models.panel import PanelCellTypeKey
from models.panel_placement import PanelPlacement

def _can_place_single(grid: Grid, placement: PanelPlacement) -> bool:
    """「パネルを置けるか」を判定
    パネルの黒セルは Normal(front) のセルにのみ置ける。
    """
    panel      = placement.panel
    hx, hy     = placement.highlight.x, placement.highlight.y
    gx, gy     = placement.point.x, placement.point.y
    top_left_x = gx - hx
    top_left_y = gy - hy

    rows, cols = len(panel.cells), len(panel.cells[0])
    g_rows, g_cols = len(grid.root), len(grid.root[0])

    # 盤外にはみ出す場合 NG
    if top_left_x < 0 or top_left_y < 0 \
       or top_left_x + cols > g_cols \
       or top_left_y + rows > g_rows:
        return False

    for dy, row in enumerate(panel.cells):
        for dx, cell in enumerate(row):
            if cell is not PanelCellTypeKey.Black:
                continue

            tx, ty = top_left_x + dx, top_left_y + dy
            target = grid.root[ty][tx]

            # Norma以外には置けない
            if not target.type == GridCellKey.Normal:
                return False

    return True

def place_panels(
    original: Grid,
    placements: List[PanelPlacement],
    *,
    mutate: bool = False
) -> Tuple[Grid, bool]:
    """
    指定されたすべての PanelPlacement を適用して
    黒マスの重なるセルを flip したあとの新しい Grid と、
    「全配置が有効だったかどうか」のフラグを返す。

    - mutate=True なら original を直接変更、False ならコピーを返す。
    - いずれかの配置が置けない場合は、それ以上処理せず (grid, False) を返す。
    """
    grid = original if mutate else deepcopy(original)

    for pl in placements:
        # _can_place_single が False なら NG
        if not _can_place_single(grid, pl):
            return grid, False

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

                # Neutral は無視、front<->back を反転
                if cell_to_flip.side == Side.front:
                    cell_to_flip.side = Side.back
                elif cell_to_flip.side == Side.back:
                    cell_to_flip.side = Side.front

    # 全配置できた
    return grid, True
