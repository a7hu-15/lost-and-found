import os
import aiofiles
import httpx
from abc import ABC, abstractmethod
from app.core.config import settings

class StorageBackend(ABC):
    @abstractmethod
    async def save(self, filepath: str, data: bytes) -> str:
        """Saves data to a relative filepath and returns the public URL."""
        pass

class LocalStorage(StorageBackend):
    def __init__(self, base_dir: str = "uploads", base_url: str = "/static/uploads"):
        self.base_dir = os.path.join(os.getcwd(), base_dir)
        self.base_url = base_url
        os.makedirs(self.base_dir, exist_ok=True)

    async def save(self, filepath: str, data: bytes) -> str:
        full_path = os.path.join(self.base_dir, filepath)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        async with aiofiles.open(full_path, 'wb') as f:
            await f.write(data)
        return f"{self.base_url}/{filepath}"

class SupabaseStorage(StorageBackend):
    """
    Supabase Storage implementation using httpx for async uploads.
    """
    def __init__(self):
        self.url = settings.SUPABASE_URL
        self.key = settings.SUPABASE_KEY
        self.bucket = settings.SUPABASE_BUCKET

    async def save(self, filepath: str, data: bytes) -> str:
        if not self.url or not self.key:
            raise ValueError("Supabase credentials not configured")
            
        endpoint = f"{self.url.rstrip('/')}/storage/v1/object/{self.bucket}/{filepath}"
        headers = {
            "Authorization": f"Bearer {self.key}",
            "apikey": self.key,
            "Content-Type": "image/jpeg"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(endpoint, content=data, headers=headers)
            
            # If 400 or 409 (already exists), try PUT instead
            if response.status_code in (400, 409):
                response = await client.put(endpoint, content=data, headers=headers)
                
            response.raise_for_status()
            
        return f"{self.url.rstrip('/')}/storage/v1/object/public/{self.bucket}/{filepath}"

def get_storage_backend() -> StorageBackend:
    if getattr(settings, "USE_CLOUD_STORAGE", False):
        return SupabaseStorage()
    return LocalStorage()
