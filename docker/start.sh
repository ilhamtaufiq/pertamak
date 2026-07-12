#!/bin/sh
set -e

cd /var/www/html

# Generate app key if not set
if [ -z "$APP_KEY" ]; then
    php artisan key:generate --force
fi

# Cache config for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations only (safe on redeploy — does not wipe data)
php artisan migrate --force

# Seeding is OFF by default. First install only:
#   set RUN_SEEDERS=true in Coolify env, or run manually:
#   php artisan db:seed --force
if [ "${RUN_SEEDERS:-false}" = "true" ]; then
    echo "[pertamak] RUN_SEEDERS=true — running db:seed"
    php artisan db:seed --force
else
    echo "[pertamak] skipping db:seed (set RUN_SEEDERS=true to enable once)"
fi

# Create storage link
php artisan storage:link --force 2>/dev/null || true

# Fix permissions
chown -R www-data:www-data storage bootstrap/cache

# Start supervisor
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
