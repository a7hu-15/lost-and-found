import sys
import os
import traceback

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

@app.get("/api/v1/test_import")
def test_import(module_name: str):
    import importlib
    try:
        importlib.import_module(module_name)
        return {"status": "success", "module": module_name}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e), "trace": traceback.format_exc()})

@app.get("/api/v1/health")
def health():
    return {"status": "importer_ready"}
