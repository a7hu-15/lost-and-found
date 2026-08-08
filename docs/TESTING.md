# 🧪 Lost & Found — Comprehensive Testing & Quality Assurance Plan

> Pre-deployment Quality Assurance (QA), Security, and Validation Matrix for SRM Campus Item Recovery Platform.

---

## 📌 Testing Strategy & Workflow

```text
               LOST & FOUND QA SUITE
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
1. Functional Smoke Tests        2. Form Validation Tests
        │                                 │
        ▼                                 ▼
3. Tokenized Tracking Security   4. Email Recovery Workflow
        │                                 │
        ▼                                 ▼
5. Matching Engine Similarity    6. Ownership Claim & Security
        │                                 │
        ▼                                 ▼
7. Security & Injection Tests    8. Support System Integration
        │                                 │
        └────────────────┬────────────────┘
                         ▼
             9. Pre-Deployment Freeze
```

---

## 📋 Comprehensive Test Cases (TC-001 to TC-020)

| ID | Category | Description | Input / Trigger | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-001** | Frontend | Homepage Navigation & Smoke | Open `/` | Renders hero, 3 journey cards, Search, How It Works, and Footer cleanly without console errors. | ✅ **PASS** |
| **TC-002** | Frontend | Light/Dark Theme Switcher | Click Navbar Sun/Moon toggle | Theme switches instantly without page reload; choice persists in `localStorage` across routes. | ✅ **PASS** |
| **TC-003** | Workflow | Valid Lost Item Submission | Title, Category, Location, Date, Email, Image | Creates record in DB, generates Report ID (`LF-SRM-26-XXXXXX`) and 32-char access token. | ✅ **PASS** |
| **TC-004** | Validation | Empty Required Fields | Submit report with missing location/title | Form blocks submission with inline validation messaging; 0 DB records created. | ✅ **PASS** |
| **TC-005** | Validation | Invalid Email Format | Input `not-an-email` | Frontend & FastAPI Pydantic schema return HTTP 422 Unprocessable Entity. | ✅ **PASS** |
| **TC-006** | Image | EXIF Stripping & WebP Conversion | Upload 8MB JPEG with GPS EXIF metadata | Strips GPS EXIF tags, compresses to WebP, generates 300px thumbnail securely in `/static/uploads`. | ✅ **PASS** |
| **TC-007** | Image | Non-Image File Rejection | Upload `malicious.exe` or `document.pdf` | Rejects file upload with friendly validation error: *"Only image files (JPG, PNG, WebP) allowed"*. | ✅ **PASS** |
| **TC-008** | Workflow | Valid Found Item Submission | Title, Location, Date, Storage Desk, Email | Saves found item record; assigns campus holding desk location (Gate 1 Security). | ✅ **PASS** |
| **TC-009** | Engine | Vector Weighted Match Engine | Matching Lost & Found items (Category, Location, Color) | Triggers similarity scoring engine; links items with confidence score (e.g. 95% Match). | ✅ **PASS** |
| **TC-010** | Security | Tokenized Tracking Authorization | `/track/{id}?token={valid_token}` | Displays private contact info, status timeline, and matched items. | ✅ **PASS** |
| **TC-011** | Security | Tokenized Tracking Rejection | `/track/{id}?token=invalid_token` | Rejects request with HTTP 403 Forbidden; conceals user contact details. | ✅ **PASS** |
| **TC-012** | Recovery | Email Report Recovery | Enter email on `/recover` | Dispatches email receipt containing active Report IDs and secure tracking links. | ✅ **PASS** |
| **TC-013** | Recovery | Unknown Email Protection | Enter unregistered email on `/recover` | Returns generic success message (*"If an active report exists..."*) without leaking email registration status. | ✅ **PASS** |
| **TC-014** | Claim | Ownership Proof Verification | Submit verification answers (inside contents) | Moves status to `CLAIMED` and places claim into Security Staff review queue (`/admin`). | ✅ **PASS** |
| **TC-015** | Admin | Admin Queue RBAC Protection | Access `/admin` without JWT login token | Rejects unauthorized access with HTTP 401 Unauthorized / HTTP 403 Forbidden. | ✅ **PASS** |
| **TC-016** | Admin | Claim Approval Handover | Admin approves claim in `/admin` | Status updates to `RETURNED`; dispatches email to claimant with pickup instructions for Gate 1. | ✅ **PASS** |
| **TC-017** | Support | Contact Support Ticket | POST `/api/v1/support` (Name, Email, Subject, Msg) | Dispatches ticket notification to `SUPPORT_EMAIL` and logs audit entry. | ✅ **PASS** |
| **TC-018** | Security | XSS Payload Sanitization | `<script>alert('XSS')</script>` in title/message | Rendered strictly as escaped plain text string; zero JavaScript code execution. | ✅ **PASS** |
| **TC-019** | Security | SQL Injection Protection | `' OR '1'='1` in search query | Processed safely via SQLAlchemy 2.0 parameterized ORM queries; 0 data leaks. | ✅ **PASS** |
| **TC-020** | Responsive | Mobile & Tablet Layout | View on 375px (iPhone) and 768px (iPad) | Responsive navbar, stacked cards, full touch target accessibility without horizontal overflow. | ✅ **PASS** |

---

## 🔒 Pre-Deployment Code Freeze Verification

- **Branch**: `testing/pre-deployment`
- **Frontend Production Build**: `npm run build` $\rightarrow$ **1.32s Clean Build**
- **FastAPI Router Registry**: All endpoints registered cleanly under `/api/v1/`
