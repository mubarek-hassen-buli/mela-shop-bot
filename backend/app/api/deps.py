from typing import Optional
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_token
from app.core.exceptions import UnauthorizedException, ForbiddenException
from app.db.session import get_db
from app.models.admin import Admin
from app.models.user import User

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl="/api/v1/admin/auth/login",
    auto_error=False
)


async def get_current_admin(
    token: Optional[str] = Depends(reusable_oauth2),
    db: AsyncSession = Depends(get_db)
) -> Admin:
    if not token:
        raise UnauthorizedException("Missing access token")

    payload = decode_token(token)
    if not payload or payload.get("type") != "access" or payload.get("role") not in ["admin", "superadmin"]:
        raise UnauthorizedException("Invalid admin authentication token")

    admin_id_str = payload.get("sub")
    if not admin_id_str or not admin_id_str.isdigit():
        raise UnauthorizedException("Invalid token subject")

    stmt = select(Admin).where(Admin.id == int(admin_id_str))
    res = await db.execute(stmt)
    admin = res.scalar_one_or_none()

    if not admin or not admin.is_active:
        raise UnauthorizedException("Admin user inactive or not found")

    return admin


async def get_current_user(
    token: Optional[str] = Depends(reusable_oauth2),
    db: AsyncSession = Depends(get_db)
) -> User:
    if not token:
        raise UnauthorizedException("Missing access token")

    payload = decode_token(token)
    if not payload or payload.get("type") != "access" or payload.get("role") != "user":
        raise UnauthorizedException("Invalid user authentication token")

    user_id_str = payload.get("sub")
    if not user_id_str or not user_id_str.isdigit():
        raise UnauthorizedException("Invalid token subject")

    stmt = select(User).where(User.id == int(user_id_str))
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user:
        raise UnauthorizedException("User not found")

    return user
