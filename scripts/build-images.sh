#!/bin/bash
# Build all Korean Learning Docker images
# Usage: ./scripts/build-images.sh [tag]
set -euo pipefail

TAG="${1:-latest}"
REGISTRY="${DOCKER_REGISTRY:-shawnlin0125}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "🔨 Building images with tag: $TAG"
echo "📦 Registry: $REGISTRY"
echo ""

services=(
  "api-gateway:services/api-gateway"
  "user-service:services/user-service"
  "vocab-service:services/vocab-service"
  "quiz-service:services/quiz-service"
  "korean-learning:."
)

for svc in "${services[@]}"; do
  name="${svc%%:*}"
  path="${svc##*:}"
  image="${REGISTRY}/${name}:${TAG}"
  
  echo "━━━ Building ${name} ━━━"
  docker build -t "$image" -f "$ROOT/$path/Dockerfile" "$ROOT/$path"
  
  if [ "${PUSH:-false}" = "true" ]; then
    echo "  ⬆ Pushing $image..."
    docker push "$image"
  fi
  echo ""
done

echo "✅ All images built: ${REGISTRY}/*:${TAG}"
