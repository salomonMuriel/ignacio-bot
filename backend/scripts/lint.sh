#!/bin/bash
# Linting and formatting script for the backend

echo "Running black formatter..."
uv run black app/

echo "Running isort import formatter..."
uv run isort app/

echo "Running ruff linter..."
uv run ruff check app/ --fix

echo "Running mypy type checker..."
uv run mypy app/

echo "Linting complete!"
