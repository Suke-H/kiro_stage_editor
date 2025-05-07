# app/routers/solver.py
from fastapi import APIRouter, HTTPException
from models.grid import Grid
from models.panel import Panel
from models.panel_placement import PanelPlacement
from logic.solve import solve

router = APIRouter()

@router.post('/solve')
async def solver(grid: Grid, panels: list[Panel]):
    placements = solve(grid, panels)
    if placements is None:
        raise HTTPException(status_code=404, detail='No solution')
    return {'placements': placements}
