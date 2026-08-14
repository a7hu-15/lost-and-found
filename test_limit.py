import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))
os.environ["TESTING"] = "true"
from app.core.rate_limit import LIMIT_CREATE
print("LIMIT_CREATE:", LIMIT_CREATE)
