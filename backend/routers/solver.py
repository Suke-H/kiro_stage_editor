# app/routers/solver.py
from fastapi import APIRouter
from pydantic import BaseModel
from models.grid import Grid
from models.panel import Panel
from models.panel_placement import PanelPlacement
from logic.solve import solve_all

from pprint import pprint

router = APIRouter()

# class SolveRequest(BaseModel):
#     grid: Grid
#     panels: list[Panel]
class SolveResponse(BaseModel):
    solutions: list[list[PanelPlacement]]

@router.post('/solve', response_model=SolveResponse)
async def solver(grid: Grid, panels: list[Panel]):
    sols = solve_all(grid, panels)
    pprint(f"sols: {sols}")
    return SolveResponse(solutions=sols)
