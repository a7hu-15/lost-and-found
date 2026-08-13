from slowapi import Limiter
from slowapi.util import get_remote_address
import os

is_testing = os.getenv("TESTING") == "true"

LIMIT_LOGIN = "10/minute"
LIMIT_CREATE = "5/minute"
LIMIT_SENSITIVE = "3/minute"

limiter = Limiter(
    key_func=get_remote_address, 
    default_limits=["10000/minute"] if is_testing else ["100/minute"],
    enabled=not is_testing
)

if is_testing:
    def mock_limit(*args, **kwargs):
        def decorator(func):
            return func
        return decorator
    limiter.limit = mock_limit

