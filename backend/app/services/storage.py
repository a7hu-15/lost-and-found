import os
import aiofiles
import httpx
import cloudinary
import cloudinary.uploader
import cloudinary.api
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

class CloudinaryStorage(StorageBackend):
    """
    Cloudinary Storage implementation using the official cloudinary package.
    """
    def __init__(self):
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True
        )

    async def save(self, filepath: str, data: bytes) -> str:
        if not settings.CLOUDINARY_CLOUD_NAME or not settings.CLOUDINARY_API_KEY:
            raise ValueError("Cloudinary credentials not configured")
            
        import tempfile
        import asyncio
        
        # We write to a temporary file since cloudinary python library 
        # doesn't have an async byte upload out of the box that's non-blocking,
        # but we can wrap the sync call in run_in_executor or just use standard sync for this demo,
        # but wait, cloudinary uploader accepts a file-like object or bytes!
        
        loop = asyncio.get_event_loop()
        def _upload():
            response = cloudinary.uploader.upload(
                data,
                public_id=filepath.split('.')[0], # Cloudinary doesn't need the extension
                resource_type="image"
            )
            return response.get("secure_url")
            
        secure_url = await loop.run_in_executor(None, _upload)
        return secure_url

def get_storage_backend() -> StorageBackend:
    if getattr(settings, "USE_CLOUD_STORAGE", False):
        return CloudinaryStorage()
    return LocalStorage()
