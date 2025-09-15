#!/usr/bin/env python3
"""Test script to verify environment configuration loading."""

import os
import sys
sys.path.append('./backend')

def test_environment_loading():
    """Test that the backend loads the correct environment file based on APP_ENV."""

    print("Testing Environment Configuration Loading\n")
    print("=" * 50)

    # Test development environment
    print("\n1. Testing Development Environment (APP_ENV=development)")
    os.environ['APP_ENV'] = 'development'

    # Import after setting environment
    from backend.app.core.config import Settings, get_env_file

    dev_env_file = get_env_file()
    print(f"   Environment file: {dev_env_file}")

    try:
        dev_settings = Settings()
        print(f"   APP_ENV: {dev_settings.app_env}")
        print(f"   DEBUG: {dev_settings.debug}")
        print(f"   LOG_LEVEL: {dev_settings.log_level}")
        print(f"   JWT_EXPIRE_MINUTES: {dev_settings.jwt_access_token_expire_minutes}")
        print("   ✅ Development environment loaded successfully")
    except Exception as e:
        print(f"   ❌ Error loading development environment: {e}")

    # Test production environment
    print("\n2. Testing Production Environment (APP_ENV=production)")
    os.environ['APP_ENV'] = 'production'

    # Re-import to get fresh settings
    import importlib
    import backend.app.core.config
    importlib.reload(backend.app.core.config)
    from backend.app.core.config import Settings, get_env_file

    prod_env_file = get_env_file()
    print(f"   Environment file: {prod_env_file}")

    try:
        prod_settings = Settings()
        print(f"   APP_ENV: {prod_settings.app_env}")
        print(f"   DEBUG: {prod_settings.debug}")
        print(f"   LOG_LEVEL: {prod_settings.log_level}")
        print(f"   JWT_EXPIRE_MINUTES: {prod_settings.jwt_access_token_expire_minutes}")
        print(f"   ALLOWED_HOSTS: {prod_settings.allowed_hosts}")
        print("   ✅ Production environment loaded successfully")
    except Exception as e:
        print(f"   ❌ Error loading production environment: {e}")

    print("\n" + "=" * 50)
    print("Environment configuration test completed!")

if __name__ == "__main__":
    test_environment_loading()