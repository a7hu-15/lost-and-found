import sys
import os
import asyncio

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))
from app.database.session import engine
from app.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.security.passwords import verify_password

async def test():
    async with AsyncSession(engine) as session:
        result = await session.execute(select(User).where(User.email == "test@admin.edu"))
        user = result.scalar_one_or_none()
        if not user:
            print("User not found!")
            return
        
        valid = verify_password("Password123!", user.hashed_password)
        print(f"Password123! valid? {valid}")

asyncio.run(test())
