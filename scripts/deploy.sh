#!/bin/bash
# Deploy Korean Learning to k3s via Helm
# Usage: ./scripts/deploy.sh [production|staging] [tag]
set -euo pipefail

ENV="${1:-staging}"
TAG="${2:-latest}"
REGISTRY="${DOCKER_REGISTRY:-shawnlin0125}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CHART="$ROOT/helm/korean-learning"

case "$ENV" in
  production|prod)
    NAMESPACE="korean-learning"
    VALUES_FILE="values/production.yaml"
    ;;
  staging|stg)
    NAMESPACE="korean-staging"
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

helm upgrade --install korean-learning "$CHART" \
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
