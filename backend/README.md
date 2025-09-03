# Ignacio Bot Backend

Backend API for Ignacio, a chat assistant that helps users develop their projects as part of the Action Lab education program, built with FastAPI and Python 3.12.

## Setup

### Prerequisites
- Python 3.12+
- [uv](https://github.com/astral-sh/uv) for dependency management

### Installation

1. Install uv if you haven't already:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

2. Install dependencies:
```bash
uv sync
```

3. Copy environment file:
```bash
cp ../.env.example ../.env.local
# Edit .env.local with your actual configuration
```

### Development

Run the development server:
```bash
./scripts/dev.sh
# or
uv run uvicorn app.main:app --host localhost --port 8000 --reload
```

### Linting and Formatting

Run all linting and formatting tools:
```bash
./scripts/lint.sh
```

Or run individual tools:
```bash
uv run black app/          # Format code
uv run isort app/          # Sort imports
uv run ruff check app/     # Lint code
uv run mypy app/           # Type checking
```

### Testing

Run tests:
```bash
uv run pytest
```

## Project Structure

```
app/
├── core/           # Core configuration and utilities
├── models/         # Database models
├── routers/        # API route handlers
├── services/       # Business logic services
└── main.py         # FastAPI application entry point
```

## API Documentation

Once running, visit:
- API docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc
