# Document 1: System Requirements Specification (SRS)

## 📌 Project Title
**Lost & Found**: A Secure Cloud-Native Campus Lost & Found Platform

---

## 1. Executive Summary & Purpose
The **Lost & Found Platform** is a specialized, privacy-first digital replacement for traditional campus physical lost and found desks. Designed specifically for university ecosystems (e.g., SRM University), the platform allows students, faculty, staff, and campus visitors to report missing or discovered items in under 60 seconds without creating accounts, while restricting administrative verification and item handover to authorized Security Staff.

---

## 2. Scope & Target Users
- **Target Institution**: University / Enterprise Campus
- **Estimated Scale**: ~10,000 active users, ~20,000 annual item reports, ~40,000 images
- **User Personas**:
  1. **Visitor / Student Persona**: Reports lost or found items, searches directory, receives anonymous notifications, tracks status via private tokenized links, submits verification proof.
  2. **Security / Admin Persona**: Logs in to review claims, verifies ownership evidence against reported attributes, approves item handover, and manages security audit logs.

---

## 3. Product Principles
1. **Extremely Easy**: 60-second visitor reporting with zero mandatory signup friction.
2. **Privacy First**: Public contact emails and phone numbers are encrypted and never disclosed. All communication is anonymously brokered by the platform.
3. **Trust & Verification**: Mandatory ownership proof answers (*inside contents, serial numbers, wallpapers*) before physical handover.
4. **Security & Moderation**: Rate-limiting, input sanitization, automated moderation, and RBAC admin controls.
5. **Enterprise Aesthetics**: Clean monochrome design language inspired by Vercel, Linear, and GitHub.

---

## 4. Functional Requirements (FR)

| Requirement ID | Module | Description | Priority |
| :--- | :--- | :--- | :--- |
| **FR-01** | Reporting | Visitors can report a lost item asking for title, category, brand, color, location, date, description, and contact email. | High |
| **FR-02** | Reporting | Visitors can report a found item turned in to Security with storage office location details. | High |
| **FR-03** | Tokenization | System auto-generates a unique Report ID (`LF-2026-XXXXX`) and secure random token for private tracking. | High |
| **FR-04** | Matching Engine | Weighted algorithm automatically scores vector similarity across Category (30%), Brand (15%), Color (15%), Location (15%), Date (15%), Description (10%). | High |
| **FR-05** | Notifications | Automated notification service dispatches confirmation emails, match alert emails, and pickup approval emails. | High |
| **FR-06** | Claiming | Claimants submit proof statements and verification answers to claim discovered items. | High |
| **FR-07** | Admin Moderation | Security Staff review claim proof in the Admin Panel, approve/reject requests, and mark items `RETURNED`. | High |
| **FR-08** | Search | Multi-attribute dynamic filtering across Category, Location, Color, Date, and Query strings. | High |

---

## 5. Non-Functional Requirements (NFR)
- **Performance**: API response times under 150ms; Vite frontend load under 1.0s.
- **Availability**: 99.9% uptime target orchestrated via Kubernetes container health probes.
- **Privacy & Security**: Zero public exposure of user contact details; HTTPS TLS encryption; OWASP Top 10 mitigation.
