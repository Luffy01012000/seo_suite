import asyncio
import io
from PIL import Image
from playwright.async_api import async_playwright

async def capture_screenshot(url: str) -> Image.Image:
    """
    Captures a screenshot of a website and returns it as a PIL Image.
    """
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True,
    args=[
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage"
    ])
        # Set a standard desktop viewport
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        
        try:
            await page.goto(url, wait_until="networkidle", timeout=30000)
            # Wait a bit for any animations to settle
            await asyncio.sleep(2)
            
            screenshot_bytes = await page.screenshot(full_page=False)
            image = Image.open(io.BytesIO(screenshot_bytes))
            
            return image
        finally:
            await browser.close()

async def get_website_screenshot(url: str) -> Image.Image:
    """
    Asynchronous function to get website screenshot.
    """
    return await capture_screenshot(url)
