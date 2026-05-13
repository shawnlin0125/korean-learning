#!/bin/bash
# Deploy Korean Learning to k3s via Helm
# Usage: ./scripts/deploy.sh [production|staging] [tag]
set -euo pipefail

# Ensure kubectl/helm work in non-interactive SSH sessions
export KUBECONFIG="${KUBECONFIG:-/home/ubuntu/.kube/config}"
if [ ! -f "$KUBECONFIG" ]; then
  export KUBECONFIG="/etc/rancher/k3s/k3s.yaml"
fi
# sudo might be needed to read k3s.yaml
if [ ! -r "$KUBECONFIG" ]; then
  sudo cp /etc/rancher/k3s/k3s.yaml /tmp/k3s-deploy.yaml
  sudo chown ubuntu:ubuntu /tmp/k3s-deploy.yaml
  export KUBECONFIG=/tmp/k3s-deploy.yaml
fi

ENV="${1:-staging}"
TAG="${2:-latest}"
REGISTRY="${DOCKER_REGISTRY:-shawnlin0125}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CHART="$ROOT/helm/korean-learning"

case "$ENV" in
  production|prod)
    NAMESPACE="korean-learning"
    RELEASE="korean-learning"
    VALUES_FILE="values/production.yaml"
    ;;
  staging|stg)
    NAMESPACE="korean-staging"
    RELEASE="korean-staging"
    VALUES_FILE="values/staging.yaml"
    ;;
  *)
    echo "❌ Unknown environment: $ENV (use production|staging)"
    exit 1
    ;;
esac

echo "🚀 Deploying to $ENV (namespace: $NAMESPACE)"
echo "🏷  Tag: $TAG"
echo "📦 Registry: $REGISTRY"
echo ""

helm upgrade --install "$RELEASE" "$CHART" \
  --namespace "$NAMESPACE" \
  --values "$CHART/$VALUES_FILE" \
  --set apiGateway.image="${REGISTRY}/api-gateway:${TAG}" \
  --set userService.image="${REGISTRY}/user-service:${TAG}" \
  --set vocabService.image="${REGISTRY}/vocab-service:${TAG}" \
  --set quizService.image="${REGISTRY}/quiz-service:${TAG}" \
  --set frontend.image="${REGISTRY}/korean-learning:${TAG}" \
  --set imagePullPolicy=Always \
  --reuse-values \
  --wait \
  --timeout 120s

echo ""
echo "✅ Deploy complete: $ENV"
kubectl get pods -n "$NAMESPACE" --no-headers
