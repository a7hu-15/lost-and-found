from slowapi import Limiter
from slowapi.util import get_remote_address
import os
from app.core.config import settings

is_testing = os.getenv("TESTING") == "true"

LIMIT_LOGIN = "10/minute"
LIMIT_CREATE = "5/minute"
LIMIT_SENSITIVE = "3/minute"

# In serverless environments, in-memory limits are isolated per function instance.
# We must use Redis to share the rate limit state across all instances.
limiter_kwargs = {
    "key_func": get_remote_address,
    "default_limits": ["10000/minute"] if is_testing else ["100/minute"],
    "enabled": not is_testing
}

if not is_testing and not settings.REDIS_URL.startswith("redis://localhost"):
    limiter_kwargs["storage_uri"] = settings.REDIS_URL

limiter = Limiter(**limiter_kwargs)

if is_testing:
    def mock_limit(*args, **kwargs):
        def decorator(func):
            return func
        return decorator
    limiter.limit = mock_limit

