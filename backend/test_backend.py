import httpx
import json
import asyncio

async def test():
    async with httpx.AsyncClient() as client:
        try:
            print("Testing /health...")
            resp = await client.get("http://127.0.0.1:8000/health")
            print(f"Health Status: {resp.status_code}")
            print(f"Health Body: {resp.text}")
            
            print("\nTesting Technical SEO Audit on google.com...")
            resp = await client.post(
                "http://127.0.0.1:8000/api/v1/technical-seo/audit",
                json={"url": "https://www.google.com", "check_broken_links": True},
                timeout=60
            )
            print(f"Audit Status: {resp.status_code}")
            print(f"Audit Body: {resp.text[:500]}...")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test())
