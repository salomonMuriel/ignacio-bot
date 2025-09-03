#!/bin/bash
# Development script for running the backend with uv

# Install dependencies if needed
uv sync

# Run the development server
uv run uvicorn app.main:app --host localhost --port 8000 --reload
