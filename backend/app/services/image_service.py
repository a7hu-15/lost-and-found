import os
import uuid
from datetime import datetime
import io
from PIL import Image, ImageOps
from fastapi import UploadFile, HTTPException

UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

async def process_and_store_image(file: UploadFile):
    if not file:
        return None, None, False, None

    ALLOWED_MIMES = {"image/jpeg", "image/png", "image/webp"}
    if file.content_type not in ALLOWED_MIMES:
        raise HTTPException(
            status_code=400,
            detail="Invalid MIME type. Only JPEG, PNG, and WebP are allowed."
        )

    # Check extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Invalid image format. Only JPG, PNG, and WebP are allowed."
        )

    # Read bytes and check size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Image size exceeds 10 MB limit."
        )

    now = datetime.utcnow()

    # File names
    file_id = uuid.uuid4().hex
    main_filename = f"{file_id}.webp"
    thumb_filename = f"{file_id}_thumb.webp"

    try:
        # Open with PIL
        file.file.seek(0)
        img = Image.open(file.file)

        # Transpose image based on EXIF orientation and STRIP all EXIF metadata
        img = ImageOps.exif_transpose(img)
        
        # Convert RGBA / P palette to RGB for JPEG/WebP compatibility
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")

        # 1. Main image: Max 1200px
        main_img = img.copy()
        main_img.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
        
        main_buffer = io.BytesIO()
        main_img.save(main_buffer, "WEBP", quality=82, optimize=True)
        main_bytes = main_buffer.getvalue()

        # 2. Thumbnail: Max 300px
        thumb_img = img.copy()
        thumb_img.thumbnail((300, 300), Image.Resampling.LANCZOS)
        
        thumb_buffer = io.BytesIO()
        thumb_img.save(thumb_buffer, "WEBP", quality=75, optimize=True)
        thumb_bytes = thumb_buffer.getvalue()

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process image: {str(e)}")

    from app.services.storage import get_storage_backend
    storage = get_storage_backend()

    main_url, is_flagged, mod_result = await storage.save(f"{now.year}/{now.month:02d}/{main_filename}", main_bytes)
    thumb_url, _, _ = await storage.save(f"{now.year}/{now.month:02d}/{thumb_filename}", thumb_bytes)

    return main_url, thumb_url, is_flagged, mod_result
