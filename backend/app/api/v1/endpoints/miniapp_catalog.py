from typing import Optional, List
from math import ceil
from decimal import Decimal
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.exceptions import NotFoundException
from app.models.category import Category
from app.models.brand import Brand
from app.models.product import Product
from app.models.product_variant import ProductVariant
from app.schemas.category import CategoryResponse
from app.schemas.brand import BrandResponse
from app.schemas.product import ProductResponse
from app.schemas.common import PaginatedResponse

router = APIRouter(tags=["Mini App Catalog"])


@router.get("/categories", response_model=List[CategoryResponse])
async def get_public_categories(
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Category).where(Category.is_active.is_(True), Category.parent_id.is_(None)).options(
        selectinload(Category.children)
    ).order_by(Category.display_order.asc(), Category.id.asc())
    res = await db.execute(stmt)
    return [CategoryResponse.model_validate(c) for c in res.scalars().all()]


@router.get("/brands", response_model=List[BrandResponse])
async def get_public_brands(
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Brand).where(Brand.is_active.is_(True)).order_by(Brand.name.asc())
    res = await db.execute(stmt)
    return [BrandResponse.model_validate(b) for b in res.scalars().all()]


@router.get("/products", response_model=PaginatedResponse[ProductResponse])
async def get_public_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    brand_id: Optional[int] = None,
    min_price: Optional[Decimal] = None,
    max_price: Optional[Decimal] = None,
    sort_by: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Product).where(Product.is_active.is_(True)).options(
        selectinload(Product.category),
        selectinload(Product.variants),
        selectinload(Product.images)
    )

    if search:
        stmt = stmt.where(Product.title.ilike(f"%{search}%") | Product.description.ilike(f"%{search}%"))
    if category_id:
        stmt = stmt.where(Product.category_id == category_id)
    if brand_id:
        stmt = stmt.where(Product.brand_id == brand_id)

    # Price range filtering via EXISTS subquery
    if min_price is not None or max_price is not None:
        v_conditions = [ProductVariant.product_id == Product.id, ProductVariant.is_active.is_(True)]
        if min_price is not None:
            v_conditions.append(ProductVariant.price >= min_price)
        if max_price is not None:
            v_conditions.append(ProductVariant.price <= max_price)
        stmt = stmt.where(select(ProductVariant.id).where(*v_conditions).exists())

    # Count total matching records
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = (await db.execute(count_stmt)).scalar_one()

    # Price sorting via correlated group_by subquery
    if sort_by == "price_asc":
        price_subquery = (
            select(
                ProductVariant.product_id,
                func.min(ProductVariant.price).label("sort_price")
            )
            .where(ProductVariant.is_active.is_(True))
            .group_by(ProductVariant.product_id)
            .subquery()
        )
        stmt = stmt.outerjoin(price_subquery, Product.id == price_subquery.c.product_id).order_by(
            price_subquery.c.sort_price.asc(), Product.id.desc()
        )
    elif sort_by == "price_desc":
        price_subquery = (
            select(
                ProductVariant.product_id,
                func.max(ProductVariant.price).label("sort_price")
            )
            .where(ProductVariant.is_active.is_(True))
            .group_by(ProductVariant.product_id)
            .subquery()
        )
        stmt = stmt.outerjoin(price_subquery, Product.id == price_subquery.c.product_id).order_by(
            price_subquery.c.sort_price.desc(), Product.id.desc()
        )
    else:
        stmt = stmt.order_by(Product.id.desc())

    offset = (page - 1) * page_size
    stmt = stmt.offset(offset).limit(page_size)
    res = await db.execute(stmt)
    products = res.scalars().all()

    total_pages = ceil(total / page_size) if total > 0 else 0

    return PaginatedResponse[ProductResponse](
        items=[ProductResponse.model_validate(p) for p in products],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/products/{slug}", response_model=ProductResponse)
async def get_public_product_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Product).where(Product.slug == slug, Product.is_active.is_(True)).options(
        selectinload(Product.category),
        selectinload(Product.brand),
        selectinload(Product.variants).selectinload(ProductVariant.color),
        selectinload(Product.images),
        selectinload(Product.specifications)
    )
    product = (await db.execute(stmt)).scalar_one_or_none()

    if not product:
        raise NotFoundException("Product not found")

    return ProductResponse.model_validate(product)
