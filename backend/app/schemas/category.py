from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=120)
    parent_id: Optional[int] = None
    image_url: Optional[str] = None
    display_order: int = 0
    is_active: bool = True


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    slug: Optional[str] = Field(None, min_length=1, max_length=120)
    parent_id: Optional[int] = None
    image_url: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class CategoryReorderPayload(BaseModel):
    category_ids: List[int] = Field(..., min_length=1)


class CategoryMinimalResponse(CategoryBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class CategoryResponse(CategoryMinimalResponse):
    children: List["CategoryResponse"] = []

    model_config = ConfigDict(from_attributes=True)
