import asyncio
import time
from sqlalchemy import select
from app.database.session import async_session
from app.models.lost_item import LostItem, ItemStatus

async def main():
    start = time.time()
    async with async_session() as db:
        res = await db.execute(select(LostItem).where(LostItem.status == ItemStatus.REPORTED))
        items = res.scalars().all()
        print(f"Fetched {len(items)} items in {time.time() - start:.2f}s")

asyncio.run(main())
