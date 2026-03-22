#!/bin/bash
set -euo pipefail

REPO="rshewade/hostel_pro2"
BRANCH=$(git rev-parse --abbrev-ref HEAD)
COMMIT=$(git rev-parse HEAD)
SHORT_COMMIT=$(git rev-parse --short HEAD)

if [ -z "${GITHUB_TOKEN:-}" ]; then
  GITHUB_TOKEN=$(grep -E '^GITHUB_TOKEN=' .env 2>/dev/null | cut -d= -f2 || echo "")
fi

if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ GITHUB_TOKEN not set. Cannot check CI status."
  exit 1
fi

echo "Checking CI status for $BRANCH @ $SHORT_COMMIT..."

STATUS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$REPO/actions/runs?head_sha=$COMMIT&per_page=1" \
  | python3 -c "
import json,sys
data = json.load(sys.stdin)
runs = data.get('workflow_runs', [])
if not runs:
    print('pending')
else:
    r = runs[0]
    if r['status'] != 'completed':
        print('in_progress')
    else:
        print(r['conclusion'])
")

echo "CI status: $STATUS"

case "$STATUS" in
  success)
    echo "✅ CI passed for $SHORT_COMMIT"
    ;;
  pending|in_progress)
    echo "🔄 CI still running for $SHORT_COMMIT — check again later"
    ;;
  failure)
    echo "❌ CI FAILED for $SHORT_COMMIT"
    echo ""
    echo "Reverting last commit..."
    git revert --no-edit HEAD
    echo ""
    echo "⚠️  Reverted $SHORT_COMMIT. Fix the issue and recommit."
    echo "Run 'devbox run -- bash scripts/phase-gate.sh' before committing again."
    exit 1
    ;;
  *)
    echo "⚠️  Unknown CI status: $STATUS"
    ;;
esac
