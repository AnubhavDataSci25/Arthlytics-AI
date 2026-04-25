from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.api import health, auth, upload, stats

@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"Arthlytics AI starting -  ENV: {settings.ENV}")
    yield
    print("Arthlytics AI shutting down")

app = FastAPI(
    title="Athlytics AI",
    description="An AI Powered Data Analytics and Insights Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(auth.router, prefix="/api", tags=["Auth"])
app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(stats.router, prefix="/api", tags=["Stats"])

@app.get("/")
async def root():
    return {"message": "Arthlytics AI is running! ✅", "docs": "/docs"}