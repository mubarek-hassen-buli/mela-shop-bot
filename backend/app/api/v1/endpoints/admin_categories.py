from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.db.session import get_db
from app.core.exceptions import NotFoundException, ConflictException
from app.models.admin import Admin
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.schemas.common import MessageResponse

router = APIRouter(prefix="/admin/categories", tags=["Admin Categories"])


@router.get("", response_model=List[CategoryResponse])
async def list_admin_categories(
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    stmt = select(Category).options(selectinload(Category.children)).order_by(Category.name.asc())
    res = await db.execute(stmt)
    return [CategoryResponse.model_validate(c) for c in res.scalars().all()]


@router.post("", response_model=CategoryResponse)
async def create_category(
    payload: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    stmt = select(Category).where(Category.slug == payload.slug)
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        raise ConflictException(f"Category slug '{payload.slug}' already exists")

    category = Category(**payload.model_dump())
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return CategoryResponse.model_validate(category)


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    payload: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    stmt = select(Category).where(Category.id == category_id)
    res = await db.execute(stmt)
    category = res.scalar_one_or_none()
    if not category:
        raise NotFoundException("Category not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(category, field, val)

    await db.commit()
    await db.refresh(category)
    return CategoryResponse.model_validate(category)


@router.delete("/{category_id}", response_model=MessageResponse)
async def delete_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    stmt = select(Category).where(Category.id == category_id)
    res = await db.execute(stmt)
    category = res.scalar_one_or_none()
    if not category:
        raise NotFoundException("Category not found")

    await db.delete(category)
    await db.commit()
    return MessageResponse(message="Category deleted successfully")
