from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.user import TelegramAuthRequest, TokenResponse, UserResponse
from app.services.telegram_auth_service import authenticate_telegram_user

router = APIRouter(prefix="/auth", tags=["Telegram Auth"])


@router.post("/telegram", response_model=TokenResponse)
async def login_telegram(
    payload: TelegramAuthRequest,
    db: AsyncSession = Depends(get_db)
):
    user, access_token = await authenticate_telegram_user(db, payload.init_data)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )
