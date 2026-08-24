from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.db.session import get_db
from app.core.exceptions import NotFoundException, ConflictException
from app.core.events import event_manager
from app.models.admin import Admin
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse, CategoryReorderPayload
from app.schemas.common import MessageResponse

router = APIRouter(prefix="/admin/categories", tags=["Admin Categories"])


@router.get("", response_model=List[CategoryResponse])
async def list_admin_categories(
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    stmt = select(Category).options(selectinload(Category.children)).order_by(Category.display_order.asc(), Category.id.asc())
    res = await db.execute(stmt)
    return [CategoryResponse.model_validate(c) for c in res.scalars().all()]


@router.put("/reorder", response_model=MessageResponse)
async def reorder_categories(
    payload: CategoryReorderPayload,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    for index, cat_id in enumerate(payload.category_ids):
        stmt = select(Category).where(Category.id == cat_id)
        res = await db.execute(stmt)
        cat = res.scalar_one_or_none()
        if cat:
            cat.display_order = index

    await db.commit()
    await event_manager.broadcast("CATALOG_UPDATED", {"entity": "category", "action": "reorder"})
    return MessageResponse(message="Categories reordered successfully")


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

    refetch_stmt = select(Category).where(Category.id == category.id).options(selectinload(Category.children))
    category_full = (await db.execute(refetch_stmt)).scalar_one()

    await event_manager.broadcast("CATALOG_UPDATED", {"entity": "category", "action": "create", "id": category.id})

    return CategoryResponse.model_validate(category_full)


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
    refetch_stmt = select(Category).where(Category.id == category.id).options(selectinload(Category.children))
    category_full = (await db.execute(refetch_stmt)).scalar_one()

    await event_manager.broadcast("CATALOG_UPDATED", {"entity": "category", "action": "update", "id": category_id})

    return CategoryResponse.model_validate(category_full)


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

    await event_manager.broadcast("CATALOG_UPDATED", {"entity": "category", "action": "delete", "id": category_id})

    return MessageResponse(message="Category deleted successfully")
