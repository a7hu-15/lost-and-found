import traceback
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

try:
    from app.main import app
except Exception as e:
    err = traceback.format_exc()
    app = FastAPI()
    
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    async def catch_all(request: Request, path: str):
        return JSONResponse(status_code=200, content={"detail": "Outer Startup Error", "error": err})
