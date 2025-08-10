#!/bin/bash

# Simple health check script for Docker containers
# Uses curl to verify the /api/health endpoint responds with healthy status

HOST="${HOST:-localhost}"
PORT="${PORT:-5000}"
HEALTH_PATH="/api/health"
TIMEOUT=5

url="http://${HOST}:${PORT}${HEALTH_PATH}"

echo "Health check: $url"

http_code=$(curl -s -o /tmp/health_response --max-time "$TIMEOUT" -w "%{http_code}" "$url" 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "✗ Health check failed: curl error"
    exit 1
fi

if [ "$http_code" = "200" ] && grep -q '"status":"healthy"' /tmp/health_response; then
    echo "✓ Health check passed"
    exit 0
else
    echo "✗ Health check failed: HTTP $http_code"
    cat /tmp/health_response
    exit 1
fi

