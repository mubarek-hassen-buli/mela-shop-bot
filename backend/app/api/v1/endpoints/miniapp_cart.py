from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.cart import CartItemAddRequest, CartItemUpdateRequest, CartItemResponse, CartSummaryResponse
from app.schemas.common import MessageResponse
from app.services.cart_service import get_user_cart, add_to_cart, update_cart_item, remove_cart_item

router = APIRouter(prefix="/cart", tags=["Mini App Cart"])


@router.get("", response_model=CartSummaryResponse)
async def get_cart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    cart_data = await get_user_cart(db, current_user.id)
    return CartSummaryResponse(**cart_data)


@router.post("/items", response_model=CartSummaryResponse)
async def add_item_to_cart(
    payload: CartItemAddRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await add_to_cart(db, current_user.id, payload.variant_id, payload.quantity)
    cart_data = await get_user_cart(db, current_user.id)
    return CartSummaryResponse(**cart_data)


@router.patch("/items/{item_id}", response_model=CartSummaryResponse)
async def update_item_quantity(
    item_id: int,
    payload: CartItemUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await update_cart_item(db, current_user.id, item_id, payload.quantity)
    cart_data = await get_user_cart(db, current_user.id)
    return CartSummaryResponse(**cart_data)


@router.delete("/items/{item_id}", response_model=CartSummaryResponse)
async def remove_item_from_cart(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await remove_cart_item(db, current_user.id, item_id)
    cart_data = await get_user_cart(db, current_user.id)
    return CartSummaryResponse(**cart_data)
