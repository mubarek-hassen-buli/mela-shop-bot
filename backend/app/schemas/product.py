from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field

from app.schemas.category import CategoryMinimalResponse
from app.schemas.brand import BrandResponse


# Color Schemas
class ColorBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    hex_code: str = Field(..., min_length=4, max_length=10)


class ColorCreate(ColorBase):
    pass


class ColorResponse(ColorBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# Product Specification Schemas
class ProductSpecBase(BaseModel):
    spec_key: str = Field(..., min_length=1, max_length=100)
    spec_value: str = Field(..., min_length=1, max_length=255)


class ProductSpecCreate(ProductSpecBase):
    pass


class ProductSpecResponse(ProductSpecBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# Product Image Schemas
class ProductImageBase(BaseModel):
    cloudinary_public_id: str
    url: str
    display_order: int = 0
    is_primary: bool = False


class ProductImageCreate(ProductImageBase):
    pass


class ProductImageResponse(ProductImageBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# Product Variant Schemas
class ProductVariantBase(BaseModel):
    sku: str = Field(..., min_length=1, max_length=100)
    color_id: Optional[int] = None
    size: Optional[str] = None
    price: Decimal = Field(..., gt=Decimal('0'))
    compare_at_price: Optional[Decimal] = Field(None, ge=Decimal('0'))
    stock_quantity: int = Field(0, ge=0)
    is_active: bool = True


class ProductVariantCreate(ProductVariantBase):
    pass


class ProductVariantUpdate(BaseModel):
    sku: Optional[str] = None
    color_id: Optional[int] = None
    size: Optional[str] = None
    price: Optional[Decimal] = Field(None, gt=Decimal('0'))
    compare_at_price: Optional[Decimal] = Field(None, ge=Decimal('0'))
    stock_quantity: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None


class ProductVariantResponse(ProductVariantBase):
    id: int
    color: Optional[ColorResponse] = None

    model_config = ConfigDict(from_attributes=True)


# Product Schemas
class ProductBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category_id: int
    brand_id: Optional[int] = None
    is_active: bool = True


class ProductCreate(ProductBase):
    variants: List[ProductVariantCreate] = []
    images: List[ProductImageCreate] = []
    specifications: List[ProductSpecCreate] = []


class ProductUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    slug: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    category_id: Optional[int] = None
    brand_id: Optional[int] = None
    is_active: Optional[bool] = None


class ProductMinimalResponse(ProductBase):
    id: int
    created_at: datetime
    category: Optional[CategoryMinimalResponse] = None
    brand: Optional[BrandResponse] = None
    images: List[ProductImageResponse] = []
    specifications: List[ProductSpecResponse] = []

    model_config = ConfigDict(from_attributes=True)


class ProductResponse(ProductMinimalResponse):
    variants: List[ProductVariantResponse] = []

    model_config = ConfigDict(from_attributes=True)

