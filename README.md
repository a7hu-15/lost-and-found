# Cloud Lost & Found Platform (CloudFind) 🚀

[![CI/CD Pipeline](https://github.com/cloudfind/platform/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/cloudfind/platform/actions)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688.svg?style=flat&logo=FastAPI)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED.svg?style=flat&logo=docker)](https://www.docker.com)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Production-326CE5.svg?style=flat&logo=kubernetes)](https://kubernetes.io)

An enterprise-grade, cloud-native **Lost & Found Platform** designed for universities, corporations, and enterprise environments. Built with high availability, security best practices, automated intelligent matching engines, role-based access control (RBAC), containerization, and monitoring observability stacks.

---

## 🏛️ Platform Architecture

```
                                 Clients / Web Browsers
                                           │
                                  Nginx Reverse Proxy (80/443)
                                           │
        ┌──────────────────────────────────┴──────────────────────────────────┐
        │                                                                     │
    Frontend (React + Vite + TS)                                FastAPI Backend API (8000)
    - Role Badges (Student, Admin, etc.)                       - Auth Service (JWT + Refresh)
    - Item Catalogs & Filters                                  - Lost & Found Item Services
    - Intelligent Score Visualizer                             - Weighted Matching Engine
    - Claim Verification Protocol                              - Security Verification API
    - Admin Control & Audit Stream                             - Analytics & Metrics API
        │                                                                     │
        └──────────────────────────────────┬──────────────────────────────────┘
                                           │
        ┌──────────────────────────────────┼──────────────────────────────────┐
        │                                  │                                  │
   PostgreSQL (5432)                  Redis (6379)                       Storage
   - User Accounts & Roles            - Rate Limit Counters              - AWS S3 / Local Media
   - Items, Matches & Claims          - Session Caching
   - Audit Log Events
        │
   Observability Stack
   - Prometheus (Metrics Scraping at /metrics)
   - Grafana (Dashboards)
   - Loki (Centralized Logging)
```

---

## 🧰 Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript & Vite
- **Styling**: Tailwind CSS with custom glassmorphism design system
- **Routing & State**: React Router v6 & Context API
- **HTTP Client**: Axios with automatic JWT interceptors

### Backend
- **Framework**: Python 3.11+ with FastAPI
- **ORM & DB**: SQLAlchemy 2.0 (Async) & PostgreSQL (`asyncpg`)
- **Validation**: Pydantic v2
- **Authentication**: JWT Access & Refresh tokens, Argon2 / Bcrypt password hashing
- **Rate Limiting**: SlowAPI & Redis
- **Metrics**: Prometheus FastAPI Instrumentator

### DevOps & Cloud Infrastructure
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes (Deployments, Services, Ingress, ConfigMaps, Secrets, HPA)
- **Proxy**: Nginx with security headers & rate limiting
- **Observability**: Prometheus & Grafana

---

## 🚀 Main Modules

### 1. 🔐 Authentication & RBAC
- Multi-role support: `STUDENT`, `FACULTY`, `SECURITY_STAFF`, `ADMIN`.
- Secure JWT authentication flow with refresh tokens and salted password hashing.

### 2. 📦 Lost & Found Reporting
- Detailed reporting with attributes: Title, Category, Brand, Color, Location, Date, Description, Storage Location, and Optional Reward.

### 3. 🧠 Intelligent Matching Engine
Weighted scoring vector evaluating 6 distinct parameters:
$$\text{Score} = \text{Category}(30\%) + \text{Brand}(15\%) + \text{Color}(15\%) + \text{Location}(15\%) + \text{Date Proximity}(15\%) + \text{Description Overlap}(10\%)$$
- Automatically runs when a new lost/found report is created.
- Renders match confidence meters (e.g., **92% Possible Match**).

### 4. 🛡️ Claim Verification Protocol
- Multi-step security question verification:
  - *What are the specific contents inside?*
  - *What is the wallpaper / serial number?*
  - *Distinctive marks or scratches?*
- Security Staff approval workflow before item status transitions to `CLAIMED`.

### 5. 📊 Admin & Analytics
- Live system stats, audit log stream, registered user directory, and recovery trends.

---

## 💻 Quick Start with Docker Compose

### Prerequisites
- Docker & Docker Compose installed.

### Execution
```bash
# Clone the repository
git clone https://github.com/cloudfind/platform.git
cd lost-and-found

# Start the full stack (Postgres, Redis, FastAPI, React, Nginx, Prometheus, Grafana)
docker-compose up --build -d
```

### Access Points
- **Web Platform UI**: [http://localhost](http://localhost) (or [http://localhost:5173](http://localhost:5173))
- **FastAPI OpenAPI Specs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Prometheus Metrics**: [http://localhost:9090](http://localhost:9090)
- **Grafana Dashboard**: [http://localhost:3000](http://localhost:3000) (User: `admin` / Password: `admin`)

---

## ☸️ Kubernetes Deployment

Deploy to any Kubernetes cluster (EKS, GKE, AKS, Minikube):

```bash
kubectl apply -f infra/kubernetes/configmap.yaml
kubectl apply -f infra/kubernetes/secret.yaml
kubectl apply -f infra/kubernetes/deployment.yaml
kubectl apply -f infra/kubernetes/service.yaml
kubectl apply -f infra/kubernetes/ingress.yaml
kubectl apply -f infra/kubernetes/hpa.yaml
```

---

## 🛡️ Security Hardening Overview
- **DDoS Resiliency**: SlowAPI rate-limiting, Nginx rate limits, and Kubernetes Horizontal Pod Autoscaler.
- **SQL Injection Prevention**: 100% Parameterized queries via SQLAlchemy ORM.
- **XSS & CSRF Mitigation**: Output sanitization and strict Content Security Policy headers.
- **Audit Logging**: Every sensitive action logged with IP timestamping in `audit_logs`.

---

## 📜 License
Developed as an open-source Cloud-Native Enterprise Platform.
