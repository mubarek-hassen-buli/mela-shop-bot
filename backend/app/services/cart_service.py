from decimal import Decimal
from typing import List, Dict, Any
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException, BadRequestException
from app.models.cart import CartItem
from app.models.product_variant import ProductVariant
from app.models.product import Product


async def get_user_cart(db: AsyncSession, user_id: int) -> Dict[str, Any]:
    stmt = (
        select(CartItem)
        .where(CartItem.user_id == user_id)
        .options(
            selectinload(CartItem.variant).selectinload(ProductVariant.color),
            selectinload(CartItem.variant).selectinload(ProductVariant.product).selectinload(Product.category),
            selectinload(CartItem.variant).selectinload(ProductVariant.product).selectinload(Product.brand),
            selectinload(CartItem.variant).selectinload(ProductVariant.product).selectinload(Product.images),
            selectinload(CartItem.variant).selectinload(ProductVariant.product).selectinload(Product.specifications)
        )
    )
    result = await db.execute(stmt)
    cart_items = result.scalars().all()

    formatted_items = []
    subtotal = Decimal("0.00")
    total_items = 0

    for item in cart_items:
        if not item.variant or not item.variant.is_active:
            continue
        
        variant_price = item.variant.price
        item_subtotal = variant_price * item.quantity
        subtotal += item_subtotal
        total_items += item.quantity

        formatted_items.append({
            "id": item.id,
            "user_id": item.user_id,
            "variant_id": item.variant_id,
            "quantity": item.quantity,
            "updated_at": item.updated_at,
            "variant": item.variant,
            "product": item.variant.product if item.variant else None,
            "item_subtotal": item_subtotal
        })

    return {
        "items": formatted_items,
        "total_items": total_items,
        "subtotal": subtotal
    }


async def add_to_cart(db: AsyncSession, user_id: int, variant_id: int, quantity: int) -> CartItem:
    stmt = select(ProductVariant).where(ProductVariant.id == variant_id)
    res = await db.execute(stmt)
    variant = res.scalar_one_or_none()

    if not variant or not variant.is_active:
        raise NotFoundException("Product variant not found or inactive")

    if variant.stock_quantity < quantity:
        raise BadRequestException(f"Insufficient stock. Available: {variant.stock_quantity}")

    # Check existing item
    cart_stmt = select(CartItem).where(CartItem.user_id == user_id, CartItem.variant_id == variant_id)
    cart_res = await db.execute(cart_stmt)
    cart_item = cart_res.scalar_one_or_none()

    if cart_item:
        new_quantity = cart_item.quantity + quantity
        if variant.stock_quantity < new_quantity:
            raise BadRequestException(f"Cannot add item. Stock limit reached ({variant.stock_quantity})")
        cart_item.quantity = new_quantity
    else:
        cart_item = CartItem(user_id=user_id, variant_id=variant_id, quantity=quantity)
        db.add(cart_item)

    await db.commit()
    await db.refresh(cart_item)
    return cart_item


async def update_cart_item(db: AsyncSession, user_id: int, item_id: int, quantity: int) -> CartItem:
    stmt = select(CartItem).where(CartItem.id == item_id, CartItem.user_id == user_id).options(selectinload(CartItem.variant))
    res = await db.execute(stmt)
    cart_item = res.scalar_one_or_none()

    if not cart_item:
        raise NotFoundException("Cart item not found")

    if cart_item.variant and cart_item.variant.stock_quantity < quantity:
        raise BadRequestException(f"Insufficient stock. Available: {cart_item.variant.stock_quantity}")

    cart_item.quantity = quantity
    await db.commit()
    await db.refresh(cart_item)
    return cart_item


async def remove_cart_item(db: AsyncSession, user_id: int, item_id: int) -> bool:
    stmt = select(CartItem).where(CartItem.id == item_id, CartItem.user_id == user_id)
    res = await db.execute(stmt)
    cart_item = res.scalar_one_or_none()

    if not cart_item:
        raise NotFoundException("Cart item not found")

    await db.delete(cart_item)
    await db.commit()
    return True
