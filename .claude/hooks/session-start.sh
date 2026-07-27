#!/bin/bash
set -euo pipefail

# Install Node dependencies so tests, linters, and type-checks work in the
# session. `npm install` (not `npm ci`) is used so the cached container state
# is reused across sessions. Idempotent and non-interactive.

cd "$CLAUDE_PROJECT_DIR"

npm install --no-audit --no-fund
