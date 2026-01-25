import requests
from bs4 import BeautifulSoup
from typing import Dict, Any, Optional

def scrape_website(url: str) -> Dict[str, Any]:
    """
    Scrapes basic SEO data and content from a given URL.
    """
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "lxml")
        
        # Extract metadata
        title = soup.title.string if soup.title else ""
        meta_description = ""
        description_tag = soup.find("meta", attrs={"name": "description"})
        if description_tag:
            meta_description = description_tag.get("content", "")
            
        # Extract headings
        h1s = [h1.get_text(strip=True) for h1 in soup.find_all("h1")]
        h2s = [h2.get_text(strip=True) for h2 in soup.find_all("h2")]
        
        # Extract main text (p tags)
        paragraphs = [p.get_text(strip=True) for p in soup.find_all("p")]
        main_text = " ".join(paragraphs[:10]) # Get first 10 paragraphs as summary
        
        return {
            "url": url,
            "title": title,
            "meta_description": meta_description,
            "h1": h1s,
            "h2": h2s,
            "content_snippet": main_text[:2000] # Limit content size
        }
    except Exception as e:
        return {"error": str(e)}
