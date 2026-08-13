from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.db.session import get_db
from app.core.exceptions import NotFoundException, ConflictException
from app.models.admin import Admin
from app.models.brand import Brand
from app.schemas.brand import BrandCreate, BrandUpdate, BrandResponse
from app.schemas.common import MessageResponse

router = APIRouter(prefix="/admin/brands", tags=["Admin Brands"])


@router.get("", response_model=List[BrandResponse])
async def list_admin_brands(
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    stmt = select(Brand).order_by(Brand.name.asc())
    res = await db.execute(stmt)
    return [BrandResponse.model_validate(b) for b in res.scalars().all()]


@router.post("", response_model=BrandResponse)
async def create_brand(
    payload: BrandCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    stmt = select(Brand).where(Brand.slug == payload.slug)
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        raise ConflictException(f"Brand slug '{payload.slug}' already exists")

    brand = Brand(**payload.model_dump())
    db.add(brand)
    await db.commit()
    await db.refresh(brand)
    return BrandResponse.model_validate(brand)


@router.put("/{brand_id}", response_model=BrandResponse)
async def update_brand(
    brand_id: int,
    payload: BrandUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    stmt = select(Brand).where(Brand.id == brand_id)
    res = await db.execute(stmt)
    brand = res.scalar_one_or_none()
    if not brand:
        raise NotFoundException("Brand not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(brand, field, val)

    await db.commit()
    await db.refresh(brand)
    return BrandResponse.model_validate(brand)


@router.delete("/{brand_id}", response_model=MessageResponse)
async def delete_brand(
    brand_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    stmt = select(Brand).where(Brand.id == brand_id)
    res = await db.execute(stmt)
    brand = res.scalar_one_or_none()
    if not brand:
        raise NotFoundException("Brand not found")

    await db.delete(brand)
    await db.commit()
    return MessageResponse(message="Brand deleted successfully")
