import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from typing import List, Optional, Dict, Any
from PIL import Image
import base64
import io

# Load variables from .env file
load_dotenv()

# Access the variables
GEMINI_MODEL: str | None = os.getenv("GEMINI_MODEL")
GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY")

llm = ChatGoogleGenerativeAI(
    api_key=GEMINI_API_KEY,
    model=GEMINI_MODEL,   # FREE MODEL
    temperature=0.4
)


def generate_ai_content(prompt: str, images: List[Image.Image]):
    """Generate AI content for product images"""
    content = [{"type": "text", "text": prompt}]

    for img in images:
        buffered = io.BytesIO()
        if img.mode == 'RGBA':
            img = img.convert('RGB')
        img.save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        
        content.append({
            "type": "image_url",
            "image_url": f"data:image/jpeg;base64,{img_str}"
        })

    message = HumanMessage(content=content)
    response = llm.invoke([message])

    return response.content


def generate_website_ai_content(
    user_prompt: Optional[str],
    scraped_data: Dict[str, Any],
    screenshot: Image.Image
):
    """Generate AI content for website analysis"""
    
    # Build the analysis prompt
    base_prompt = f"""
    You are an SEO expert analyzing a website.
    
    Website Data:
    - Title: {scraped_data.get('title', 'N/A')}
    - Meta Description: {scraped_data.get('meta_description', 'N/A')}
    - Headings: {', '.join(scraped_data.get('headings', [])[:10])}
    - Text Content (first 500 chars): {scraped_data.get('text_content', '')[:500]}
    
    Task:
    - Analyze the website screenshot and scraped data
    - Generate SEO-optimized recommendations
    - Output JSON with:
      page_summary (brief overview of the website),
      seo_title (optimized title),
      meta_description (optimized meta description),
      suggested_keywords (array of relevant keywords),
      content_strategy (recommendations for improvement)
    
    {f"Additional Instructions: {user_prompt}" if user_prompt else ""}
    """
    
    # Prepare content with screenshot
    content = [{"type": "text", "text": base_prompt}]
    
    # Add screenshot
    buffered = io.BytesIO()
    if screenshot.mode == 'RGBA':
        screenshot = screenshot.convert('RGB')
    screenshot.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    
    content.append({
        "type": "image_url",
        "image_url": f"data:image/jpeg;base64,{img_str}"
    })
    
    message = HumanMessage(content=content)
    response = llm.invoke([message])
    
    return response.content
