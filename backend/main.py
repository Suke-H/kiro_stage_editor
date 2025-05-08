from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import health, judge, solver

app = FastAPI(title="Kiro Stage Editor Logic API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(judge.router, prefix="/api")
app.include_router(solver.router, prefix="/api")

