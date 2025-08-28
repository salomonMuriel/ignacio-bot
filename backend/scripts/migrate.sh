#!/bin/bash

# Database migration script for Ignacio Bot
# Checks migration status and provides SQL to run in Supabase SQL Editor

cd "$(dirname "$0")/.."

echo "Checking database migration status..."
python -c "
import sys
import os
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(message)s')

# Add the app directory to Python path
sys.path.insert(0, os.path.abspath('.'))

from app.core.migrations import check_migrations

try:
    check_migrations()
except Exception as e:
    print(f'❌ Migration check failed: {e}')
    sys.exit(1)
"