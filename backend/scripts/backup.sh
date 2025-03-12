#!/bin/bash
# Backup script for Open Politics application

set -e

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKUP_DIR="${SCRIPT_DIR}/../backups"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Parse command line arguments
PG_DUMP=""
FORMAT="custom"
OUTPUT_DIR="${BACKUP_DIR}"
UPLOAD=""
UPLOAD_METHOD="s3"
REMOTE_PATH=""
REMOTE_HOST=""
REMOTE_USER=""
REMOTE_KEY=""
COMPRESS=""
RETENTION_DAYS="30"

print_usage() {
  echo "Usage: $0 [options]"
  echo "Options:"
  echo "  -p, --pg-dump                Use pg_dump for database backup"
  echo "  -f, --format FORMAT          Backup format (json, sql, custom) when using pg_dump"
  echo "  -o, --output-dir DIR         Directory to store backup files"
  echo ""
  echo "Remote Storage Options:"
  echo "  -u, --upload                 Upload backup to remote storage"
  echo "  -m, --upload-method METHOD   Upload method (s3, sftp, scp, rsync, nfs)"
  echo "  -r, --remote-path PATH       Remote path or bucket for backup storage"
  echo "  -h, --remote-host HOST       Remote host for SFTP/SCP/rsync uploads"
  echo "  -U, --remote-user USER       Remote username for SFTP/SCP/rsync uploads"
  echo "  -k, --remote-key KEY         Path to SSH key for SFTP/SCP/rsync uploads"
  echo "  -c, --compress               Compress backup before uploading"
  echo "  -d, --retention-days DAYS    Number of days to retain backups (default: 30)"
  echo ""
  echo "Help:"
  echo "  --help                       Show this help message"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -p|--pg-dump)
      PG_DUMP="--pg-dump"
      shift
      ;;
    -f|--format)
      FORMAT="$2"
      shift 2
      ;;
    -o|--output-dir)
      OUTPUT_DIR="$2"
      shift 2
      ;;
    -u|--upload)
      UPLOAD="--upload"
      shift
      ;;
    -m|--upload-method)
      UPLOAD_METHOD="$2"
      shift 2
      ;;
    -r|--remote-path)
      REMOTE_PATH="$2"
      shift 2
      ;;
    -h|--remote-host)
      REMOTE_HOST="$2"
      shift 2
      ;;
    -U|--remote-user)
      REMOTE_USER="$2"
      shift 2
      ;;
    -k|--remote-key)
      REMOTE_KEY="$2"
      shift 2
      ;;
    -c|--compress)
      COMPRESS="--compress"
      shift
      ;;
    -d|--retention-days)
      RETENTION_DAYS="$2"
      shift 2
      ;;
    --help)
      print_usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      print_usage
      exit 1
      ;;
  esac
done

# Validate upload options
if [ -n "$UPLOAD" ]; then
  case "$UPLOAD_METHOD" in
    s3)
      if [ -z "$REMOTE_PATH" ]; then
        echo "Error: Remote path (bucket) is required for S3 upload"
        exit 1
      fi
      ;;
    sftp|scp|rsync)
      if [ -z "$REMOTE_HOST" ] || [ -z "$REMOTE_USER" ] || [ -z "$REMOTE_PATH" ]; then
        echo "Error: Remote host, user, and path are required for $UPLOAD_METHOD upload"
        exit 1
      fi
      ;;
    nfs)
      if [ -z "$REMOTE_PATH" ]; then
        echo "Error: Remote path is required for NFS upload"
        exit 1
      fi
      ;;
    *)
      echo "Error: Unsupported upload method: $UPLOAD_METHOD"
      exit 1
      ;;
  esac
fi

# Build command arguments
ARGS=()
ARGS+=("${PG_DUMP}")
ARGS+=("--format" "${FORMAT}")
ARGS+=("--output-dir" "${OUTPUT_DIR}")

if [ -n "$UPLOAD" ]; then
  ARGS+=("${UPLOAD}")
  ARGS+=("--upload-method" "${UPLOAD_METHOD}")
  
  if [ -n "$REMOTE_PATH" ]; then
    ARGS+=("--remote-path" "${REMOTE_PATH}")
  fi
  
  if [ -n "$REMOTE_HOST" ]; then
    ARGS+=("--remote-host" "${REMOTE_HOST}")
  fi
  
  if [ -n "$REMOTE_USER" ]; then
    ARGS+=("--remote-user" "${REMOTE_USER}")
  fi
  
  if [ -n "$REMOTE_KEY" ]; then
    ARGS+=("--remote-key" "${REMOTE_KEY}")
  fi
  
  if [ -n "$COMPRESS" ]; then
    ARGS+=("${COMPRESS}")
  fi
  
  ARGS+=("--retention-days" "${RETENTION_DAYS}")
fi

# Run the backup script
echo "Starting backup..."
python3 "${SCRIPT_DIR}/backup.py" "${ARGS[@]}"

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo "Backup completed successfully"
  echo "Backup location: ${OUTPUT_DIR}/latest"
else
  echo "Backup failed"
  exit 1
fi 