#!/bin/bash
set -euo pipefail

echo "=== Phase Gate ==="
echo ""

echo "Step 1/6: Type check"
bun run typecheck
echo "✅ Type check passed"
echo ""

echo "Step 2/6: Lint"
bun run lint
echo "✅ Lint passed"
echo ""

echo "Step 3/6: Unit tests"
UNIT_COUNT=$(find src -name '*.unit.test.ts' -o -name '*.test.tsx' 2>/dev/null | wc -l)
if [ "$UNIT_COUNT" -gt 0 ]; then
  bun run test:unit
  echo "✅ Unit tests passed ($UNIT_COUNT files)"
else
  echo "⚠️  No unit test files found — CANNOT mark phase done without tests"
fi
echo ""

echo "Step 4/6: Integration tests"
INT_COUNT=$(find src -name '*.integration.test.ts' -o -name '*.api.test.ts' 2>/dev/null | wc -l)
if [ "$INT_COUNT" -gt 0 ]; then
  bun run test:integration
  echo "✅ Integration tests passed ($INT_COUNT files)"
else
  echo "⚠️  No integration test files found — CANNOT mark phase done without tests"
fi
echo ""

echo "Step 5/6: Build"
bun run build
echo "✅ Build passed"
echo ""

echo "Step 6/6: Integration test coverage"
if [ -f scripts/verify-test-coverage.sh ]; then
  bash scripts/verify-test-coverage.sh
else
  echo "⚠️  verify-test-coverage.sh not found"
fi

echo ""
echo "=== ALL GATES PASSED ==="
