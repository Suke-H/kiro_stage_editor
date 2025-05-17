from pathlib import Path
from typing import List
from models.path import Vector

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