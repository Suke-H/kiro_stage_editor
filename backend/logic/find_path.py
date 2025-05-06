from models.grid import Grid, GridCellKey, Side
from models.path import Path, PathResult, Result, Vector

DIRECTIONS = [(-1, 0), (1, 0), (0, -1), (0, 1)] # 左右上下

def in_bounds(x: int, y: int, grid: Grid) -> bool:
    return 0 <= y < len(grid.root) and 0 <= x < len(grid.root[0])

def is_passable(cell) -> bool:
    """
    - Type == Empty          → NG
    - Side == back           → NG
    - それ以外               → OK
    """
    if cell.type == GridCellKey.Empty:
        return False
    if cell.side == Side.back:
        return False
    return True   # neutral / front は通過可能

def find_single(grid: Grid, target: GridCellKey) -> tuple[int, int] | None:
    """grid 内で最初に見つかった target の座標 (x, y) を返す"""
    for y, row in enumerate(grid.root):
        for x, cell in enumerate(row):
            if cell.type == target:
                return (x, y)
    return None

def bfs_shortest_path(grid: Grid) -> tuple[Result, list[tuple[int, int]]]:
    """
    Start → Goal の最短経路を BFS で返す。
    経路が無ければ空 list。
    """
    start = find_single(grid, GridCellKey.Start)
    if start is None:
        return (Result.NoStart, [])

    goal = find_single(grid, GridCellKey.Goal)
    if goal is None:
        return (Result.NoGoal, [])

    from collections import deque
    queue = deque([start])
    visited: set[tuple[int, int]] = {start}
    parent: dict[tuple[int, int], tuple[int, int]] = {}

    while queue:
        x, y = queue.popleft()

        if (x, y) == goal:
            # ゴール到達：親ポインタを辿って経路再構築
            path: list[tuple[int, int]] = []
            cur = goal
            while cur != start:
                path.append(cur)
                cur = parent[cur]
            path.append(start)
            path.reverse()
            return (Result.HasClearPath, path) # ゴール到達

        for dx, dy in DIRECTIONS:
            nx, ny = x + dx, y + dy
            if not in_bounds(nx, ny, grid):
                continue
            if (nx, ny) in visited:
                continue
            cell = grid.root[ny][nx]
            if not is_passable(cell):
                continue

            queue.append((nx, ny))
            visited.add((nx, ny))
            parent[(nx, ny)] = (x, y)

    return (Result.NoPath, [])       # 到達不能

def find_path(grid: Grid):
    """
    - NoStart: Start が無い
    - NoGoal: Goal が無い
    - NoPath: 経路が見つからない
    - HasClearPath: 経路が見つかった
    - HasFailPath: 経路が見つかったが、間違えた道を選択した
    """
    result, path_xy = bfs_shortest_path(grid)

    vectors = [Vector(x=x, y=y) for x, y in path_xy]
    path = Path(root=vectors)

    return PathResult(path=path, result=result)