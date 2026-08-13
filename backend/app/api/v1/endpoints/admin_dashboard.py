from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.db.session import get_db
from app.models.admin import Admin
from app.models.product import Product
from app.models.category import Category
from app.models.brand import Brand
from app.models.user import User
from app.models.product_variant import ProductVariant

router = APIRouter(prefix="/admin/dashboard", tags=["Admin Dashboard"])


@router.get("/stats")
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
) -> Dict[str, Any]:
    total_products = (await db.execute(select(func.count(Product.id)))).scalar_one()
    total_categories = (await db.execute(select(func.count(Category.id)))).scalar_one()
    total_brands = (await db.execute(select(func.count(Brand.id)))).scalar_one()
    total_customers = (await db.execute(select(func.count(User.id)))).scalar_one()

    # Low stock items (< 5)
    low_stock_count = (await db.execute(select(func.count(ProductVariant.id)).where(ProductVariant.stock_quantity <= 5))).scalar_one()

    return {
        "total_products": total_products,
        "total_categories": total_categories,
        "total_brands": total_brands,
        "total_customers": total_customers,
        "low_stock_variants": low_stock_count
    }
