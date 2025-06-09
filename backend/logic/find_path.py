from __future__ import annotations

from collections import deque
from typing import Dict, List, Set, Tuple
import copy
from copy import deepcopy

from models.grid import Grid, GridCell, GridCellKey, Side
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


def create_footprint_grid(grid: Grid, path: List[Tuple[int, int]]) -> Grid:
    """
    パスに基づいて足あとを描画したグリッドを作成する（クリア時用）
    ゴール地点にキャラクター（Start）を配置し、スタート地点を適切に変更する
    """
    # 元のグリッドをディープコピー
    new_grid_data = copy.deepcopy(grid.root)
    
    # スタート地点の処理
    start_x, start_y = path[0]
    current_start_cell = new_grid_data[start_y][start_x]
    
    # 元々Restだった位置かどうかを判定
    # グリッド全体でRestの位置を確認し、現在のStart位置がRest位置にあるかチェック
    rest_positions = find_all(grid, GridCellKey.Rest)
    is_start_on_rest = (start_x, start_y) in rest_positions
    
    # 1. Start->Goalの場合: StartをNormal:frontに変える
    # 2. Rest(今はStart)->Goalの場合: Restに戻す
    if is_start_on_rest:
        # Rest経由でのクリア：元のRest（現在のStart）をRestに戻す
        new_grid_data[start_y][start_x] = GridCell(type=GridCellKey.Rest, side=Side.neutral)
    else:
        # 初回クリア：StartをNormal:frontに変更
        new_grid_data[start_y][start_x] = GridCell(type=GridCellKey.Normal, side=Side.front)
    
    # ループ：先頭(0)と末尾(len(path)-1)を除外
    for i in range(1, len(path) - 1):
        prev_x, prev_y = path[i - 1]
        curr_x, curr_y = path[i]
        
        dx = curr_x - prev_x
        dy = curr_y - prev_y

        footprint_type = None
        if dx == 1 and dy == 0:
            footprint_type = GridCellKey.FootRight
        elif dx == -1 and dy == 0:
            footprint_type = GridCellKey.FootLeft
        elif dx == 0 and dy == 1:
            footprint_type = GridCellKey.FootDown
        elif dx == 0 and dy == -1:
            footprint_type = GridCellKey.FootUp

        if footprint_type:
            new_grid_data[curr_y][curr_x] = GridCell(
                type=footprint_type,
                side=Side.neutral
            )
    
    # ゴール地点（パスの最後）にキャラクター（Start）を配置
    goal_x, goal_y = path[-1]
    new_grid_data[goal_y][goal_x] = GridCell(
        type=GridCellKey.Start,
        side=Side.neutral
    )
    
    return Grid(new_grid_data)


def create_rest_transition_grid(grid: Grid, start: Tuple[int, int], rest_position: Tuple[int, int], crow_positions: Set[Tuple[int, int]], path: List[Tuple[int, int]]) -> Grid:
    """
    Rest到達時の次状態グリッドを作成する
    """
    # 盤面を深コピーして書き換え
    new_grid_data = deepcopy(grid.root)
    
    # 現在のStartの位置を確認
    sx, sy = start
    current_start_cell = new_grid_data[sy][sx]
    
    # 1. 初回Rest到達（StartからRest）の場合：StartをNormal:frontに
    # 2. Rest間移動（StartがもともとRest）の場合：StartをRestに戻す
    if current_start_cell.type == GridCellKey.Start:
        # 初回Rest到達：StartをNormal:frontに変更
        new_grid_data[sy][sx] = GridCell(type=GridCellKey.Normal, side=Side.front)
    else:
        # Rest間移動時：前のRest（現在のStart）をRestに戻す
        new_grid_data[sy][sx] = GridCell(type=GridCellKey.Rest, side=Side.neutral)
    
    # 通過した Crow を消去
    for x, y in path:
        if (x, y) in crow_positions:
            new_grid_data[y][x].type = GridCellKey.Empty
    
    # 到達した Rest を新しい Start に置換
    rx, ry = rest_position
    new_grid_data[ry][rx] = GridCell(type=GridCellKey.Start, side=Side.neutral)
    
    return Grid(new_grid_data)


def find_path(grid: Grid) -> PathResult:
    """
    優先度: 最短経路 → 本物ゴール優先 → 通過カラス数多い順
    クリア条件: 本物ゴールに到達かつステージ内の全カラスを通過
    """
    # Start が無ければ即終了
    start = find_single(grid, GridCellKey.Start)
    if start is None:
        return PathResult(result=Result.NoStart, path=Path([]), nextGrid=None)

    # Goal / DummyGoal / Rest を検出
    goal_real = find_single(grid, GridCellKey.Goal)
    dummy_goals = find_all(grid, GridCellKey.DummyGoal)
    rest_positions = find_all(grid, GridCellKey.Rest)

    # Goal が無ければ即終了
    if goal_real is None:
        return PathResult(result=Result.NoGoal, path=Path([]), nextGrid=None)

    # 最短経路群を取得
    real_paths: List[List[Tuple[int, int]]] = _bfs_all_shortest_paths(grid, start, goal_real)

    # すべての DummyGoal に対して最短経路を取得
    dummy_paths: List[List[Tuple[int, int]]] = []
    for dg in dummy_goals:
        dummy_paths.extend(_bfs_all_shortest_paths(grid, start, dg))
    
    # すべての Rest に対して最短経路を取得
    rest_paths: List[List[Tuple[int, int]]] = []
    for rest in rest_positions:
        rest_paths.extend(_bfs_all_shortest_paths(grid, start, rest))

    # 候補リスト作成
    all_candidates: List[dict] = []
    for p in real_paths:
        all_candidates.append({"path": p, "kind": 0, "crow_cnt": 0})  # kind 0: real goal
    for p in dummy_paths:
        all_candidates.append({"path": p, "kind": 1, "crow_cnt": 0})  # kind 1: dummy goal
    for p in rest_paths:
        all_candidates.append({"path": p, "kind": 2, "crow_cnt": 0})  # kind 2: rest

    if not all_candidates:
        return PathResult(result=Result.NoPath, path=Path([]), nextGrid=None)

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
            c["kind"],  # 0(real) < 1(dummy) < 2(rest)
            -c["crow_cnt"],
        )
    )

    best = all_candidates[0]
    vectors = [Vector(x=x, y=y) for x, y in best["path"]]

    # 次状態 Grid を入れる箱（Rest 以外は None のまま）
    next_grid: Grid | None = None

    # 判定とステータス設定
    if best["kind"] == 0 and best["crow_cnt"] == total_crows:
        status = Result.HasClearPath
        # クリア時に足あとを描画したnextGridを作成
        next_grid = create_footprint_grid(grid, best["path"])
    elif best["kind"] == 2:
        # Rest 到達時の特別処理
        status = Result.HasRestPath
        rest_position = best["path"][-1]
        next_grid = create_rest_transition_grid(grid, start, rest_position, crow_positions, best["path"])
    else:
        status = Result.HasFailPath

    # next_grid は Rest 到達時のみ非 None
    return PathResult(path=Path(vectors), result=status, nextGrid=next_grid)

