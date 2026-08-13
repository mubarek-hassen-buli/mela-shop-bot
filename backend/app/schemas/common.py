from typing import Generic, List, TypeVar, Optional
from pydantic import BaseModel

T = TypeVar("T")


class MessageResponse(BaseModel):
    message: str
    code: str = "SUCCESS"


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int
