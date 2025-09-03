#!/bin/bash
# Script to run backend tests efficiently for pre-commit hooks

set -e  # Exit on any error

# Change to the backend directory
cd "$(dirname "$0")/../backend"

# Ensure uv is in PATH
export PATH="$HOME/.local/bin:$PATH"

echo "🧪 Running backend tests..."

# Run tests with optimized settings for pre-commit
# - Run only fast tests during pre-commit
# - Skip slow integration tests
# - Fail fast on first few errors
# - Reduce output verbosity for cleaner git commits

uv run pytest tests/ \
  --tb=short \
  --maxfail=3 \
  --disable-warnings \
  -q \
  -x \
  --durations=0 \
  --no-cov \
  -m "not slow"

echo "✅ Backend tests passed!"
