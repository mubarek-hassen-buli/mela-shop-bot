# Environment Variables Guide: Mela Shop

This document provides a comprehensive guide to configuring environment variables across all services in the **Mela Shop** platform.

---

## 1. Overview & Setup Instructions

Each subsystem requires its own environment file located directly within its respective root directory.

| Subsystem | File Location | Environment File Type | Purpose |
| :--- | :--- | :--- | :--- |
| **FastAPI Backend** | `backend/.env` | Runtime Environment | DB credentials, Telegram Secret, Cloudinary API, JWT Secret |
| **Telegram Bot** | `bot/.env` | Runtime Environment | Telegram Bot Token, WebApp URL |
| **Telegram Mini App** | `miniapp/.env.local` | Vite Build/Dev Config | Public API Base URL, Bot Username |
| **Admin Dashboard** | `admin/.env.local` | Next.js Build/Dev Config | Public API Base URL, App Secrets |

> [!CAUTION]
> Never commit actual `.env` or `.env.local` files containing real production passwords, tokens, or secret keys to source control. Always populate these files from the `.env.example` templates provided in each folder.

---

## 2. FastAPI Backend (`backend/.env`)

Location: [`backend/.env`](file:///c:/projects/mela-shop/backend/.env)

```ini
# ==============================================================================
# ENVIRONMENT & APPLICATION
# ==============================================================================
ENVIRONMENT=development
PROJECT_NAME="Mela Shop API"
API_V1_STR=/api/v1
SECRET_KEY=change_this_to_a_super_secret_random_32_byte_string
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173","https://your-admin-domain.com","https://your-miniapp-domain.com"]

# ==============================================================================
# DATABASE CONFIGURATION (MySQL)
# ==============================================================================
MYSQL_SERVER=localhost
MYSQL_PORT=3306
MYSQL_USER=melashop_user
MYSQL_PASSWORD=melashop_secure_password
MYSQL_DB=melashop_db

# SQLAlchemy Async Connection String
# Format: mysql+pymysql://user:password@host:port/dbname
DATABASE_URL=mysql+pymysql://melashop_user:melashop_secure_password@localhost:3306/melashop_db

# Connection Pool Settings
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=10
DB_POOL_TIMEOUT=30

# ==============================================================================
# AUTHENTICATION & TOKENS
# ==============================================================================
# JWT Access Token Lifetime in Minutes (e.g. 15 mins for Admin, 1440 for Mini App)
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
JWT_ALGORITHM=HS256

# ==============================================================================
# TELEGRAM BOT INTEGRATION
# ==============================================================================
# Bot Token obtained from Telegram @BotFather
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyZ

# Maximum allowed age (in seconds) for Telegram initData validation (default: 86400 = 24 hrs)
TELEGRAM_INIT_DATA_MAX_AGE=86400

# ==============================================================================
# CLOUDINARY MEDIA ENGINE
# ==============================================================================
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_URL=cloudinary://123456789012345:your_cloudinary_api_secret@your_cloudinary_cloud_name
```

---

## 3. Telegram Bot (`bot/.env`)

Location: [`bot/.env`](file:///c:/projects/mela-shop/bot/.env)

```ini
# ==============================================================================
# TELEGRAM BOT CONFIGURATION
# ==============================================================================
# Bot token from @BotFather (Must match TELEGRAM_BOT_TOKEN in backend)
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyZ

# HTTPS WebApp URL launched when pressing "Open Shop"
# (During local development, use your ngrok or localtunnel URL e.g. https://xxxx.ngrok-free.app)
MINI_APP_URL=https://your-miniapp-deployment-url.com

# Backend API URL for optional bot-to-backend communication
BACKEND_API_URL=http://localhost:8000/api/v1

# Environment mode (development / production)
BOT_ENV=development
```

---

## 4. Telegram Mini App (`miniapp/.env.local`)

Location: [`miniapp/.env.local`](file:///c:/projects/mela-shop/miniapp/.env.local)

> [!NOTE]
> In Vite applications, only environment variables prefixed with `VITE_` are exposed to the client-side JavaScript code.

```ini
# ==============================================================================
# TELEGRAM MINI APP CLIENT CONFIG
# ==============================================================================
# Base URL for the FastAPI Backend API
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Telegram Bot Username without @ symbol (used for deep linking & shop context)
VITE_TELEGRAM_BOT_USERNAME=MelaShopBot

# Mock Telegram WebApp for desktop browser testing (true / false)
VITE_ENABLE_MOCK_TELEGRAM=true
```

---

## 5. Admin Dashboard (`admin/.env.local`)

Location: [`admin/.env.local`](file:///c:/projects/mela-shop/admin/.env.local)

> [!NOTE]
> In Next.js applications, variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

```ini
# ==============================================================================
# NEXT.JS ADMIN DASHBOARD CONFIG
# ==============================================================================
# FastAPI Backend API endpoint accessed by Next.js client & server side
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# NextAuth / App Auth Secret Key
NEXTAUTH_SECRET=another_super_secret_32_byte_string_for_admin_session

# Canonical URL of the Admin Application
NEXTAUTH_URL=http://localhost:3000
```

---

## 6. Verification Checklist

Before starting the applications, verify that:
1. `TELEGRAM_BOT_TOKEN` in `backend/.env` is identical to `TELEGRAM_BOT_TOKEN` in `bot/.env`.
2. MySQL database server is running and database `melashop_db` exists.
3. `DATABASE_URL` credentials are correct and testable via `mysql -u melashop_user -p`.
4. Cloudinary Cloud Name, API Key, and API Secret match your Cloudinary console credentials.
5. `CORS_ORIGINS` in `backend/.env` includes `http://localhost:5173` (Mini App) and `http://localhost:3000` (Admin Dashboard).
