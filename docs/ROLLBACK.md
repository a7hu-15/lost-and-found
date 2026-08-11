# Deployment Rollback SOP

If a production deployment of the Cloud Lost & Found platform fails or introduces critical regressions, follow these steps to restore the system to a previously known good state.

## 1. Application Revert (Docker)
The application runs as a set of Docker containers defined in `docker-compose.yml`.

1. Find the last stable git tag (e.g., `phase-7-baseline`):
   ```bash
   git checkout tags/phase-7-baseline
   ```
2. Rebuild the stable images and recreate the containers:
   ```bash
   docker compose down
   docker compose up -d --build
   ```

## 2. Database Restore (PostgreSQL)
If the deployment involved a destructive database migration or data corruption, restore from the latest automated backup.

1. Locate the most recent backup in the `./backups/` directory (created by `infra/scripts/backup_db.sh`).
2. Drop and recreate the database schema to ensure a clean state (WARNING: this deletes current data):
   ```bash
   docker exec -i cloudfind_postgres psql -U postgres -c "DROP DATABASE lost_and_found;"
   docker exec -i cloudfind_postgres psql -U postgres -c "CREATE DATABASE lost_and_found;"
   ```
3. Restore the backup:
   ```bash
   cat ./backups/cloudfind_db_YYYYMMDD_HHMMSS.sql | docker exec -i cloudfind_postgres psql -U postgres -d lost_and_found
   ```

## 3. Post-Rollback Verification
1. Verify all containers are running and healthy:
   ```bash
   docker ps
   ```
2. Run the health check endpoint:
   ```bash
   curl -f http://localhost/api/v1/health
   ```
3. Execute the automated smoke tests if available.
