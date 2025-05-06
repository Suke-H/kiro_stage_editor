from fastapi import APIRouter, HTTPException
from fastapi.encoders import jsonable_encoder

from models.path import Path, PathResult, Result, Vector
from models.grid import Grid, GridCellKey, Side

from logic.find_path import find_path

router = APIRouter()

@router.post("/judge")
async def judge_check(grid: Grid):
    """
    - Start, Goal が無ければ NoPath
    - 経路が見つかれば HasClearPath
    """

    path_result = find_path(grid)
    
    return {"status": "ok", "data": jsonable_encoder(path_result)}
