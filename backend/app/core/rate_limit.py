from slowapi import Limiter
from slowapi.util import get_remote_address
import os
import time
import httpx
from limits.storage import Storage
from app.core.config import settings

is_testing = os.getenv("TESTING") == "true"

LIMIT_LOGIN = "10/minute"
LIMIT_CREATE = "5/minute"
LIMIT_SENSITIVE = "3/minute"

class UpstashRestStorage(Storage):
    STORAGE_SCHEME = ["upstash"]
    
    def __init__(self, uri: str, **options):
        super().__init__(uri, **options)
        self.url = settings.UPSTASH_REDIS_REST_URL
        self.token = settings.UPSTASH_REDIS_REST_TOKEN
        if self.url and not self.url.startswith("http"):
            self.url = "https://" + self.url

    @property
    def base_exceptions(self):
        return httpx.RequestError
            
    def incr(self, key: str, expiry: int, elastic_expiry: bool = False) -> int:
        if not self.url or not self.token:
            return 1
        with httpx.Client() as client:
            resp = client.get(
                f"{self.url}/incr/{key}", 
                headers={"Authorization": f"Bearer {self.token}"}
            )
            val = resp.json().get("result", 1)
            if val == 1:
                client.get(
                    f"{self.url}/expire/{key}/{expiry}", 
                    headers={"Authorization": f"Bearer {self.token}"}
                )
            return val

    def get(self, key: str) -> int:
        if not self.url or not self.token:
            return 0
        with httpx.Client() as client:
            resp = client.get(
                f"{self.url}/get/{key}", 
                headers={"Authorization": f"Bearer {self.token}"}
            )
            res = resp.json().get("result")
            return int(res) if res else 0

    def get_expiry(self, key: str) -> int:
        if not self.url or not self.token:
            return int(time.time())
        with httpx.Client() as client:
            resp = client.get(
                f"{self.url}/ttl/{key}", 
                headers={"Authorization": f"Bearer {self.token}"}
            )
            res = resp.json().get("result", -1)
            return int(time.time() + res) if res > 0 else int(time.time())

    def check(self) -> bool:
        return True

    def reset(self) -> int:
        return 0

    def clear(self, key: str) -> None:
        if not self.url or not self.token:
            return
        with httpx.Client() as client:
            client.get(
                f"{self.url}/del/{key}", 
                headers={"Authorization": f"Bearer {self.token}"}
            )

limiter_kwargs = {
    "key_func": get_remote_address,
    "default_limits": ["10000/minute"] if is_testing else ["100/minute"],
    "enabled": not is_testing
}

if not is_testing and settings.UPSTASH_REDIS_REST_URL:
    limiter_kwargs["storage_uri"] = "upstash://"

limiter = Limiter(**limiter_kwargs)

if is_testing:
    def mock_limit(*args, **kwargs):
        def decorator(func):
            return func
        return decorator
    limiter.limit = mock_limit
