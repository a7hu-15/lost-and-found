from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime
from app.models.user import UserRole

class UserRegister(BaseModel):
    email: EmailStr
    full_name: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    mfa_required: bool = False
    mfa_token: Optional[str] = None

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None

class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: UserRole
    permissions: Dict[str, bool] = {}
    mfa_enabled: bool = False
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class AcceptInvitationRequest(BaseModel):
    token: str
    password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class MFALoginRequest(BaseModel):
    mfa_token: str
    code: str

class MFASetupResponse(BaseModel):
    secret: str
    qr_uri: str

class MFAEnableRequest(BaseModel):
    code: str
