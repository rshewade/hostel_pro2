#!/bin/bash
set -euo pipefail

HOOK_DIR=".git/hooks"

if [ ! -d "$HOOK_DIR" ]; then
  echo "Error: .git/hooks directory not found. Is this a git repository?"
  exit 1
fi

cp scripts/pre-commit "$HOOK_DIR/pre-commit"
chmod +x "$HOOK_DIR/pre-commit"

echo "✅ Pre-commit hook installed"
