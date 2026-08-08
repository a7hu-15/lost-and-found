from typing import List, Union
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.session import get_db
from app.security.jwt import decode_token
from app.models.user import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_token(token)
    if payload is None or payload.get("type") != "access":
        raise credentials_exception
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if user is None or not user.is_active:
        raise credentials_exception
    
    return user

async def require_admin_owner(current_user: User = Depends(get_current_user)) -> User:
    """
    Enforces that only ADMIN_OWNER (platform owner) can perform the operation.
    """
    if current_user.role != UserRole.ADMIN_OWNER and current_user.role != "ADMIN_OWNER" and current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted: Operation requires ADMIN_OWNER privileges."
        )
    return current_user

def require_permission(perm_key: str):
    """
    Enforces server-side granular permissions check for ADMIN_STAFF and ADMIN_OWNER.
    ADMIN_OWNER automatically has all permissions.
    """
    def permission_checker(current_user: User = Depends(get_current_user)) -> User:
        role_val = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)
        
        # ADMIN_OWNER has superuser access
        if role_val in ("ADMIN_OWNER", "ADMIN"):
            return current_user
        
        # ADMIN_STAFF checks specific permission flag
        if role_val in ("ADMIN_STAFF", "SECURITY_STAFF"):
            perms = current_user.permissions or {}
            if perms.get(perm_key, False):
                return current_user

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied: Missing required administrative permission '{perm_key}'."
        )
    return permission_checker

async def require_any_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Allows any active administrative user (ADMIN_OWNER or ADMIN_STAFF).
    """
    role_val = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)
    if role_val not in ("ADMIN_OWNER", "ADMIN_STAFF", "ADMIN", "SECURITY_STAFF"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted: Administrative credentials required."
        )
    return current_user

def require_roles(allowed_roles: List[Union[UserRole, str]]):
    def role_checker(current_user: User = Depends(get_current_user)):
        role_val = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)
        allowed_str = [r.value if hasattr(r, 'value') else str(r) for r in allowed_roles]
        
        # Backward compatibility checks
        if "ADMIN" in allowed_str:
            allowed_str.extend(["ADMIN_OWNER", "ADMIN_STAFF"])
        if "SECURITY_STAFF" in allowed_str:
            allowed_str.append("ADMIN_STAFF")

        if role_val not in allowed_str:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User role '{role_val}' is not authorized for this operation."
            )
        return current_user
    return role_checker
