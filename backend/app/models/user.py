from datetime import datetime, timezone
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import BigInteger, String, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.cart import CartItem


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    telegram_id: Mapped[int] = mapped_column(BigInteger, unique=True, index=True, nullable=False)
    first_name: Mapped[str] = mapped_column(String(150), nullable=False)
    last_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    username: Mapped[Optional[str]] = mapped_column(String(150), index=True, nullable=True)
    language_code: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    cart_items: Mapped[List["CartItem"]] = relationship("CartItem", back_populates="user", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_users_telegram_id", "telegram_id"),
        Index("idx_users_username", "username"),
    )
