#!/bin/bash
# Database Backup Script for Cloud Lost & Found
# Outputs a timestamped pg_dump of the production database.
set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/cloudfind_db_${TIMESTAMP}.sql"

mkdir -p "$BACKUP_DIR"

echo "Starting database backup..."
docker exec cloudfind_postgres pg_dump -U postgres lost_and_found > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup successful: ${BACKUP_FILE}"
else
    echo "❌ Backup failed!"
    exit 1
fi
