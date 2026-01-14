# Coolify Deployment Guide - Pertamak

Domain: `pertamak.ilham.wtf`

## Prerequisites
- Push code ke GitHub/GitLab repository
- Coolify instance sudah berjalan

## Deployment Steps

### 1. Create New Service di Coolify
- Login ke Coolify dashboard
- Create new **Resource** → **Docker Compose**
- Connect ke repository

### 2. Environment Variables
Set environment variables berikut di Coolify:

```env
APP_NAME=Pertamak
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:xxx  # Generate dengan: php artisan key:generate --show
APP_URL=https://pertamak.ilham.wtf

DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=pertamak
DB_USERNAME=pertamak
DB_PASSWORD=your_secure_password

MYSQL_ROOT_PASSWORD=your_root_password
```

### 3. Network & Domain
- Set domain: `pertamak.ilham.wtf`
- Exposed port: **80**
- Enable HTTPS (Coolify will auto-provision SSL)

### 4. Volumes (Persistence)
Pastikan volumes terdefinisi:
- `mysql_data` - MySQL database
- `storage` - Laravel storage/uploads

### 5. Deploy
Klik **Deploy** dan tunggu build selesai.

## Troubleshooting

### Check Logs
```bash
# Via Coolify UI atau SSH
docker logs <container_id>
```

### Database Migration Manual
```bash
docker exec -it <container_id> php artisan migrate --force
```

### Clear Cache
```bash
docker exec -it <container_id> php artisan cache:clear
docker exec -it <container_id> php artisan config:clear
```
