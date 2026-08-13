from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

from app.schemas.product import ProductVariantResponse, ProductResponse


class CartItemAddRequest(BaseModel):
    variant_id: int
    quantity: int = Field(1, gt=0)


class CartItemUpdateRequest(BaseModel):
    quantity: int = Field(..., gt=0)


class CartItemResponse(BaseModel):
    id: int
    user_id: int
    variant_id: int
    quantity: int
    updated_at: datetime
    variant: Optional[ProductVariantResponse] = None
    product: Optional[ProductResponse] = None
    item_subtotal: Decimal

    model_config = ConfigDict(from_attributes=True)


class CartSummaryResponse(BaseModel):
    items: list[CartItemResponse]
    total_items: int
    subtotal: Decimal
