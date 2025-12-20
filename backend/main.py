from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from typing import List, Optional
from gemini_chain import generate_ai_content
from plagiarism_checker import plagiarism_check
from utils.image_utils import (
    load_image_from_bytes,
    load_image_from_url
)

app = FastAPI(title="AI SEO Content Generator")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.post("/generate-content")
async def generate_content(
    prompt: str = Form(...),
    images: Optional[List[UploadFile]] = File(None),
    image_urls: Optional[str] = Form(None)  # comma-separated
):
    pil_images = []

    # Handle uploaded image blobs
    if images:
        for img in images:
            image_bytes = await img.read()
            pil_images.append(load_image_from_bytes(image_bytes))

    # Handle image URLs
    if image_urls:
        urls = [u.strip() for u in image_urls.split(",")]
        for url in urls:
            pil_images.append(load_image_from_url(url))

    if not pil_images:
        raise HTTPException(
            status_code=400,
            detail="At least one image (file or URL) is required"
        )

    seo_prompt = f"""
    You are an SEO expert.

    Task:
    - Analyze product image(s)
    - Generate SEO-optimized content
    - Output JSON with:
      product_description,
      seo_title,
      meta_description,
      bullet_features

    User Prompt:
    {prompt}
    """

    generated_content = generate_ai_content(
        seo_prompt,
        pil_images
    )

    plagiarism_result = plagiarism_check(
        text=str(generated_content),
        references=[]
    )

    plagiarism = {
        "is_unique": plagiarism_result["plagiarism_percent"] < 30,
        "plagiarism_score": plagiarism_result["plagiarism_percent"],
        "sources_found": 0
    }

    return {
        "generated_content": generated_content,
        "plagiarism": plagiarism
    }
