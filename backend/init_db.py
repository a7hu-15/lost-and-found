import asyncio
from app.database.session import engine
from app.database.base import Base
import app.models

import os
from sqlalchemy.orm import sessionmaker
from app.security.passwords import get_password_hash

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    admin_email = os.getenv("E2E_TEST_ADMIN_EMAIL")
    admin_password = os.getenv("E2E_TEST_ADMIN_PASSWORD")
    if admin_email and admin_password:
        from app.database.session import AsyncSessionLocal
        async with AsyncSessionLocal() as session:
            from sqlalchemy.future import select
            result = await session.execute(select(app.models.User).where(app.models.User.email == admin_email))
            if not result.scalars().first():
                admin_user = app.models.User(
                    email=admin_email,
                    hashed_password=get_password_hash(admin_password),
                    is_active=True,
                    is_superuser=True
                )
                session.add(admin_user)
                await session.commit()

if __name__ == "__main__":
    asyncio.run(init_db())
