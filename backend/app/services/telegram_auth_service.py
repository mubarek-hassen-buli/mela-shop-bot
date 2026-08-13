from typing import Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import validate_telegram_init_data, create_access_token
from app.core.exceptions import UnauthorizedException
from app.models.user import User


async def authenticate_telegram_user(db: AsyncSession, init_data: str) -> Tuple[User, str]:
    is_valid, user_data, error_msg = validate_telegram_init_data(init_data, settings.TELEGRAM_BOT_TOKEN)
    if not is_valid or not user_data:
        raise UnauthorizedException(f"Telegram authentication failed: {error_msg}")

    telegram_id = user_data.get("id")
    if not telegram_id:
        raise UnauthorizedException("Invalid user payload in initData")

    first_name = user_data.get("first_name", "Telegram User")
    last_name = user_data.get("last_name")
    username = user_data.get("username")
    language_code = user_data.get("language_code")

    # Check if user exists
    stmt = select(User).where(User.telegram_id == telegram_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user:
        user.first_name = first_name
        user.last_name = last_name
        user.username = username
        user.language_code = language_code
    else:
        user = User(
            telegram_id=telegram_id,
            first_name=first_name,
            last_name=last_name,
            username=username,
            language_code=language_code
        )
        db.add(user)

    await db.commit()
    await db.refresh(user)

    access_token = create_access_token(subject=user.id, role="user")
    return user, access_token
