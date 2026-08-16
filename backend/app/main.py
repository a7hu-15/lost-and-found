import traceback

async def fallback_app(scope, receive, send):
    assert scope['type'] == 'http'
    await send({
        'type': 'http.response.start',
        'status': 200,
        'headers': [
            [b'content-type', b'text/plain'],
        ]
    })
    await send({
        'type': 'http.response.body',
        'body': str(GLOBAL_ERROR).encode('utf-8')
    })

try:
    import sys
    import os
    
    # Try multiple ways to add backend to sys.path
    try:
        sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    except NameError:
        pass
    sys.path.append(os.path.join(os.getcwd(), 'backend'))
    sys.path.append(os.getcwd())

    from fastapi import FastAPI, Request
    from fastapi.responses import JSONResponse
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

    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        docs_url="/docs",
        redoc_url="/redoc"
    )

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
    GLOBAL_ERROR = traceback.format_exc()
    app = fallback_app

