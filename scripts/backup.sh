#!/bin/bash

# Database backup script
# Runs a daily backup of the PostgreSQL database and rotates backups

# Variables
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="/backups"
BACKUP_FILE="${BACKUP_DIR}/ireva_backup_${DATE}.sql.gz"
RETENTION_DAYS=14

# Create backup directory if it doesn't exist
mkdir -p ${BACKUP_DIR}

# Create the backup
echo "Creating database backup: ${BACKUP_FILE}"
pg_dump | gzip > ${BACKUP_FILE}

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo "Backup created successfully"
  
  # Create symbolic link to latest backup
  ln -sf ${BACKUP_FILE} ${BACKUP_DIR}/latest.sql.gz
  
  # Delete backups older than RETENTION_DAYS
  find ${BACKUP_DIR} -name "ireva_backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete
  echo "Removed backups older than ${RETENTION_DAYS} days"
else
  echo "Backup failed"
  exit 1
fi

# Generate backup report
echo "Backup Report - $(date)" > ${BACKUP_DIR}/backup_report.txt
echo "--------------------------------------" >> ${BACKUP_DIR}/backup_report.txt
echo "Latest backup: ${BACKUP_FILE}" >> ${BACKUP_DIR}/backup_report.txt
echo "Backup size: $(du -h ${BACKUP_FILE} | cut -f1)" >> ${BACKUP_DIR}/backup_report.txt
echo "Available backups:" >> ${BACKUP_DIR}/backup_report.txt
ls -lh ${BACKUP_DIR}/*.sql.gz | awk '{print $9, "- Size:", $5}' >> ${BACKUP_DIR}/backup_report.txt

echo "Backup complete"