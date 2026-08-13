import os
import aiofiles
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

class CloudStorage(StorageBackend):
    """
    Placeholder for Hosted Object Storage (e.g. S3, Cloudinary).
    Will be fully implemented when a provider is selected.
    """
    async def save(self, filepath: str, data: bytes) -> str:
        # Implementation depends on the provider (boto3, cloudinary SDK, etc)
        # For now, falls back to local or raises NotImplementedError
        raise NotImplementedError("CloudStorage provider not configured yet")

def get_storage_backend() -> StorageBackend:
    if getattr(settings, "USE_CLOUD_STORAGE", False):
        return CloudStorage()
    return LocalStorage()
