FROM ubuntu:24.04

ARG NODE_VERSION=20
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Instalación de dependencias básicas y PHP
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    git \
    ca-certificates \
    gnupg \
    && mkdir -p /etc/apt/keyrings \
    && curl -sS 'https://keyserver.ubuntu.com/pks/lookup?op=get&search=0xb8dc7e53946656efbce4c1dd71daeaab4ad4cab6' | gpg --dearmor -o /etc/apt/keyrings/ppa_ondrej_php.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/ppa_ondrej_php.gpg] https://ppa.launchpadcontent.net/ondrej/php/ubuntu noble main" > /etc/apt/sources.list.d/ppa_ondrej_php.list \
    && apt-get update \
    && apt-get install -y \
    php8.3-cli php8.3-curl php8.3-mbstring php8.3-xml php8.3-zip \
    php8.3-bcmath php8.3-mysql php8.3-sqlite3 php8.3-pdo \
    php8.3-tokenizer php8.3-intl \
    && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
    && curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 1. Establecer el directorio de trabajo
WORKDIR /var/www/html

# 2. COPIAR los archivos de tu proyecto al contenedor
COPY . .

# 3. Instalar dependencias de PHP (Composer)
RUN composer install --no-interaction --optimize-autoloader --no-dev

# 4. Instalar dependencias de JS y compilar Inertia/React
RUN npm install && npm run build

# 5. Permisos necesarios para Laravel
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Railway usa la variable de entorno PORT dinámicamente
EXPOSE 8000

# Usamos la variable $PORT de Railway si está disponible, sino 8000
CMD ["sh", "-c", "php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"]