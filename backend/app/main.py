import sys
import os
import traceback

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

startup_errors = []

try:
    from app.core.config import settings
    from app.database.session import engine
    from app.database.base import Base
    import app.models
except Exception as e:
    startup_errors.append(traceback.format_exc())

try:
    from slowapi import Limiter, _rate_limit_exceeded_handler
    from slowapi.util import get_remote_address
    from slowapi.errors import RateLimitExceeded
    from app.core.rate_limit import limiter
    
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
except Exception as e:
    startup_errors.append(traceback.format_exc())

try:
    from app.api.v1.router import api_router
    app.include_router(api_router, prefix="/api/v1")
except Exception as e:
    startup_errors.append(traceback.format_exc())

@app.get("/api/v1/health")
async def health_check():
    if startup_errors:
        return JSONResponse(status_code=500, content={"errors": startup_errors})
    return {"status": "healthy_and_no_errors"}

