from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except ValueError:
        return False

def get_password_hash(password: str) -> str:
    if len(password.encode('utf-8')) > 72:
        raise ValueError("Password is too long.")
    return pwd_context.hash(password)
