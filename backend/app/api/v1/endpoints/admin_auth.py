from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import verify_password, create_access_token, create_refresh_token, decode_token
from app.core.exceptions import UnauthorizedException
from app.db.session import get_db
from app.api.deps import get_current_admin
from app.models.admin import Admin
from app.schemas.admin import AdminLoginRequest, AdminTokenResponse, AdminResponse

router = APIRouter(prefix="/admin/auth", tags=["Admin Auth"])


@router.post("/login", response_model=AdminTokenResponse)
async def admin_login(
    payload: AdminLoginRequest,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Admin).where(Admin.email == payload.email.lower().strip())
    res = await db.execute(stmt)
    admin = res.scalar_one_or_none()

    if not admin or not verify_password(payload.password, admin.password_hash):
        raise UnauthorizedException("Invalid email or password")

    if not admin.is_active:
        raise UnauthorizedException("Admin account is inactive")

    access_token = create_access_token(subject=admin.id, role=admin.role)
    return AdminTokenResponse(
        access_token=access_token,
        token_type="bearer",
        admin=AdminResponse.model_validate(admin)
    )


@router.get("/me", response_model=AdminResponse)
async def get_admin_profile(
    current_admin: Admin = Depends(get_current_admin)
):
    return AdminResponse.model_validate(current_admin)
