from fastapi import APIRouter
from app.api.v1 import auth, lost_items, found_items, search, matches, claims, admin, analytics, track, support

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(lost_items.router, prefix="/lost", tags=["Lost Items"])
api_router.include_router(found_items.router, prefix="/found", tags=["Found Items"])
api_router.include_router(search.router, prefix="/search", tags=["Search"])
api_router.include_router(matches.router, prefix="/matches", tags=["Matching Engine"])
api_router.include_router(claims.router, prefix="/claims", tags=["Claims & Verification"])
api_router.include_router(track.router, prefix="/track", tags=["Report Tracking"])
api_router.include_router(support.router, prefix="/support", tags=["Support"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin & Audit"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
