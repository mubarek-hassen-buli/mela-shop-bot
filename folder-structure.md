
# Project Directory Structure: Mela Shop

This document outlines the standard, modular folder structure for the **Mela Shop** monorepo workspace.

---

## 1. Monorepo Overview

```text
mela-shop/
├── backend/               # FastAPI REST API & Database Service (Python 3.12+)
├── bot/                   # Telegram Bot Service (aiogram 3.x)
├── miniapp/               # Customer Telegram Mini App (React + Vite + TS)
├── admin/                 # Store Owner Admin Dashboard (Next.js 14+ App Router)
├── docker/                # Dockerfiles and Compose configurations
├── .dockerignore
├── .gitignore
├── docker-compose.yml     # Multi-service local orchestrator
├── env.md                 # Environment setup guide
├── folder-structure.md    # Folder structure guide (this file)
├── system.md              # High-level initial overview
├── system2.md             # Complete system architecture specification
└── README.md              # Project onboarding guide
```

---

## 2. Service Deep Dive

### 2.1 Backend (`backend/`) - FastAPI Application
Uses a domain-driven, feature-layered architecture with strict type hints, Pydantic schemas, and SQLAlchemy 2.0 ORM.

```text
backend/
├── alembic/                      # Alembic Database Migrations
│   ├── versions/                 # Migration script files
│   ├── env.py                    # Alembic environment config
│   └── script.py.mako            # Migration template
├── app/
│   ├── api/
│   │   ├── deps.py               # Dependency injection guards (Auth, DB session, Roles)
│   │   └── v1/
│   │       ├── api.py            # Main API v1 router aggregator
│   │       ├── endpoints/
│   │       │   ├── admin_auth.py # Admin authentication & refresh
│   │       │   ├── admin_products.py # Admin product CRUD & inventory
│   │       │   ├── admin_categories.py # Admin category management
│   │       │   ├── admin_brands.py # Admin brand management
│   │       │   ├── admin_media.py # Cloudinary image upload/delete
│   │       │   ├── tg_auth.py    # Telegram initData validation & login
│   │       │   ├── miniapp_catalog.py # Public products/categories query
│   │       │   └── miniapp_cart.py # Customer cart operations
│   ├── core/
│   │   ├── config.py             # Pydantic BaseSettings config
│   │   ├── security.py           # Password hashing (Argon2), JWT generation & Telegram HMAC
│   │   └── exceptions.py         # Custom HTTP exceptions & global error handlers
│   ├── db/
│   │   ├── session.py            # SQLAlchemy Async Engine & SessionLocal factory
│   │   └── base.py               # Base Declarative Meta for ORM models
│   ├── models/                   # SQLAlchemy 2.0 ORM Models
│   │   ├── __init__.py
│   │   ├── user.py               # Customer model
│   │   ├── admin.py              # Store owner / admin model
│   │   ├── category.py           # Category model
│   │   ├── brand.py              # Brand model
│   │   ├── product.py            # Product model
│   │   ├── product_variant.py    # Variant, color, specs models
│   │   ├── product_image.py      # Cloudinary image metadata model
│   │   └── cart.py               # Cart item model
│   ├── schemas/                  # Pydantic v2 DTO Data Contracts
│   │   ├── user.py
│   │   ├── admin.py
│   │   ├── category.py
│   │   ├── brand.py
│   │   ├── product.py
│   │   ├── cart.py
│   │   └── common.py             # Paginated response schemas, generic error contracts
│   ├── services/                 # Complex Business Logic & External Integrations
│   │   ├── cloudinary_service.py # Cloudinary SDK wrapper for uploads & signatures
│   │   ├── telegram_auth_service.py # initData hash validation
│   │   └── cart_service.py       # Cart math & stock validation
│   └── main.py                   # FastAPI application initialization & middleware setup
├── tests/                        # Pytest Test Suite
│   ├── conftest.py               # Fixtures (test DB session, test client)
│   ├── api/                      # Endpoint integration tests
│   └── unit/                     # Business logic unit tests
├── .env.example
├── alembic.ini                   # Alembic configuration
├── Dockerfile
├── pyproject.toml                # Dependencies & Poetry/UV/Pipenv configuration
└── requirements.txt              # Standard Python requirements
```

---

### 2.2 Telegram Bot (`bot/`) - Aiogram 3 Service
Handles Telegram command listening and opens the Telegram Mini App.

```text
bot/
├── bot/
│   ├── handlers/
│   │   ├── __init__.py
│   │   ├── start.py              # /start handler & welcome message
│   │   ├── help.py               # /help & support commands
│   │   └── shop.py               # /shop inline button handler
│   ├── keyboards/
│   │   ├── inline.py             # WebApp button & custom inline keyboards
│   │   └── reply.py              # Main menu reply keyboard
│   ├── middlewares/
│   │   ├── logging.py            # Request/event logging middleware
│   │   └── auth_check.py         # User status check middleware
│   ├── config.py                 # Bot env settings & validation
│   └── main.py                   # Bot launcher & polling/webhook loop
├── .env.example
├── Dockerfile
└── requirements.txt              # Aiogram 3, pydantic, httpx
```

