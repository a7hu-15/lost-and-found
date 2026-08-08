import pyotp
import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.models.user import User, UserRole, DEFAULT_PERMISSIONS
from app.models.staff_invitation import StaffInvitation
from app.models.password_reset import PasswordResetToken
from app.models.audit import AuditLog
from app.schemas.auth import (
    UserRegister, UserLogin, Token, UserOut,
    ForgotPasswordRequest, ResetPasswordRequest,
    AcceptInvitationRequest, ChangePasswordRequest,
    MFALoginRequest, MFASetupResponse, MFAEnableRequest
)
from app.security.passwords import get_password_hash, verify_password
from app.security.jwt import create_access_token, create_refresh_token, decode_token
from app.security.dependencies import get_current_user
from app.notifications.service import send_password_reset_email

router = APIRouter()

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserRegister, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
    
    hashed_pwd = get_password_hash(user_in.password)
    
    # Enforce USER role for all public self-registrations
    user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hashed_pwd,
        role=UserRole.USER,
        permissions={},
        is_active=True,
        is_verified=True
    )
    db.add(user)
    await db.flush()
    
    audit = AuditLog(
        user_id=user.id,
        action="USER_REGISTERED",
        resource="auth",
        details={"email": user.email, "role": "USER"}
    )
    db.add(audit)
    await db.commit()
    await db.refresh(user)
    return user

@router.post("/login", response_model=Token)
async def login(login_in: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == login_in.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account. Contact platform owner."
        )
    
    role_str = user.role.value if hasattr(user.role, 'value') else str(user.role)

    # Check 2FA MFA requirement
    if user.mfa_enabled and user.mfa_secret:
        mfa_token = create_access_token(
            subject=user.id,
            role=role_str,
            expires_delta=timedelta(minutes=5)
        )
        return Token(
            access_token="",
            refresh_token="",
            mfa_required=True,
            mfa_token=mfa_token
        )

    access_token = create_access_token(subject=user.id, role=role_str)
    refresh_token = create_refresh_token(subject=user.id, role=role_str)
    
    audit = AuditLog(
        user_id=user.id,
        action="USER_LOGIN",
        resource="auth",
        details={"email": user.email, "role": role_str}
    )
    db.add(audit)
    await db.commit()

    return Token(access_token=access_token, refresh_token=refresh_token)

@router.post("/login/mfa", response_model=Token)
async def login_mfa(mfa_in: MFALoginRequest, db: AsyncSession = Depends(get_db)):
    payload = decode_token(mfa_in.mfa_token)
    if not payload or not payload.get("sub"):
        raise HTTPException(status_code=401, detail="Invalid or expired MFA session challenge.")

    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user or not user.is_active or not user.mfa_secret:
        raise HTTPException(status_code=401, detail="MFA challenge failed.")

    totp = pyotp.TOTP(user.mfa_secret)
    if not totp.verify(mfa_in.code):
        raise HTTPException(status_code=401, detail="Invalid 2FA authenticator code.")

    role_str = user.role.value if hasattr(user.role, 'value') else str(user.role)
    access_token = create_access_token(subject=user.id, role=role_str)
    refresh_token = create_refresh_token(subject=user.id, role=role_str)

    audit = AuditLog(
        user_id=user.id,
        action="USER_LOGIN_MFA_SUCCESS",
        resource="auth",
        details={"email": user.email}
    )
    db.add(audit)
    await db.commit()

    return Token(access_token=access_token, refresh_token=refresh_token)

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email.lower().strip()))
    user = result.scalar_one_or_none()

    if user and user.is_active:
        token_str = secrets.token_urlsafe(32)
        reset_entry = PasswordResetToken(
            user_id=user.id,
            email=user.email,
            token=token_str,
            expires_at=datetime.utcnow() + timedelta(hours=2)
        )
        db.add(reset_entry)

        audit = AuditLog(
            user_id=user.id,
            action="PASSWORD_RESET_REQUESTED",
            resource="auth",
            details={"email": user.email}
        )
        db.add(audit)
        await db.commit()

        send_password_reset_email(user.email, token_str)

    # Privacy preservation: generic message regardless of email existence
    return {
        "message": "If an active account exists for this email address, password reset instructions have been dispatched."
    }

@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PasswordResetToken).where(PasswordResetToken.token == req.token))
    reset_entry = result.scalar_one_or_none()

    if not reset_entry or reset_entry.is_used or reset_entry.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid, expired, or previously used password reset link.")

    user_res = await db.execute(select(User).where(User.id == reset_entry.user_id))
    user = user_res.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    user.hashed_password = get_password_hash(req.new_password)
    user.updated_at = datetime.utcnow()
    reset_entry.is_used = True

    audit = AuditLog(
        user_id=user.id,
        action="PASSWORD_RESET_COMPLETED",
        resource="auth",
        details={"email": user.email}
    )
    db.add(audit)
    await db.commit()

    return {"message": "Password successfully reset. You may now log in with your new credentials."}

@router.post("/accept-invite", response_model=UserOut)
async def accept_staff_invitation(req: AcceptInvitationRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(StaffInvitation).where(StaffInvitation.token == req.token))
    invite = result.scalar_one_or_none()

    if not invite or invite.is_used or invite.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid, expired, or previously used staff invitation link.")

    # Check if user already exists
    existing = (await db.execute(select(User).where(User.email == invite.email))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="User account with this email address already exists.")

    hashed_pwd = get_password_hash(req.password)
    user = User(
        email=invite.email,
        full_name=invite.full_name,
        hashed_password=hashed_pwd,
        role=UserRole.ADMIN_STAFF,
        permissions=invite.permissions or DEFAULT_PERMISSIONS,
        is_active=True,
        is_verified=True
    )
    db.add(user)
    invite.is_used = True

    audit = AuditLog(
        action="STAFF_INVITATION_ACCEPTED",
        resource="auth",
        details={"email": user.email, "role": "ADMIN_STAFF", "permissions": user.permissions}
    )
    db.add(audit)
    await db.commit()
    await db.refresh(user)

    return user

@router.post("/change-password")
async def change_password(
    req: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not verify_password(req.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password.")

    current_user.hashed_password = get_password_hash(req.new_password)
    current_user.updated_at = datetime.utcnow()

    audit = AuditLog(
        user_id=current_user.id,
        action="USER_CHANGE_PASSWORD",
        resource="auth",
        details={"email": current_user.email}
    )
    db.add(audit)
    await db.commit()

    return {"message": "Password successfully updated."}

@router.post("/mfa/setup", response_model=MFASetupResponse)
async def setup_mfa(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    secret = pyotp.random_base32()
    totp = pyotp.TOTP(secret)
    qr_uri = totp.provisioning_uri(name=current_user.email, issuer_name="Campus Lost & Found")

    current_user.mfa_secret = secret
    await db.commit()

    return MFASetupResponse(secret=secret, qr_uri=qr_uri)

@router.post("/mfa/enable")
async def enable_mfa(
    req: MFAEnableRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not current_user.mfa_secret:
        raise HTTPException(status_code=400, detail="MFA setup not initialized. Run setup first.")

    totp = pyotp.TOTP(current_user.mfa_secret)
    if not totp.verify(req.code):
        raise HTTPException(status_code=400, detail="Invalid authenticator code verification.")

    current_user.mfa_enabled = True

    audit = AuditLog(
        user_id=current_user.id,
        action="MFA_ENABLED",
        resource="auth",
        details={"email": current_user.email}
    )
    db.add(audit)
    await db.commit()

    return {"message": "MFA 2FA authentication successfully enabled for your account."}

@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
