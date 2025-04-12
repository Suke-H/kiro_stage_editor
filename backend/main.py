from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# from app.routers import health

app = FastAPI(title="Kiro Stage Editor Logic API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

# app.include_router(health.router, prefix="/api")
