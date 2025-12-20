import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from typing import List
from PIL import Image

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

import base64
import io

def generate_ai_content(prompt: str, images: List[Image.Image]):
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