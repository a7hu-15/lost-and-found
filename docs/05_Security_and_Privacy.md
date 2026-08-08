# Document 5: Security & Privacy Specification

## 🛡️ Threat Model & Defense Strategy

### 1. Trusted Middleman Privacy Model
- **Zero Public Contact Details**: Visitors entering lost/found reports provide `contact_email` and `contact_phone`. These are strictly stored in private database columns and are **never rendered in public API endpoints or frontend components**.
- **Anonymous Messaging**: Communication occurs exclusively via system-brokered notification emails.

### 2. Rate Limiting & Anti-Spam
- **SlowAPI Rate Limiter**: Configured at `100 requests / minute` per IP address across backend API routes.
- **Nginx Burst Limiting**: Configured with `limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;`.

### 3. Password Hashing & Authentication
- **Argon2 & Bcrypt**: Password hashing implemented in `passlib.context.CryptContext`.
- **JWT Access & Refresh Tokens**: Cryptographically signed access tokens with short-lived expiration for Security Staff / Admin authentication.

### 4. Input Validation & SQL Injection Defense
- **Pydantic v2**: Strict schema parsing and data coercion.
- **SQLAlchemy 2.0 ORM**: 100% parameterized queries eliminating raw SQL string concatenation.

### 5. Security Headers
Configured in Nginx reverse proxy:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```
