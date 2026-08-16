from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"])
async def catch_all(path: str):
    return JSONResponse(status_code=200, content={"status": "basic_app_works", "path": path})

