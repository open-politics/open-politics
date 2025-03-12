#!/bin/bash
# Restore script for Open Politics application

set -e

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKUP_DIR="${SCRIPT_DIR}/../backups"

# Parse command line arguments
PG_RESTORE=""
DROP_TABLES=""
BACKUP_PATH="${BACKUP_DIR}/latest"

print_usage() {
  echo "Usage: $0 [options] [backup_path]"
  echo "Options:"
  echo "  -p, --pg-restore    Use pg_restore for database restoration"
  echo "  -d, --drop-tables   Drop existing tables before restoring (USE WITH CAUTION)"
  echo "  -h, --help          Show this help message"
  echo ""
  echo "If backup_path is not specified, the latest backup will be used."
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -p|--pg-restore)
      PG_RESTORE="--pg-restore"
      shift
      ;;
    -d|--drop-tables)
      DROP_TABLES="--drop-tables"
      shift
      ;;
    -h|--help)
      print_usage
      exit 0
      ;;
    *)
      # If it's not an option, assume it's the backup path
      if [[ "$1" != -* ]]; then
        BACKUP_PATH="$1"
        shift
      else
        echo "Unknown option: $1"
        print_usage
        exit 1
      fi
      ;;
  esac
done

# Check if backup path exists
if [ ! -e "${BACKUP_PATH}" ]; then
  echo "Error: Backup path does not exist: ${BACKUP_PATH}"
  exit 1
fi

# Confirm before proceeding, especially if dropping tables
if [ -n "${DROP_TABLES}" ]; then
  echo "WARNING: You are about to restore data with the --drop-tables option."
  echo "This will DELETE ALL EXISTING DATA in the database before restoring."
  echo "Backup path: ${BACKUP_PATH}"
  echo ""
  read -p "Are you sure you want to continue? (y/N) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Restore cancelled."
    exit 1
  fi
else
  echo "You are about to restore data from: ${BACKUP_PATH}"
  echo "This will merge with existing data in the database."
  echo ""
  read -p "Are you sure you want to continue? (y/N) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Restore cancelled."
    exit 1
  fi
fi

# Run the restore script
echo "Starting restore..."
python3 "${SCRIPT_DIR}/restore.py" ${PG_RESTORE} ${DROP_TABLES} "${BACKUP_PATH}"

# Check if restore was successful
if [ $? -eq 0 ]; then
  echo "Restore completed successfully"
else
  echo "Restore failed"
  exit 1
fi 