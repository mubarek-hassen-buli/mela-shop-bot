from typing import Optional
from math import ceil
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.db.session import get_db
from app.models.admin import Admin
from app.models.user import User
from app.schemas.user import UserResponse
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/admin/customers", tags=["Admin Customers"])


@router.get("", response_model=PaginatedResponse[UserResponse])
async def list_admin_customers(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    stmt = select(User)
    if search:
        stmt = stmt.where(
            User.first_name.ilike(f"%{search}%") |
            User.last_name.ilike(f"%{search}%") |
            User.username.ilike(f"%{search}%")
        )

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = (await db.execute(count_stmt)).scalar_one()

    offset = (page - 1) * page_size
    stmt = stmt.offset(offset).limit(page_size).order_by(User.id.desc())
    res = await db.execute(stmt)
    users = res.scalars().all()

    total_pages = ceil(total / page_size) if total > 0 else 0

    return PaginatedResponse[UserResponse](
        items=[UserResponse.model_validate(u) for u in users],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )
