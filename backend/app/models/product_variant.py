from typing import Optional, List, TYPE_CHECKING
from decimal import Decimal
from sqlalchemy import String, Numeric, Integer, Boolean, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.product import Product
    from app.models.cart import CartItem


class Color(Base):
    __tablename__ = "colors"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    hex_code: Mapped[str] = mapped_column(String(10), nullable=False)

    variants: Mapped[List["ProductVariant"]] = relationship("ProductVariant", back_populates="color")


class ProductVariant(Base):
    __tablename__ = "product_variants"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    sku: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    color_id: Mapped[Optional[int]] = mapped_column(ForeignKey("colors.id", ondelete="SET NULL"), nullable=True, index=True)
    size: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    compare_at_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    product: Mapped["Product"] = relationship("Product", back_populates="variants")
    color: Mapped[Optional["Color"]] = relationship("Color", back_populates="variants")
    cart_items: Mapped[List["CartItem"]] = relationship("CartItem", back_populates="variant", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_variants_sku", "sku"),
        Index("idx_variants_product_id", "product_id"),
        Index("idx_variants_color_id", "color_id"),
    )


class ProductSpecification(Base):
    __tablename__ = "product_specifications"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    spec_key: Mapped[str] = mapped_column(String(100), nullable=False)
    spec_value: Mapped[str] = mapped_column(String(255), nullable=False)

    product: Mapped["Product"] = relationship("Product", back_populates="specifications")

    __table_args__ = (
        Index("idx_specs_product_id", "product_id"),
    )
