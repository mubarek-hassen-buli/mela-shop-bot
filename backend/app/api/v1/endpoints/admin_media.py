from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.db.session import get_db
from app.core.exceptions import NotFoundException
from app.models.admin import Admin
from app.models.product_image import ProductImage
from app.services.cloudinary_service import upload_image_to_cloudinary, delete_image_from_cloudinary
from app.schemas.common import MessageResponse

router = APIRouter(prefix="/admin/media", tags=["Admin Media"])


@router.post("/upload")
async def upload_media_image(
    file: UploadFile = File(...),
    current_admin: Admin = Depends(get_current_admin)
):
    upload_result = await upload_image_to_cloudinary(file, folder="mela_shop/products")
    return {
        "cloudinary_public_id": upload_result.get("public_id"),
        "url": upload_result.get("url"),
        "format": upload_result.get("format"),
        "width": upload_result.get("width"),
        "height": upload_result.get("height")
    }


@router.delete("/{image_id}", response_model=MessageResponse)
async def delete_media_image(
    image_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    stmt = select(ProductImage).where(ProductImage.id == image_id)
    res = await db.execute(stmt)
    image = res.scalar_one_or_none()

    if not image:
        raise NotFoundException("Product image not found")

    # Delete from Cloudinary
    await delete_image_from_cloudinary(image.cloudinary_public_id)

    # Delete from DB
    await db.delete(image)
    await db.commit()

    return MessageResponse(message="Image deleted successfully")
