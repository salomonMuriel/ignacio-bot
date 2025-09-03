# Pre-commit Setup for Ignacio Bot

This repository uses pre-commit hooks to ensure code quality and run tests automatically on every commit.

## What's Configured

### Automatic Quality Checks
- **Trailing whitespace removal**
- **End-of-file fixing**
- **YAML, JSON, TOML validation**
- **Merge conflict detection**
- **Large file prevention** (>1MB)

### Python Backend Checks
- **Black** - Code formatting
- **isort** - Import sorting
- **Ruff** - Fast linting and fixing
- **MyPy** - Type checking
- **Test Suite** - Runs automatically when backend files change
- **Coverage Check** - Ensures minimum 70% test coverage

### Frontend Checks
- **Prettier** - Code formatting for JS/TS/CSS/MD files

### Security
- **detect-secrets** - Prevents committing secrets/keys

## How It Works

### On Every Commit
When you run `git commit`, pre-commit automatically:

1. **Checks only changed files** for efficiency
2. **Fixes formatting issues** automatically
3. **Runs backend tests** if any `.py` files in `backend/` changed
4. **Blocks the commit** if tests fail or quality checks don't pass

### Backend Test Integration
- **Smart triggering**: Tests only run when backend Python files change
- **Fast execution**: Optimized for pre-commit speed
- **Early failure**: Stops on first few test failures for quick feedback
- **Coverage enforcement**: Ensures new code maintains test coverage

## Commands

```bash
# Run all hooks on all files (good for setup)
uv run pre-commit run --all-files

# Run specific hook
uv run pre-commit run backend-tests

# Skip hooks for a single commit (use sparingly)
git commit --no-verify

# Update hook versions
uv run pre-commit autoupdate

# Clean hook environments (if having issues)
uv run pre-commit clean
```

## Backend Test Hook Details

The backend test hook (`scripts/run-backend-tests.sh`):
- Runs in the `backend/` directory
- Uses optimized pytest settings for speed
- Skips slow integration tests during commit
- Fails fast on first few errors
- Shows minimal output for clean commits

## Customization

### Skip Tests for WIP Commits
```bash
# Skip just the test hooks
SKIP=backend-tests,backend-coverage git commit -m "WIP: feature development"

# Skip all hooks
git commit --no-verify -m "Emergency fix"
```

### Adjust Test Coverage Threshold
Edit `.pre-commit-config.yaml` and change `--cov-fail-under=70` to your desired percentage.

### Add More Hooks
The configuration supports additional hooks. See [pre-commit.com](https://pre-commit.com/hooks.html) for options.

## Troubleshooting

### Hook Installation Issues
```bash
# Reinstall hooks
uv run pre-commit uninstall
uv run pre-commit install

# Clear environments and reinstall
uv run pre-commit clean
uv run pre-commit install --install-hooks
```

### Test Failures Blocking Commits
1. Fix the failing tests first, OR
2. Skip with `--no-verify` if it's an emergency, OR
3. Use `SKIP=backend-tests git commit` for WIP commits

### Performance Issues
The hooks are optimized for speed, but if you need to bypass for large commits:
```bash
# Skip formatting hooks for large refactors
SKIP=black,isort,ruff git commit -m "Large refactor"
```

## Benefits

✅ **Consistent code quality** across all commits
✅ **Automatic test execution** catches bugs early
✅ **No broken main branch** - tests must pass to commit
✅ **Consistent formatting** - no more style debates
✅ **Security protection** - prevents committing secrets
✅ **Fast feedback** - optimized for developer experience
