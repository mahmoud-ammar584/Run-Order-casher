# Run Order - Deployment Guide

This guide provides step-by-step instructions for deploying the **Run Order** system to a production environment.

## Prerequisites

- **Server**: Ubuntu 22.04 LTS (recommended).
- **Node.js**: Version 20.x or later.
- **PostgreSQL**: Version 14 or later.
- **Nginx**: For reverse proxy.
- **PM2**: For process management.

## 1. Backend Deployment

1. **Install Dependencies**:
   ```bash
   cd Run_Order-backend
   npm ci
   ```

2. **Build**:
   ```bash
   npm run build
   ```

3. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Edit .env with production database credentials
   ```

4. **Run Migrations**:
   ```bash
   npm run typeorm migration:run
   ```

5. **Start Service**:
   ```bash
   pm2 start dist/main.js --name "run-order-api"
   ```

## 2. Frontend Deployment

1. **Install Dependencies**:
   ```bash
   cd Run_Order-frontend
   npm ci
   ```

2. **Build**:
   ```bash
   npm run build
   ```

3. **Serve**:
   - Serve the `dist/` folder using Nginx.

## 3. Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /var/www/run-order/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```
