import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app

async def run():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {
            "item_name": "QA Test Blue Wildcraft Backpack",
            "location": "Central Library 2nd Floor",
            "found_date": "2026-08-08",
            "storage_location": "Security Office Desk 1",
            "description": "Blue Wildcraft backpack found near quiet reading zone",
            "email": "qa.finder@srm.edu"
        }
        with open("../dummy.png", "rb") as f:
            files = {"file": ("dummy.png", f, "image/png")}
            response = await ac.post("/api/v1/found/create", data=payload, files=files)
        print("STATUS:", response.status_code)
        print("JSON:", response.json())

if __name__ == "__main__":
    asyncio.run(run())
