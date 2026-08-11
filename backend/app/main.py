from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import CORS_ORIGINS
from app.api.routes import router

app = FastAPI(
    title="Tally — Sales Data Analyzer API",
    description="Backend API powering retail sales analytics, data cleaning, ML predictions, and PDF export.",
    version="1.0.0"
)

# Enable CORS for local frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def root():
    return {
        "app": "Tally Sales Data Analyzer API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health"
    }
