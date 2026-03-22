#!/bin/bash
set -euo pipefail

echo "=== Verifying Integration Test Coverage ==="

SERVICES_DIR="src/lib/services"
TESTS_DIR="src/lib/services/__tests__"

if [ ! -d "$SERVICES_DIR" ]; then
  echo "⚠️  $SERVICES_DIR not found (expected in Phase 3+)"
  exit 0
fi

SERVICES=$(find "$SERVICES_DIR" -maxdepth 1 -name '*.ts' ! -name 'index.ts' ! -name 'types.ts' 2>/dev/null | wc -l)
INTEGRATION_TESTS=$(find "$TESTS_DIR" -name '*.integration.test.ts' 2>/dev/null | wc -l)

echo "Services: $SERVICES"
echo "Integration tests: $INTEGRATION_TESTS"

if [ "$SERVICES" -eq 0 ]; then
  echo "⚠️  No services found yet"
  exit 0
fi

MISSING=0
for svc in "$SERVICES_DIR"/*.ts; do
  name=$(basename "$svc" .ts)
  [[ "$name" == "index" || "$name" == "types" ]] && continue
  if [ ! -f "$TESTS_DIR/${name}.integration.test.ts" ]; then
    echo "  MISSING: $name"
    MISSING=$((MISSING + 1))
  fi
done

if [ "$MISSING" -gt 0 ]; then
  echo ""
  echo "FAIL: $MISSING service(s) missing integration tests"
  exit 1
fi

echo ""
echo "PASS: All $SERVICES services have integration tests"
