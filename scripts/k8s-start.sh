#!/bin/bash
# =============================================================================
# Cloud Lost & Found — Kubernetes Demo Startup Script
# Run this on your Mac to start the full K8s demo environment
# =============================================================================
set -e

echo "🚀 Starting Cloud Lost & Found on Kubernetes..."
echo ""

# 1. Start minikube if not running
if ! minikube status | grep -q "Running"; then
  echo "▶ Starting minikube..."
  minikube start --cpus=4 --memory=3500 --driver=docker
fi

# 2. Make sure ingress is enabled
minikube addons enable ingress 2>/dev/null || true
minikube addons enable metrics-server 2>/dev/null || true

# 3. Wait for ingress controller
echo "⏳ Waiting for Ingress controller..."
kubectl wait --for=condition=ready pod \
  -n ingress-nginx \
  -l app.kubernetes.io/component=controller \
  --timeout=180s 2>/dev/null || {
    echo "⚠  Ingress controller not ready yet — applying manifests anyway"
}

# 4. Handle secrets
echo "🔐 Checking Kubernetes secrets..."
if [ ! -f "infra/kubernetes/secret.yaml" ]; then
  echo "   Creating secret.yaml from template..."
  cp infra/kubernetes/secret-template.yaml infra/kubernetes/secret.yaml
  # For local Minikube demo, we can just replace placeholders with default local passwords
  sed -i.bak 's/<REPLACE_WITH_DB_PASSWORD>/cloudfind_pg_pass_2024/g' infra/kubernetes/secret.yaml
  sed -i.bak 's/<REPLACE_WITH_JWT_SECRET_KEY>/a5d54dacb25c29e2f2b6a083b3f8efbbeaae57b74b5f74f3187793de393ab00b/g' infra/kubernetes/secret.yaml
  sed -i.bak 's/<REPLACE_WITH_SMTP_PASSWORD>/mock_password/g' infra/kubernetes/secret.yaml
  sed -i.bak 's/<REPLACE_WITH_MINIO_USER>/cloudfind-admin/g' infra/kubernetes/secret.yaml
  sed -i.bak 's/<REPLACE_WITH_MINIO_PASSWORD>/cloudfind-minio-2024/g' infra/kubernetes/secret.yaml
  rm -f infra/kubernetes/secret.yaml.bak
  echo "   ✅ Generated local development secrets"
fi

# 5. Build images in minikube's Docker daemon (no registry needed)
echo "🔨 Building application images in minikube..."
eval $(minikube docker-env)
docker build -t ghcr.io/a7hu-15/lost-and-found-backend:latest ./backend --quiet
docker build -t ghcr.io/a7hu-15/lost-and-found-frontend:latest ./frontend --quiet
echo "✅ Images built"

# 5. Apply all Kubernetes manifests
echo "📦 Applying Kubernetes manifests..."
kubectl apply -f infra/kubernetes/namespace.yaml
kubectl apply -f infra/kubernetes/tls-secret.yaml
kubectl apply -k infra/kubernetes/
echo "✅ Manifests applied"

# 6. Add /etc/hosts entry if missing
MINIKUBE_IP=$(minikube ip)
if ! grep -q "cloudfind.local" /etc/hosts; then
  echo ""
  echo "📝 Adding cloudfind.local to /etc/hosts (requires sudo)..."
  echo "${MINIKUBE_IP}  cloudfind.local" | sudo tee -a /etc/hosts
fi

# 7. Wait for pods to be ready
echo ""
echo "⏳ Waiting for all pods to be Running..."
kubectl wait --for=condition=ready pod \
  -n cloudfind \
  -l app=cloudfind-postgres \
  --timeout=120s
kubectl wait --for=condition=ready pod \
  -n cloudfind \
  -l app=cloudfind-backend \
  --timeout=120s
echo "✅ Core pods ready"

# 8. Show status
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
kubectl get pods -n cloudfind
echo ""
kubectl get hpa -n cloudfind
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Cloud Lost & Found is running on Kubernetes!"
echo ""
echo "   📍 App:      https://cloudfind.local  (run: minikube tunnel)"
echo "   📊 Grafana:  http://$(minikube ip):30030  (admin / cloudfind-grafana-2024)"
echo "   📈 Prometheus: kubectl port-forward svc/prometheus 9090:9090 -n cloudfind"
echo "   📦 MinIO:    kubectl port-forward svc/cloudfind-minio 9001:9001 -n cloudfind"
echo ""
echo "▶ In a NEW terminal, run:  minikube tunnel"
echo "  Then open:  https://cloudfind.local"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
