System Overview

The system consists of four main parts:

1. Telegram Bot

The Telegram bot is the entry point for customers. Users open the bot and press Open Shop, which launches the Telegram Mini App.

The bot is built with Python + aiogram.

2. Telegram Mini App

The Mini App is the customer-facing shopping interface running inside Telegram.

Built with:

React
TypeScript
Vite
Tailwind CSS
Telegram Mini App SDK
TanStack Query
Zustand
Axios
Zod

Customers can:

Browse products
Browse categories
Search products
View product details
View product images
Select colors
Select product variants
View specifications
Add/remove products from cart
Change cart quantities
View their profile

There is no payment, checkout, reviews, comments, or ratings in V1.

3. FastAPI Backend

The FastAPI backend is the central application layer connecting the Mini App, Admin Dashboard, Telegram, and database.

It handles:

Telegram authentication
User management
Products
Categories
Brands
Product variants
Product images
Inventory
Cart management
Admin authentication
Admin operations
Cloudinary integration
API validation
Business logic

Technology:

Python 3.12+
FastAPI
SQLAlchemy 2
Pydantic
Alembic
PyMySQL
Uvicorn
HTTPX

The backend exposes a REST API consumed by both the Mini App and Admin Dashboard.

4. Admin Dashboard

The Admin Dashboard is a separate web application used by the shop owner/admin.

Built with:

Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
TanStack Query
React Hook Form
Zod
Axios

Admin functionality:

Dashboard overview
Create products
Edit products
Delete/deactivate products
Manage categories
Manage brands
Manage product variants
Manage colors
Manage specifications
Manage inventory
Upload/manage product images
View customers
Manage admin settings
Data Layer

The main database is MySQL.

SQLAlchemy handles database access and Alembic handles migrations.

Main entities:

Users
Admins
Products
Categories
Brands
Product Variants
Product Images
Cart Items

Product images are stored in Cloudinary, while their URLs and metadata are stored in MySQL.

Authentication

Customers authenticate through Telegram.

The Mini App receives Telegram's initData, sends it to FastAPI, and the backend validates the Telegram authentication data before creating/finding the corresponding user.

Admins use a separate admin authentication system.

Overall Request Flow

Customer:

Telegram → Bot → Mini App → FastAPI → MySQL/Cloudinary

Admin:

Admin Dashboard → FastAPI → MySQL/Cloudinary

Telegram authentication:

Telegram → Mini App → initData → FastAPI → User

Product management:

Admin Dashboard → FastAPI → MySQL + Cloudinary → Mini App