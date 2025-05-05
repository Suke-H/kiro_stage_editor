from fastapi import APIRouter

router = APIRouter()

@router.get("/judge")
async def judge_check():
    return {"status": "ok"}
