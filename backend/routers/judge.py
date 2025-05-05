# routers/judge.py
# --- Pydantic v1 compatibility patch for importing path models -----
import pydantic
import pydantic.v1
# path.py uses __root__ v1 style, so swap BaseModel before importing it
pydantic.BaseModel = pydantic.v1.BaseModel
pydantic.Extra     = pydantic.v1.Extra
# ------------------------------------------------------------------

from fastapi import APIRouter
from fastapi.encoders import jsonable_encoder
from models.path import Path, PathResult, Result, Vector

router = APIRouter()

@router.get("/judge")
async def judge_check():
    """Return status=ok and a PathResult (from models.path) without modifying path.py"""

    # Build example PathResult using v1-compatible models
    example = PathResult(
        path=Path(__root__=[
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