# Build stage - Frontend
FROM oven/bun:1 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/bun.lock ./
RUN bun install --frozen-lockfile
COPY frontend/ ./
ENV VITE_API_URL=/api
RUN bun run build

# Build stage - Backend dependencies
FROM composer:2 AS backend-build
WORKDIR /app
COPY backend/composer.json backend/composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Production stage
FROM php:8.2-fpm-alpine AS production

# Install dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    libpng-dev \
    libjpeg-turbo-dev \
    libwebp-dev \
    freetype-dev \
    oniguruma-dev \
    libxml2-dev \
    zip \
    unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install pdo pdo_mysql gd mbstring xml bcmath opcache

# Configure PHP for production
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

# Copy backend
WORKDIR /var/www/html
COPY backend/ ./
COPY --from=backend-build /app/vendor ./vendor

# Copy frontend build
COPY --from=frontend-build /app/frontend/dist ./public/frontend

# Copy nginx config
COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf

# Copy supervisor config
COPY docker/supervisor/supervisord.conf /etc/supervisord.conf

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Create startup script
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 80

CMD ["/start.sh"]
