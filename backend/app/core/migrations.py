"""
Database migration utilities for Ignacio Bot
Using Supabase SQL Editor approach - migrations are applied manually via Supabase dashboard
"""
import logging
from pathlib import Path
from app.core.database import supabase

logger = logging.getLogger(__name__)


class MigrationRunner:
    """Handles database migrations for the application using Supabase API"""
    
    def __init__(self):
        self.migrations_dir = Path(__file__).parent.parent.parent / "migrations"
        self.client = supabase
    
    def check_connection(self) -> bool:
        """Test Supabase connection"""
        try:
            # Try a simple query to test connection
            response = self.client.table("schema_migrations").select("count", count="exact").execute()
            return True
        except Exception as e:
            logger.error(f"Supabase connection failed: {e}")
            return False
    
    def create_migration_table(self) -> None:
        """Create migration tracking table if it doesn't exist via RPC"""
        try:
            # We'll use RPC to execute raw SQL for table creation
            self.client.rpc('create_migration_table_if_not_exists').execute()
            logger.info("Migration tracking table verified")
        except Exception as e:
            logger.warning(f"Could not verify migration table: {e}")
            logger.info("Please create the migration table manually in Supabase SQL Editor:")
            print("""
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id SERIAL PRIMARY KEY,
                migration_name VARCHAR(255) UNIQUE NOT NULL,
                applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            """)
    
    def get_migration_files(self) -> list[Path]:
        """Get all migration files"""
        if not self.migrations_dir.exists():
            logger.warning(f"Migrations directory not found: {self.migrations_dir}")
            return []
        
        return sorted([
            f for f in self.migrations_dir.glob("*.sql")
            if f.is_file()
        ])
    
    def get_applied_migrations(self) -> list[str]:
        """Get list of already applied migrations"""
        try:
            response = self.client.table("schema_migrations").select("migration_name").execute()
            return [row['migration_name'] for row in response.data]
        except Exception as e:
            logger.error(f"Could not get applied migrations: {e}")
            return []
    
    def print_migration_status(self) -> None:
        """Print status of all migrations"""
        migration_files = self.get_migration_files()
        applied_migrations = self.get_applied_migrations()
        
        if not migration_files:
            logger.info("No migration files found")
            return
        
        logger.info("Migration Status:")
        logger.info("================")
        
        for migration_file in migration_files:
            status = "✅ Applied" if migration_file.name in applied_migrations else "❌ Pending"
            logger.info(f"{migration_file.name}: {status}")
        
        pending_migrations = [f for f in migration_files if f.name not in applied_migrations]
        
        if pending_migrations:
            logger.info("\nPending Migrations:")
            logger.info("==================")
            for migration_file in pending_migrations:
                logger.info(f"\nFile: {migration_file.name}")
                logger.info("Copy the following SQL to Supabase SQL Editor:")
                logger.info("-" * 50)
                with open(migration_file, 'r', encoding='utf-8') as f:
                    print(f.read())
                logger.info("-" * 50)
                
                # Provide SQL to mark migration as applied
                logger.info("After running the migration, execute this to mark it as applied:")
                logger.info(f"INSERT INTO schema_migrations (migration_name) VALUES ('{migration_file.name}');")
                logger.info("")
        else:
            logger.info("✅ All migrations are up to date!")


def check_migrations() -> None:
    """Check migration status - main function to use"""
    runner = MigrationRunner()
    
    logger.info("Checking Supabase connection...")
    if not runner.check_connection():
        logger.error("❌ Cannot connect to Supabase. Please check your configuration.")
        return
    
    logger.info("✅ Supabase connection successful")
    runner.print_migration_status()


if __name__ == "__main__":
    check_migrations()