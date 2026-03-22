#!/bin/bash
set -euo pipefail

echo "=== Phase Gate ==="

echo ""
echo "Step 1: Type check"
bun run typecheck
echo "✅ Type check passed"

echo ""
echo "Step 2: Lint"
bun run lint
echo "✅ Lint passed"

echo ""
echo "Step 3: Unit tests"
bun run test:unit
echo "✅ Unit tests passed"

echo ""
echo "Step 4: Integration tests"
bun run test:integration
echo "✅ Integration tests passed"

echo ""
echo "Step 5: Build"
bun run build
echo "✅ Build passed"

echo ""
echo "Step 6: Verify integration test coverage"
if [ -f scripts/verify-test-coverage.sh ]; then
  bash scripts/verify-test-coverage.sh
  echo "✅ Integration test coverage verified"
else
  echo "⚠️  verify-test-coverage.sh not found (expected in Phase 3+)"
fi

echo ""
echo "=== ALL GATES PASSED ==="
