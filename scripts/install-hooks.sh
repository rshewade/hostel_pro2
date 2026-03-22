#!/bin/bash
set -euo pipefail
if [ ! -d ".git/hooks" ]; then echo "Error: not a git repo"; exit 1; fi
cp scripts/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
echo "✅ Pre-commit hook installed"
