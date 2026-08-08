# Document 2: Software Design Document (SDD)

## 📌 Architecture & System Topology

```
                                Client Browsers
                                       │
                               Nginx Proxy (80/443)
                                       │
       ┌───────────────────────────────┴───────────────────────────────┐
       │                                                               │
   Frontend (Vite / React TS)                               FastAPI Backend (8000)
   - Account-Free Visitor Forms                            - Auth Service (JWT + Argon2)
   - Tokenized Report Dashboard                            - Lost / Found Item Routers
   - Smart Match Visualizer                                - Vector Matching Engine
   - Claim Verification UI                                 - Notification Dispatcher
   - Admin Control Center                                  - Track & Lookup Service
       │                                                               │
       └───────────────────────────────┬───────────────────────────────┘
                                       │
       ┌───────────────────────────────┼───────────────────────────────┐
       │                               │                               │
  PostgreSQL (5432)               Redis (6379)                    Storage
  - LostItems / FoundItems        - Rate Limit Counters           - Media Uploads
  - MatchScores / Claims          - Session Cache
  - AuditLogs / Users
```

---

## 💾 Database Schema Design

### `lost_items` Table
- `id`: VARCHAR(36) PRIMARY KEY
- `report_id`: VARCHAR(20) UNIQUE INDEX (e.g. `LF-2026-00182`)
- `access_token`: VARCHAR(64) INDEX (Secure random token)
- `title`: VARCHAR(255)
- `category`: VARCHAR(100) INDEX
- `brand`: VARCHAR(100)
- `color`: VARCHAR(50)
- `location`: VARCHAR(255) INDEX
- `lost_date`: DATE
- `description`: TEXT
- `contact_email`: VARCHAR(255) (Encrypted/Private)
- `contact_phone`: VARCHAR(50) (Private)
- `status`: ENUM (`REPORTED`, `MATCHED`, `CLAIMED`, `RETURNED`, `CLOSED`)
- `created_at`: TIMESTAMP

### `found_items` Table
- `id`: VARCHAR(36) PRIMARY KEY
- `report_id`: VARCHAR(20) UNIQUE INDEX
- `access_token`: VARCHAR(64) INDEX
- `title`: VARCHAR(255)
- `category`: VARCHAR(100) INDEX
- `brand`: VARCHAR(100)
- `color`: VARCHAR(50)
- `location`: VARCHAR(255) INDEX
- `found_date`: DATE
- `storage_location`: VARCHAR(255) (e.g., "Security Office Gate 1")
- `description`: TEXT
- `contact_email`: VARCHAR(255)
- `status`: ENUM (`REPORTED`, `MATCHED`, `CLAIMED`, `RETURNED`, `CLOSED`)
- `created_at`: TIMESTAMP

### `matches` Table
- `id`: VARCHAR(36) PRIMARY KEY
- `lost_item_id`: VARCHAR(36) FOREIGN KEY -> `lost_items.id`
- `found_item_id`: VARCHAR(36) FOREIGN KEY -> `found_items.id`
- `similarity_score`: FLOAT (0.0 to 100.0)
- `breakdown_json`: JSON (Parameter breakdown)
- `status`: ENUM (`PENDING`, `CONFIRMED`, `REJECTED`)

---

## ⚡ API Endpoint Specification

### Public Visitor Endpoints
- `POST /api/v1/lost/create`: Submit a lost item report. Returns `report_id` and `access_token`.
- `POST /api/v1/found/create`: Submit a found item report. Returns `report_id` and `access_token`.
- `GET /api/v1/search`: Multi-attribute fuzzy search query across items.
- `POST /api/v1/track/lookup`: Validates `report_id` + `contact_email` and returns tokenized tracking link.
- `GET /api/v1/track/{report_id}?token={token}`: Retrieves secure report status, matches, and claim state.
- `POST /api/v1/claims/submit`: Submit ownership proof answers for verification.

### Security / Admin Endpoints (JWT Auth Required)
- `POST /api/v1/auth/login`: Authenticate Security Staff / Admin credentials.
- `GET /api/v1/admin/stats`: Overview metrics (Pending Claims, Today's Reports, Resolution Rate).
- `GET /api/v1/admin/audit-logs`: Audit stream of sensitive platform actions.
- `POST /api/v1/claims/{claim_id}/review`: Review claim proof, approve/reject handover, and mark item `RETURNED`.
