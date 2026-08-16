import sys
import os
import traceback

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

@app.get("/api/v1/test_include")
def test_include():
    try:
        from app.api.v1.router import api_router
        app.include_router(api_router, prefix="/api/v1")
        return {"status": "success", "message": "Router included"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e), "trace": traceback.format_exc()})

@app.get("/api/v1/health")
def health():
    return {"status": "importer_ready"}
