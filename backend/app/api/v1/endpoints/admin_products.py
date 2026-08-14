from typing import Optional, List
from math import ceil
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, delete
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.db.session import get_db
from app.core.exceptions import NotFoundException, ConflictException
from app.core.events import event_manager
from app.models.admin import Admin
from app.models.product import Product
from app.models.product_variant import Color, ProductVariant, ProductSpecification
from app.models.product_image import ProductImage
from app.schemas.product import (
    ProductCreate, ProductUpdate, ProductResponse,
    ColorCreate, ColorResponse,
    ProductVariantCreate, ProductVariantUpdate, ProductVariantResponse
)
from app.schemas.common import PaginatedResponse, MessageResponse

router = APIRouter(prefix="/admin/products", tags=["Admin Products"])


# --- Color endpoints ---
@router.get("/colors", response_model=List[ColorResponse])
async def list_colors(
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    stmt = select(Color).order_by(Color.name.asc())
    res = await db.execute(stmt)
    return [ColorResponse.model_validate(c) for c in res.scalars().all()]


@router.post("/colors", response_model=ColorResponse)
async def create_color(
    payload: ColorCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    color = Color(**payload.model_dump())
    db.add(color)
    await db.commit()
    await db.refresh(color)
    return ColorResponse.model_validate(color)


# --- Product endpoints ---
@router.get("", response_model=PaginatedResponse[ProductResponse])
async def list_admin_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    brand_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    stmt = select(Product).options(
        selectinload(Product.category),
        selectinload(Product.brand),
        selectinload(Product.variants).selectinload(ProductVariant.color),
        selectinload(Product.images),
        selectinload(Product.specifications)
    )

    if search:
        stmt = stmt.where(Product.title.ilike(f"%{search}%") | Product.slug.ilike(f"%{search}%"))
    if category_id:
        stmt = stmt.where(Product.category_id == category_id)
    if brand_id:
        stmt = stmt.where(Product.brand_id == brand_id)

    # Count total
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = (await db.execute(count_stmt)).scalar_one()

    # Paginate
    offset = (page - 1) * page_size
    stmt = stmt.offset(offset).limit(page_size).order_by(Product.id.desc())
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


@router.post("", response_model=ProductResponse)
async def create_product(
    payload: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    stmt = select(Product).where(Product.slug == payload.slug)
    if (await db.execute(stmt)).scalar_one_or_none():
        raise ConflictException(f"Product slug '{payload.slug}' already exists")

    product = Product(
        title=payload.title,
        slug=payload.slug,
        description=payload.description,
        category_id=payload.category_id,
        brand_id=payload.brand_id,
        is_active=payload.is_active
    )
    db.add(product)
    await db.flush()

    # Check variant SKU uniqueness
    for v in payload.variants:
        sku_stmt = select(ProductVariant).where(ProductVariant.sku == v.sku)
        if (await db.execute(sku_stmt)).scalar_one_or_none():
            raise ConflictException(f"Variant SKU '{v.sku}' already exists. Please use a unique SKU.")

    # Add variants
    for v in payload.variants:
        variant = ProductVariant(
            product_id=product.id,
            sku=v.sku,
            color_id=v.color_id,
            size=v.size,
            price=v.price,
            compare_at_price=v.compare_at_price,
            stock_quantity=v.stock_quantity,
            is_active=v.is_active
        )
        db.add(variant)

    # Add images
    for img in payload.images:
        image = ProductImage(
            product_id=product.id,
            cloudinary_public_id=img.cloudinary_public_id,
            url=img.url,
            display_order=img.display_order,
            is_primary=img.is_primary
        )
        db.add(image)

    # Add specifications
    for spec in payload.specifications:
        sp = ProductSpecification(
            product_id=product.id,
            spec_key=spec.spec_key,
            spec_value=spec.spec_value
        )
        db.add(sp)

    await db.commit()

    # Re-fetch with full relations
    refetch_stmt = select(Product).where(Product.id == product.id).options(
        selectinload(Product.category),
        selectinload(Product.brand),
        selectinload(Product.variants).selectinload(ProductVariant.color),
        selectinload(Product.images),
        selectinload(Product.specifications)
    )
    product_full = (await db.execute(refetch_stmt)).scalar_one()

    await event_manager.broadcast("CATALOG_UPDATED", {"entity": "product", "action": "create", "id": product.id})

    return ProductResponse.model_validate(product_full)


@router.get("/{product_id}", response_model=ProductResponse)
async def get_admin_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    stmt = select(Product).where(Product.id == product_id).options(
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


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    stmt = select(Product).where(Product.id == product_id)
    product = (await db.execute(stmt)).scalar_one_or_none()
    if not product:
        raise NotFoundException("Product not found")

    update_data = payload.model_dump(exclude_unset=True)
    
    # Extract nested collections if provided
    variants_data = update_data.pop("variants", None)
    images_data = update_data.pop("images", None)
    specs_data = update_data.pop("specifications", None)

    for field, val in update_data.items():
        setattr(product, field, val)

    # Sync variants if supplied
    if variants_data is not None:
        await db.execute(delete(ProductVariant).where(ProductVariant.product_id == product_id))
        for var in variants_data:
            db.add(ProductVariant(product_id=product_id, **var))

    # Sync images if supplied
    if images_data is not None:
        await db.execute(delete(ProductImage).where(ProductImage.product_id == product_id))
        for img in images_data:
            db.add(ProductImage(product_id=product_id, **img))

    # Sync specifications if supplied
    if specs_data is not None:
        await db.execute(delete(ProductSpecification).where(ProductSpecification.product_id == product_id))
        for sp in specs_data:
            db.add(ProductSpecification(product_id=product_id, **sp))

    await db.commit()

    refetch_stmt = select(Product).where(Product.id == product_id).options(
        selectinload(Product.category),
        selectinload(Product.brand),
        selectinload(Product.variants).selectinload(ProductVariant.color),
        selectinload(Product.images),
        selectinload(Product.specifications)
    )
    product_full = (await db.execute(refetch_stmt)).scalar_one()

    await event_manager.broadcast("CATALOG_UPDATED", {"entity": "product", "action": "update", "id": product_id})

    return ProductResponse.model_validate(product_full)


@router.patch("/{product_id}/toggle-status", response_model=ProductResponse)
async def toggle_product_status(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    stmt = select(Product).where(Product.id == product_id)
    product = (await db.execute(stmt)).scalar_one_or_none()
    if not product:
        raise NotFoundException("Product not found")

    product.is_active = not product.is_active
    await db.commit()

    refetch_stmt = select(Product).where(Product.id == product_id).options(
        selectinload(Product.category),
        selectinload(Product.brand),
        selectinload(Product.variants).selectinload(ProductVariant.color),
        selectinload(Product.images),
        selectinload(Product.specifications)
    )
    product_full = (await db.execute(refetch_stmt)).scalar_one()

    await event_manager.broadcast(
        "CATALOG_UPDATED", 
        {"entity": "product", "action": "toggle", "id": product_id, "is_active": product_full.is_active}
    )

    return ProductResponse.model_validate(product_full)


@router.delete("/{product_id}", response_model=MessageResponse)
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    stmt = select(Product).where(Product.id == product_id)
    product = (await db.execute(stmt)).scalar_one_or_none()
    if not product:
        raise NotFoundException("Product not found")

    await db.delete(product)
    await db.commit()

    await event_manager.broadcast("CATALOG_UPDATED", {"entity": "product", "action": "delete", "id": product_id})

    return MessageResponse(message="Product deleted successfully")
