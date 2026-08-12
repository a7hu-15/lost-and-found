"""
Storage backend abstraction for Cloud Lost & Found.

STORAGE_TYPE=local  → files saved to local filesystem (Docker Compose, development)
STORAGE_TYPE=s3     → files saved to S3-compatible storage (MinIO in K8s, S3 in AWS)

The upload endpoints in lost.py / found.py call get_storage_backend() once at module
load and then call backend.save(file_bytes, filename) → returns the public URL.

Docker Compose is completely unaffected: STORAGE_TYPE defaults to "local".
"""

from __future__ import annotations

import os
import uuid
from abc import ABC, abstractmethod
from datetime import datetime
from pathlib import Path
from typing import Optional

from app.core.config import settings


class StorageBackend(ABC):
    """Abstract base class for all storage backends."""

    @abstractmethod
    async def save(self, file_bytes: bytes, original_filename: str) -> str:
        """
        Persist file_bytes and return the public URL or relative path
        that should be stored in the database.
        """
        ...

    @abstractmethod
    async def delete(self, path_or_url: str) -> None:
        """Remove a file given its stored path or URL."""
        ...


class LocalStorage(StorageBackend):
    """
    Saves files to UPLOAD_DIR on the local filesystem.
    This is the default when STORAGE_TYPE=local (Docker Compose / dev).
    Returns a relative URL like /static/uploads/2026/08/<uuid>_thumb.webp
    """

    def __init__(self) -> None:
        self.base_dir = Path(settings.UPLOAD_DIR)

    async def save(self, file_bytes: bytes, original_filename: str) -> str:
        # Organise by year/month
        date_path = datetime.utcnow().strftime("%Y/%m")
        dest_dir = self.base_dir / date_path
        dest_dir.mkdir(parents=True, exist_ok=True)

        ext = Path(original_filename).suffix or ".bin"
        filename = f"{uuid.uuid4().hex}{ext}"
        dest = dest_dir / filename
        dest.write_bytes(file_bytes)

        return f"/static/uploads/{date_path}/{filename}"

    async def delete(self, path_or_url: str) -> None:
        # Strip leading /static/uploads/
        relative = path_or_url.removeprefix("/static/uploads/")
        target = self.base_dir / relative
        if target.exists():
            target.unlink()


class S3Storage(StorageBackend):
    """
    Saves files to an S3-compatible bucket (MinIO in K8s, AWS S3 in cloud).
    Activated when STORAGE_TYPE=s3.
    Returns a public URL: <S3_ENDPOINT>/<S3_BUCKET>/<date>/<filename>
    """

    def __init__(self) -> None:
        import boto3
        from botocore.config import Config

        self.bucket = settings.S3_BUCKET
        self.endpoint = settings.S3_ENDPOINT  # e.g. http://cloudfind-minio:9000

        self.client = boto3.client(
            "s3",
            endpoint_url=self.endpoint,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
            region_name=settings.S3_REGION,
            config=Config(signature_version="s3v4"),
        )

    async def save(self, file_bytes: bytes, original_filename: str) -> str:
        import asyncio
        import io

        date_path = datetime.utcnow().strftime("%Y/%m")
        ext = Path(original_filename).suffix or ".bin"
        key = f"{date_path}/{uuid.uuid4().hex}{ext}"

        content_type = self._guess_content_type(ext)

        # Ensure bucket exists before uploading
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self._ensure_bucket_exists)

        # boto3 is synchronous — run in thread pool so we don't block the event loop
        await loop.run_in_executor(
            None,
            lambda: self.client.put_object(
                Bucket=self.bucket,
                Key=key,
                Body=io.BytesIO(file_bytes),
                ContentType=content_type,
            ),
        )

        # Return public URL
        return f"{self.endpoint}/{self.bucket}/{key}"

    async def delete(self, path_or_url: str) -> None:
        import asyncio

        # Extract the key from the full URL
        prefix = f"{self.endpoint}/{self.bucket}/"
        key = path_or_url.removeprefix(prefix)

        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None,
            lambda: self.client.delete_object(Bucket=self.bucket, Key=key),
        )

    def _ensure_bucket_exists(self) -> None:
        try:
            self.client.head_bucket(Bucket=self.bucket)
        except Exception:
            try:
                self.client.create_bucket(Bucket=self.bucket)
            except Exception as e:
                print(f"Warning creating bucket {self.bucket}: {e}")

    @staticmethod
    def _guess_content_type(ext: str) -> str:
        mapping = {
            ".webp": "image/webp",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".gif": "image/gif",
        }
        return mapping.get(ext.lower(), "application/octet-stream")


# ---------------------------------------------------------------------------
# Factory — returns the right backend based on STORAGE_TYPE env var
# ---------------------------------------------------------------------------

_backend: Optional[StorageBackend] = None


def get_storage_backend() -> StorageBackend:
    """
    Returns a singleton StorageBackend. Call once at application startup or
    lazily on the first upload request.
    """
    global _backend
    if _backend is None:
        if settings.STORAGE_TYPE == "s3":
            _backend = S3Storage()
        else:
            _backend = LocalStorage()
    return _backend
