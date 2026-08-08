# Document 6: Final Minor Project Report

## 📌 Project Title
**Lost & Found**: A Secure Cloud-Native Campus Lost & Found Platform

---

## 1. Abstract
Traditional university physical lost and found offices suffer from low recovery rates, lack of privacy, and manual overhead. **Lost & Found** is an enterprise-grade cloud-native web platform that allows campus visitors to report missing or discovered items in under 60 seconds without creating accounts. The platform uses a weighted vector similarity matching engine, tokenized private tracking links (`token=...`), an anonymous notification service, and a Security Staff verification workflow.

---

## 2. Platform Features Overview
1. **Account-Free Visitor Flow**: 60-second item reporting generating a Report ID (`LF-2026-XXXXX`) and private tracking link.
2. **Privacy Protection**: Zero public contact detail exposure; all alerts brokered anonymously.
3. **Intelligent Vector Matching**: Rule engine evaluating Category, Brand, Color, Location, Date, and Description token overlap.
4. **Ownership Claim Protocol**: Multi-question verification proof (*inside contents, serial/wallpaper, unique marks*) reviewed by Security Staff.
5. **Vercel / Linear SaaS Aesthetic**: Dark monochrome UI (`#09090b`), sharp rectangular buttons, clean cards.
6. **Cloud & DevOps Ready**: Docker Compose, Kubernetes manifests, Nginx reverse proxy, GitHub Actions CI/CD, Prometheus metrics, and Grafana dashboards.

---

## 3. Technology Stack Summary
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Axios, React Router v6.
- **Backend**: FastAPI (Python 3.11), SQLAlchemy 2.0 (Async), Pydantic v2, JWT (Argon2/Bcrypt), SlowAPI.
- **Databases**: PostgreSQL (`asyncpg`), Redis, SQLite (`aiosqlite` dev fallback).
- **DevOps**: Docker, Kubernetes, Nginx, Prometheus, Grafana, GitHub Actions.

---

## 4. Conclusion & Future Scope
The **Lost & Found** platform successfully modernizes campus item recovery into a secure, cloud-native SaaS product. Future enhancements include AI OCR text extraction from uploaded images and S3 object storage integration.
