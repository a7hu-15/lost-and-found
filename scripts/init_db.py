import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app.database.session import engine
from app.database.base import Base
import app.models

from app.security.passwords import get_password_hash
from app.models.user import User, UserRole

async def init():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
        
    # Seed users for security testing
    from sqlalchemy.ext.asyncio import AsyncSession
    async with AsyncSession(engine) as session:
        admin_email = os.getenv("E2E_TEST_ADMIN_EMAIL", "admin@cloudfind.com")
        admin_password = os.getenv("E2E_TEST_ADMIN_PASSWORD", "securepassword123")
        admin_user = User(
            email=admin_email,
            full_name="Admin User",
            hashed_password=get_password_hash(admin_password),
            role=UserRole.ADMIN_OWNER,
            is_verified=True,
            is_active=True
        )
        student_user = User(
            email="test@student.edu",
            full_name="Student User",
            hashed_password=get_password_hash("Password123!"),
            role=UserRole.USER,
            is_verified=True,
            is_active=True
        )
        session.add(admin_user)
        session.add(student_user)
        await session.commit()

if __name__ == '__main__':
    asyncio.run(init())
    print("Database initialized")
