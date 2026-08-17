import os
import aiofiles
import httpx
import cloudinary
import cloudinary.uploader
import cloudinary.api
from abc import ABC, abstractmethod
from typing import Tuple
from app.core.config import settings

class StorageBackend(ABC):
    @abstractmethod
    async def delete(self, public_url: str):
        pass

    @abstractmethod
    async def delete(self, public_url: str):
        if not public_url.startswith(self.base_url): return
        rel_path = public_url[len(self.base_url):].lstrip("/")
        full_path = os.path.join(self.base_dir, rel_path)
        if os.path.exists(full_path):
            os.remove(full_path)
            
    @abstractmethod
    async def save(self, filepath: str, data: bytes) -> Tuple[str, bool, str]:
        """Saves data and returns (public_url, is_flagged, moderation_result)."""
        pass

class LocalStorage(StorageBackend):
    def __init__(self, base_dir: str = "uploads", base_url: str = "/static/uploads"):
        self.base_dir = os.path.join(os.getcwd(), base_dir)
        self.base_url = base_url
        os.makedirs(self.base_dir, exist_ok=True)

    async def delete(self, public_url: str):
        pass

    async def save(self, filepath: str, data: bytes) -> Tuple[str, bool, str]:
        full_path = os.path.join(self.base_dir, filepath)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        async with aiofiles.open(full_path, 'wb') as f:
            await f.write(data)
        return f"{self.base_url}/{filepath}", False, "NOT_APPLICABLE"

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

    async def delete(self, public_url: str):
        if not public_url: return
        import asyncio
        loop = asyncio.get_event_loop()
        def _del():
            try:
                # Extract public_id from URL
                parts = public_url.split("/")
                public_id = "/".join(parts[-3:]).split(".")[0]
                cloudinary.uploader.destroy(public_id)
            except Exception: pass
        await loop.run_in_executor(None, _del)
        
    async def save(self, filepath: str, data: bytes) -> Tuple[str, bool, str]:
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
            # Apply moderation (defaulting to aws_rek per standard Cloudinary setup)
            response = cloudinary.uploader.upload(
                data,
                public_id=filepath.split('.')[0], # Cloudinary doesn't need the extension
                resource_type="image",
                moderation="aws_rek"
            )
            # Example response structure for aws_rek moderation:
            # {"moderation": [{"status": "approved" | "rejected" | "pending", "kind": "aws_rek", ...}]}
            is_flagged = False
            moderation_status = "APPROVED"
            
            mod_data = response.get("moderation", [])
            if mod_data and isinstance(mod_data, list):
                status = mod_data[0].get("status", "").lower()
                if status in ["rejected", "pending"]:
                    is_flagged = True
                    moderation_status = status.upper()

            return response.get("secure_url"), is_flagged, moderation_status
            
        secure_url, is_flagged, moderation_status = await loop.run_in_executor(None, _upload)
        return secure_url, is_flagged, moderation_status

def get_storage_backend() -> StorageBackend:
    if getattr(settings, "USE_CLOUD_STORAGE", False):
        return CloudinaryStorage()
    return LocalStorage()
