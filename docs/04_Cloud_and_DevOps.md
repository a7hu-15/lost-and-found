# Document 4: Cloud & DevOps Architecture

## 🐳 Docker Compose Orchestration

```yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: lost_and_found

  redis:
    image: redis:7-alpine

  backend:
    build: ./backend
    environment:
      - DATABASE_URL=postgresql+asyncpg://postgres:postgrespassword@postgres:5432/lost_and_found

  frontend:
    build: ./frontend

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
```

---

## ☸️ Kubernetes Infrastructure
Manifests located in `infra/kubernetes/`:
- `deployment.yaml`: Configures 3 backend replicas & 2 frontend replicas with `livenessProbe` and `readinessProbe` checking `/health`.
- `service.yaml`: Exposes internal cluster IPs for backend (8000) and frontend (80).
- `ingress.yaml`: Nginx Ingress routing `/api` traffic to backend and `/` to frontend.
- `hpa.yaml`: Horizontal Pod Autoscaler scaling backend replicas up to 10 when CPU utilization exceeds 70%.

---

## 📊 Observability & Metrics
- **Prometheus**: Scrapes `/metrics` endpoint exported by FastAPI Prometheus Instrumentator.
- **Grafana**: Dashboards displaying API request latency, throughput, error counts, and active database connections.
