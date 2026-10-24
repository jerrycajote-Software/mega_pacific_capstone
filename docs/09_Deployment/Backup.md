# Database Backup & Recovery Procedures

## 1. Automated PostgreSQL Backups

Use `pg_dump` to perform daily automated database snapshots.

### Dump Command
```bash
pg_dump -U postgres -h localhost -d megaroof_db -F c -b -v -f "/backups/megaroof_$(date +%Y%m%d_%H%M%S).dump"
```

---

## 2. Restoration Procedure

In the event of database corruption or data loss:

1. Re-create the empty database:
   ```sql
   DROP DATABASE megaroof_db;
   CREATE DATABASE megaroof_db;
   ```
2. Restore from backup dump:
   ```bash
   pg_restore -U postgres -h localhost -d megaroof_db -v "/backups/target_backup.dump"
   ```
3. Run `npx prisma generate` on the backend server to ensure Prisma client state aligns.
