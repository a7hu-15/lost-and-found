import os
import uuid
from datetime import datetime
from PIL import Image, ImageOps
from fastapi import UploadFile, HTTPException

UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

async def process_and_store_image(file: UploadFile):
    if not file:
        return None, None

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

    # Create Year/Month folder structure: uploads/2026/08/
    now = datetime.utcnow()
    rel_folder = os.path.join(str(now.year), f"{now.month:02d}")
    target_dir = os.path.join(UPLOAD_DIR, rel_folder)
    os.makedirs(target_dir, exist_ok=True)

    # File names
    file_id = uuid.uuid4().hex
    main_filename = f"{file_id}.webp"
    thumb_filename = f"{file_id}_thumb.webp"

    main_path = os.path.join(target_dir, main_filename)
    thumb_path = os.path.join(target_dir, thumb_filename)

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
        main_img.save(main_path, "WEBP", quality=82, optimize=True)

        # 2. Thumbnail: Max 300px
        thumb_img = img.copy()
        thumb_img.thumbnail((300, 300), Image.Resampling.LANCZOS)
        thumb_img.save(thumb_path, "WEBP", quality=75, optimize=True)

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process image: {str(e)}")

    base_url = f"/static/uploads/{now.year}/{now.month:02d}"
    main_url = f"{base_url}/{main_filename}"
    thumb_url = f"{base_url}/{thumb_filename}"

    return main_url, thumb_url
