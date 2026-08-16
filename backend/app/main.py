import sys
import os
import traceback

# Add the 'backend' directory to sys.path so 'app' can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

# Define app at module level so Vercel AST parser finds it
app = FastAPI()

try:
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.staticfiles import StaticFiles
    from slowapi import Limiter, _rate_limit_exceeded_handler
    from slowapi.util import get_remote_address
    from slowapi.errors import RateLimitExceeded

    from app.core.config import settings
    from app.api.v1.router import api_router
    from app.database.session import engine
    from app.database.base import Base
    import app.models

    from app.core.rate_limit import limiter
    import logging

    app.title = settings.PROJECT_NAME
    app.version = settings.VERSION
    app.openapi_url = f"{settings.API_V1_STR}/openapi.json"

    logger = logging.getLogger(__name__)

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled exception: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": f"Internal Server Error: {str(exc)}"}
        )

    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router, prefix=settings.API_V1_STR)

    try:
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        app.mount("/static/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
    except OSError:
        logger.warning("Could not create UPLOAD_DIR. Running in serverless read-only mode.")

    @app.get("/health", tags=["Health"])
    async def health_check():
        return {
            "status": "healthy",
            "service": settings.PROJECT_NAME,
            "version": settings.VERSION
        }
except Exception as e:
    err = traceback.format_exc()
    
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"])
    async def catch_all(request: Request, path: str):
        return JSONResponse(status_code=200, content={"detail": "Startup Error", "error": err})

