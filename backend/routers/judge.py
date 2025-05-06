import pydantic
# import pydantic.v1
# pydantic.BaseModel = pydantic.v1.BaseModel
# pydantic.Extra     = pydantic.v1.Extra

from fastapi import APIRouter
from fastapi import Request, Body
from fastapi.encoders import jsonable_encoder
from models.path import Path, PathResult, Result, Vector
from models.grid import Grid

router = APIRouter()

@router.post("/judge")
async def judge_check(grid: Grid):
    print(f"Grid: {grid}")

    example = PathResult(
        path=Path([
            Vector(x=0, y=0),
            Vector(x=1, y=1),
            Vector(x=2, y=2),
        ]),
        result=Result.HasClearPath,
    )

    return {
        "status": "ok",
        "data": jsonable_encoder(example),
    }
