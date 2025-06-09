from fastapi import APIRouter, HTTPException
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from typing import List, Optional

from models.path import Path, PathResult, Result, Vector
from models.grid import Grid, GridCellKey, Side

from logic.find_path import find_path

router = APIRouter()

class JudgeRequest(BaseModel):
    grid: Grid
    phaseHistory: Optional[List[Grid]] = None

@router.post("/judge")
async def judge_check(request: JudgeRequest):
    """
    - Start, Goal が無ければ NoPath
    - 経路が見つかれば HasClearPath
    """

    path_result = find_path(request.grid, request.phaseHistory)
    
    return {"status": "ok", "data": jsonable_encoder(path_result)}
