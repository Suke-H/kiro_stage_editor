from __future__ import annotations

from collections import deque
from typing import Dict, List, Set, Tuple

from models.grid import Grid, GridCellKey, Side
from models.path import Path, PathResult, Result, Vector

DIRECTIONS: List[Tuple[int, int]] = [(-1, 0), (1, 0), (0, -1), (0, 1)]

def in_bounds(x: int, y: int, grid: Grid) -> bool:
    return 0 <= y < len(grid.root) and 0 <= x < len(grid.root[0])

def is_passable(cell) -> bool:
    """
    - Empty            → NG
    - side == back     → NG
    - それ以外         → OK（Start / Goal / DummyGoal / Crow などは通過可）
    """
    if cell.type == GridCellKey.Empty:
        return False
    if cell.side == Side.back:
        return False
    return True

def find_single(grid: Grid, target: GridCellKey) -> Tuple[int, int] | None:
    """grid 内で最初に見つかった target の座標 (x, y) を返す"""
    for y, row in enumerate(grid.root):
        for x, cell in enumerate(row):
            if cell.type == target:
                return (x, y)
    return None

def find_all(grid: Grid, target: GridCellKey) -> List[Tuple[int, int]]:
    """grid 内で見つかった target の全座標リストを返す"""
    coords: List[Tuple[int, int]] = []
    for y, row in enumerate(grid.root):
        for x, cell in enumerate(row):
            if cell.type == target:
                coords.append((x, y))
    return coords

def _bfs_all_shortest_paths(
    grid: Grid, start: Tuple[int, int], goal: Tuple[int, int]
) -> List[List[Tuple[int, int]]]:
    """
    start→goal への **すべての最短経路** を返す。
    見つからなければ空リスト。
    """
    # dist と parents(複数) を保持
    dist: Dict[Tuple[int, int], int] = {start: 0}
    parents: Dict[Tuple[int, int], List[Tuple[int, int]]] = {}

    q: deque[Tuple[int, int]] = deque([start])

    while q:
        cx, cy = q.popleft()
        cur_d = dist[(cx, cy)]

        # 目標距離を超えたら探索終了
        if (cx, cy) == goal:
            goal_dist = cur_d
            break

        for dx, dy in DIRECTIONS:
            nx, ny = cx + dx, cy + dy
            if not in_bounds(nx, ny, grid):
                continue
            if not is_passable(grid.root[ny][nx]):
                continue

            nd = cur_d + 1
            if (nx, ny) not in dist:
                # 未訪問
                dist[(nx, ny)] = nd
                parents.setdefault((nx, ny), []).append((cx, cy))
                q.append((nx, ny))
            elif dist[(nx, ny)] == nd:
                # 既訪問だが「同距離」であれば最短経路の一部
                parents[(nx, ny)].append((cx, cy))

    else:
        # BFS 完了してもゴール未到達
        return []

    # 再帰で経路再構築
    paths: List[List[Tuple[int, int]]] = []

    def _build(cur: Tuple[int, int], acc: List[Tuple[int, int]]):
        if cur == start:
            paths.append(list(reversed(acc + [cur])))
            return
        for p in parents.get(cur, []):
            _build(p, acc + [cur])

    _build(goal, [])
    return paths


def find_path(grid: Grid) -> PathResult:
    """
    優先度: 最短経路 → 本物ゴール優先 → 通過カラス数多い順
    クリア条件: 本物ゴールに到達かつステージ内の全カラスを通過
    """
    # Start が無ければ即終了
    start = find_single(grid, GridCellKey.Start)
    if start is None:
        return PathResult(result=Result.NoStart, path=Path(root=[]))

    # Goal / DummyGoal を検出
    goal_real = find_single(grid, GridCellKey.Goal)
    # goal_dummy = find_single(grid, GridCellKey.DummyGoal)
    dummy_goals = find_all(grid, GridCellKey.DummyGoal)

    # Goal が無ければ即終了
    if goal_real is None:
        return PathResult(result=Result.NoGoal, path=Path(root=[]))

    # 最短経路群を取得
    real_paths: List[List[Tuple[int, int]]] = _bfs_all_shortest_paths(grid, start, goal_real)
    # dummy_paths: List[List[Tuple[int, int]]] = (
    #     _bfs_all_shortest_paths(grid, start, goal_dummy) if goal_dummy else []
    # )

    # すべての DummyGoal に対して最短経路を取得
    dummy_paths: List[List[Tuple[int, int]]] = []
    for dg in dummy_goals:
        dummy_paths.extend(_bfs_all_shortest_paths(grid, start, dg))

    # 候補リスト作成
    all_candidates: List[dict] = []
    for p in real_paths:
        all_candidates.append({"path": p, "is_real": True, "crow_cnt": 0})
    for p in dummy_paths:
        all_candidates.append({"path": p, "is_real": False, "crow_cnt": 0})

    if not all_candidates:
        return PathResult(result=Result.NoPath, path=Path(root=[]))

    # ステージ内の全カラス位置
    crow_positions: Set[Tuple[int, int]] = {
        (x, y)
        for y, row in enumerate(grid.root)
        for x, cell in enumerate(row)
        if cell.type == GridCellKey.Crow
    }
    total_crows = len(crow_positions)

    # 各候補にカラス数を付与
    for cand in all_candidates:
        cand["crow_cnt"] = sum(1 for pt in cand["path"] if pt in crow_positions)

    # ソート: 経路長 → 本物ゴール優先 → カラス多い順
    all_candidates.sort(
        key=lambda c: (
            len(c["path"]),
            0 if c["is_real"] else 1,
            -c["crow_cnt"],
        )
    )

    best = all_candidates[0]
    vectors = [Vector(x=x, y=y) for x, y in best["path"]]

    # 新クリア判定：本物ゴール＆全カラス通過
    if best["is_real"] and best["crow_cnt"] == total_crows:
        status = Result.HasClearPath
    else:
        status = Result.HasFailPath

    return PathResult(path=Path(root=vectors), result=status)

