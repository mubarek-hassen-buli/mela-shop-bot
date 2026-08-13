from fastapi import APIRouter

from app.api.v1.endpoints import (
    tg_auth,
    admin_auth,
    admin_dashboard,
    admin_categories,
    admin_brands,
    admin_products,
    admin_media,
    admin_customers,
    miniapp_catalog,
    miniapp_cart,
)

api_router = APIRouter()

# Telegram & Public Customer Endpoints
api_router.include_router(tg_auth.router)
api_router.include_router(miniapp_catalog.router)
api_router.include_router(miniapp_cart.router)

# Store Owner Admin Endpoints
api_router.include_router(admin_auth.router)
api_router.include_router(admin_dashboard.router)
api_router.include_router(admin_categories.router)
api_router.include_router(admin_brands.router)
api_router.include_router(admin_products.router)
api_router.include_router(admin_media.router)
api_router.include_router(admin_customers.router)
