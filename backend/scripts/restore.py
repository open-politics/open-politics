#!/usr/bin/env python3
"""
Restore script for Open Politics application.
This script restores user data and content from a backup,
excluding S3/MinIO storage which is restored separately.
"""

import os
import sys
import logging
import argparse
import subprocess
import json
from pathlib import Path
from typing import Dict, Any, List, Optional

# Add the parent directory to the path so we can import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.config import settings
from app.models import (
    User, Workspace, Document, ClassificationScheme, ClassificationField,
    ClassificationResult, SavedResultSet, File, SearchHistory
)
from sqlmodel import Session, select, create_engine, SQLModel

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Restore Open Politics user data")
    parser.add_argument(
        "backup_path",
        type=str,
        help="Path to the backup directory"
    )
    parser.add_argument(
        "--pg-restore",
        action="store_true",
        help="Use pg_restore for database restoration (requires pg_restore to be installed)"
    )
    parser.add_argument(
        "--drop-tables",
        action="store_true",
        help="Drop existing tables before restoring (USE WITH CAUTION)"
    )
    return parser.parse_args()

def pg_restore_backup(backup_path: str, drop_tables: bool) -> bool:
    """
    Restore a database using pg_restore.
    
    Args:
        backup_path: Path to the backup directory
        drop_tables: Whether to drop existing tables before restoring
    
    Returns:
        bool: True if successful, False otherwise
    """
    # Check if we have a custom format dump file
    dump_file = os.path.join(backup_path, "database.dump")
    sql_file = os.path.join(backup_path, "database.sql")
    json_file = os.path.join(backup_path, "database.json")
    
    if os.path.exists(dump_file):
        file_to_restore = dump_file
        is_custom_format = True
    elif os.path.exists(sql_file):
        file_to_restore = sql_file
        is_custom_format = False
    elif os.path.exists(json_file):
        file_to_restore = json_file
        is_custom_format = False
    else:
        logger.error(f"No database dump file found in {backup_path}")
        return False
    
    # Set up the command
    if is_custom_format:
        cmd = [
            "pg_restore",
            f"--host={settings.POSTGRES_SERVER}",
            f"--port={settings.POSTGRES_PORT}",
            f"--username={settings.POSTGRES_USER}",
            f"--dbname={settings.POSTGRES_DB}",
        ]
        
        if drop_tables:
            cmd.append("--clean")
        
        cmd.append(file_to_restore)
    else:
        # For SQL or JSON files, we use psql
        cmd = [
            "psql",
            f"--host={settings.POSTGRES_SERVER}",
            f"--port={settings.POSTGRES_PORT}",
            f"--username={settings.POSTGRES_USER}",
            f"--dbname={settings.POSTGRES_DB}",
            "-f", file_to_restore
        ]
    
    # Set PGPASSWORD environment variable
    env = os.environ.copy()
    env["PGPASSWORD"] = settings.POSTGRES_PASSWORD
    
    try:
        logger.info(f"Running restore command: {' '.join(cmd)}")
        result = subprocess.run(cmd, env=env, check=True, capture_output=True)
        logger.info(f"Database restore completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Database restore failed: {e}")
        logger.error(f"stdout: {e.stdout.decode()}")
        logger.error(f"stderr: {e.stderr.decode()}")
        return False

def import_table_data(session: Session, model, backup_path: str, filename: str) -> int:
    """
    Import data from a JSON file into a table.
    
    Returns:
        int: Number of records imported
    """
    logger.info(f"Importing {filename}...")
    
    # Load data from JSON file
    input_file = os.path.join(backup_path, f"{filename}.json")
    if not os.path.exists(input_file):
        logger.warning(f"File not found: {input_file}")
        return 0
    
    with open(input_file, "r") as f:
        data = json.load(f)
    
    # Create model instances and add to session
    count = 0
    for item_data in data:
        try:
            # Create a new instance of the model
            item = model.model_validate(item_data)
            
            # Add to session
            session.add(item)
            count += 1
        except Exception as e:
            logger.error(f"Error importing record: {e}")
    
    # Commit changes
    session.commit()
    
    logger.info(f"Imported {count} records from {input_file}")
    return count

def manual_restore(backup_path: str, drop_tables: bool) -> bool:
    """
    Restore data by importing each table from JSON files.
    
    Args:
        backup_path: Path to the backup directory
        drop_tables: Whether to drop existing tables before restoring
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Create database engine and session
        engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))
        
        # Drop and recreate tables if requested
        if drop_tables:
            logger.warning("Dropping all tables...")
            SQLModel.metadata.drop_all(engine)
            logger.info("Creating tables...")
            SQLModel.metadata.create_all(engine)
        
        with Session(engine) as session:
            # Import each table in the correct order to maintain relationships
            import_table_data(session, User, backup_path, "users")
            import_table_data(session, Workspace, backup_path, "workspaces")
            import_table_data(session, Document, backup_path, "documents")
            import_table_data(session, File, backup_path, "files")
            import_table_data(session, ClassificationScheme, backup_path, "classification_schemes")
            import_table_data(session, ClassificationField, backup_path, "classification_fields")
            import_table_data(session, ClassificationResult, backup_path, "classification_results")
            import_table_data(session, SavedResultSet, backup_path, "saved_result_sets")
            import_table_data(session, SearchHistory, backup_path, "search_histories")
        
        logger.info(f"Restore completed successfully")
        return True
    except Exception as e:
        logger.error(f"Restore failed: {e}")
        return False

def main():
    """Main function to run the restore process."""
    args = parse_args()
    
    # Check if backup path exists
    if not os.path.exists(args.backup_path):
        logger.error(f"Backup path does not exist: {args.backup_path}")
        sys.exit(1)
    
    # Check if it's a symlink to 'latest'
    if os.path.basename(args.backup_path) == "latest" and os.path.islink(args.backup_path):
        real_path = os.path.realpath(args.backup_path)
        logger.info(f"Following symlink from {args.backup_path} to {real_path}")
        backup_path = real_path
    else:
        backup_path = args.backup_path
    
    # Check for metadata file
    metadata_file = os.path.join(backup_path, "metadata.json")
    if os.path.exists(metadata_file):
        with open(metadata_file, "r") as f:
            metadata = json.load(f)
        logger.info(f"Restoring backup from: {metadata.get('backup_date', 'unknown date')}")
        logger.info(f"Database: {metadata.get('database', 'unknown')}")
        logger.info(f"Tables included: {', '.join(metadata.get('tables_included', []))}")
    
    # Perform restore
    if args.pg_restore:
        success = pg_restore_backup(backup_path, args.drop_tables)
    else:
        success = manual_restore(backup_path, args.drop_tables)
    
    if success:
        logger.info(f"Restore completed successfully from: {backup_path}")
    else:
        logger.error("Restore failed")
        sys.exit(1)

if __name__ == "__main__":
    main() 