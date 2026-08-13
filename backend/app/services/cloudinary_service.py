from typing import Dict, Any, Optional
import cloudinary
import cloudinary.uploader
from fastapi import UploadFile

from app.core.config import settings
from app.core.exceptions import BadRequestException


def init_cloudinary():
    if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET:
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True
        )


async def upload_image_to_cloudinary(file: UploadFile, folder: str = "mela_shop/products") -> Dict[str, Any]:
    init_cloudinary()
    try:
        content = await file.read()
        response = cloudinary.uploader.upload(
            content,
            folder=folder,
            resource_type="image"
        )
        return {
            "public_id": response.get("public_id"),
            "url": response.get("secure_url"),
            "format": response.get("format"),
            "width": response.get("width"),
            "height": response.get("height")
        }
    except Exception as e:
        raise BadRequestException(f"Failed to upload image to Cloudinary: {str(e)}")


async def delete_image_from_cloudinary(public_id: str) -> bool:
    init_cloudinary()
    try:
        response = cloudinary.uploader.destroy(public_id)
        return response.get("result") == "ok"
    except Exception as e:
        raise BadRequestException(f"Failed to delete image from Cloudinary: {str(e)}")