---

### 2.3 Customer Telegram Mini App (`miniapp/`) - React + Vite
Customer-facing shopping web application optimized for inside-Telegram mobile rendering.

```text
miniapp/
├── public/                       # Static assets & icons
│   └── favicon.ico
├── src/
│   ├── assets/                   # SVG icons, banner placeholders
│   ├── components/               # UI Components
│   │   ├── common/               # Headers, BottomNav, LoadingSpinner, ErrorBoundary
│   │   ├── catalog/              # ProductCard, CategoryList, BrandFilter, SearchBar
│   │   ├── product/              # ImageCarousel, VariantSelector, SpecTable
│   │   └── cart/                 # CartItemRow, CartSummary, QuantityPicker
│   ├── hooks/                    # Custom React Hooks
│   │   ├── useTelegram.ts        # Telegram Mini App SDK wrapper hook
│   │   ├── useProducts.ts        # TanStack Query hooks for catalog
│   │   └── useCart.ts            # Cart state query/mutation hooks
│   ├── pages/                    # Main Views / Screens
│   │   ├── HomePage.tsx          # Catalog landing & search screen
│   │   ├── ProductDetailPage.tsx # Single product details screen
│   │   ├── CartPage.tsx          # Cart overview screen
│   │   └── ProfilePage.tsx       # User profile screen
│   ├── services/                 # API Clients
│   │   ├── api.ts                # Axios instance with Auth intercepter
│   │   ├── catalogApi.ts         # Catalog fetch methods
│   │   └── cartApi.ts            # Cart sync methods
│   ├── store/                    # Zustand Client State
│   │   └── cartStore.ts          # Local cart transient state
│   ├── types/                    # TypeScript Data Interfaces
│   │   ├── telegram.d.ts         # Telegram WebApp types declaration
│   │   ├── product.ts            # Product, Variant, Color interfaces
│   │   └── cart.ts               # Cart item types
│   ├── utils/                    # Utility Functions
│   │   ├── formatters.ts         # Currency & text formatting helpers
│   │   └── constants.ts          # Config constants & defaults
│   ├── App.tsx                   # Main App Component & Router
│   ├── index.css                 # Tailwind CSS imports & global styles
│   └── main.tsx                  # Vite DOM entrypoint
├── .env.example
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

### 2.4 Store Owner Admin Dashboard (`admin/`) - Next.js App Router
Web application for store managers to add products, control stock, manage categories/brands, and view customers.

```text
admin/
├── src/
│   ├── app/                      # Next.js App Router Pages
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx      # Admin login screen
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx        # Dashboard wrapper with Sidebar & TopBar
│   │   │   ├── page.tsx          # Metrics & analytics summary page
│   │   │   ├── products/
│   │   │   │   ├── page.tsx      # Product data table list view
│   │   │   │   ├── create/
│   │   │   │   │   └── page.tsx  # Create product page
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  # Edit product page
│   │   │   ├── categories/
│   │   │   │   └── page.tsx      # Categories manager
│   │   │   ├── brands/
│   │   │   │   └── page.tsx      # Brands manager
│   │   │   └── customers/
│   │   │       └── page.tsx      # Telegram customer list view
│   │   ├── layout.tsx            # Root layout (Providers, Fonts, Metadata)
│   │   └── globals.css           # Global Tailwind CSS styles
│   ├── components/               # Dashboard Components
│   │   ├── ui/                   # shadcn/ui primitives (Button, Input, Dialog, Table)
│   │   ├── layout/               # Sidebar, Header, UserMenu
│   │   ├── forms/                # ProductForm, CategoryForm, BrandForm
│   │   └── media/                # Cloudinary uploader widget component
│   ├── hooks/                    # Custom React hooks
│   │   └── useAdminAuth.ts       # Auth status & token management
│   ├── lib/                      # Infrastructure helpers
│   │   ├── axios.ts              # Axios instance with refresh token handling
│   │   └── utils.ts              # Classnames merger (clsx + tailwind-merge)
│   ├── services/                 # API communication functions
│   │   ├── authService.ts
│   │   ├── productService.ts
│   │   └── mediaService.ts
│   └── types/                    # Admin DTO TypeScript types
│       ├── api.ts
│       └── product.ts
├── .env.example
├── next.config.js
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## 3. Organizational Rules & Coding Standards

1. **Feature Separation**: Keep business logic in `services/`, database operations in `crud/` or models, and endpoint routing concise in `endpoints/` or `app/`.
2. **Type Safety & Validation**:
   - Backend APIs must validate payload shapes via Pydantic schemas.
   - Frontends (`miniapp` & `admin`) must enforce runtime validation using Zod for forms and API responses.
3. **No Direct Production Database Writes**: Database schema changes MUST be introduced strictly via Alembic migration scripts (`backend/alembic/versions`).
