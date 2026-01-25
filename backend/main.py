from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import logging

# Existing imports for content generation
from gemini_chain import generate_ai_content, generate_website_ai_content
from plagiarism_checker import plagiarism_check
from utils.image_utils import (
    load_image_from_bytes,
    load_image_from_url
)
from utils.web_scraper import scrape_website
from utils.screenshot_utils import get_website_screenshot

# New imports for keyword research
from routers import keyword_router, serp_router
from config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AI SEO Suite",
    description="Complete SEO toolkit with keyword research, SERP analysis, and AI-powered content generation",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============= API v1 Routes =============

# Include new keyword research and SERP analysis routers
app.include_router(keyword_router.router, prefix="/api/v1")
app.include_router(serp_router.router, prefix="/api/v1")


# ============= Legacy Routes (Backward Compatibility) =============

@app.post("/generate-product-content")
@app.post("/generate-content")
async def generate_product_content(
    prompt: str = Form(...),
    images: Optional[List[UploadFile]] = File(None),
    image_urls: Optional[str] = Form(None)  # comma-separated
):
    """
    Endpoint for AI product content generation.
    Handles both uploaded images and image URLs.
    """
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
            try:
                pil_images.append(load_image_from_url(url))
            except Exception:
                continue

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
        "originality_score": plagiarism_result["originality_percent"],
        "sources_found": 0
    }

    return {
        "generated_content": generated_content,
        "plagiarism": plagiarism
    }

@app.post("/generate-website-content")
async def generate_website_content(
    url: str = Form(...),
    prompt: Optional[str] = Form(None)
):
    """
    Generate SEO content by analyzing a website.
    Scrapes the website, captures screenshot, and uses AI for analysis.
    """
    # 1. Scrape website data
    scraped_data = scrape_website(url)
    if "error" in scraped_data:
        raise HTTPException(status_code=400, detail=f"Failed to scrape website: {scraped_data['error']}")
    
    # 2. Get screenshot
    try:
        screenshot = await get_website_screenshot(url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to capture screenshot: {str(e)}")
    
    # 3. Generate content with AI
    generated_content = generate_website_ai_content(prompt, scraped_data, screenshot)
    
    # 4. Plagiarism check
    plagiarism_result = plagiarism_check(
        text=str(generated_content),
        references=[]
    )

    plagiarism = {
        "is_unique": plagiarism_result["plagiarism_percent"] < 30,
        "plagiarism_score": plagiarism_result["plagiarism_percent"],
        "originality_score": plagiarism_result["originality_percent"],
        "sources_found": 0
    }

    return {
        "generated_content": generated_content,
        "plagiarism": plagiarism,
        "scraped_data": scraped_data
    }




# ============= Health Check =============

@app.get("/")
async def root():
    """API root endpoint with service status"""
    return {
        "service": "AI SEO Suite",
        "version": "1.0.0",
        "status": "operational",
        "features": {
            "keyword_research": True,
            "serp_analysis": True,
            "content_generation": True,
            "ai_analysis": True
        },
        "endpoints": {
            "docs": "/docs",
            "keyword_suggestions": "/api/v1/keywords/suggest",
            "keyword_analysis": "/api/v1/keywords/analyze",
            "serp_analysis": "/api/v1/serp/analyze",
            "generate_product_content": "/generate-product-content",
            "generate_website_content": "/generate-website-content"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "gemini_configured": bool(settings.gemini_api_key),
        "google_ads_configured": settings.has_google_ads_credentials(),
        "serp_api_configured": settings.has_serpapi(),
        "dataforseo_configured": settings.has_dataforseo()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
