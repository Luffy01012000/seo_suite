import requests
import json

def test_seo_optimizer():
    url = "http://localhost:8000/api/v1/seo/optimize"
    
    # Sample HTML article
    article = """
    <h1>The Ultimate Guide to AI SEO</h1>
    <p>AI SEO is transforming how we optimize websites. In this guide, we'll explore AI SEO strategies.</p>
    <h2>Why AI SEO Matters</h2>
    <p>AI SEO helps you rank higher by analyzing data more effectively.</p>
    <h2>Key AI SEO Techniques</h2>
    <p>1. Automated content generation for AI SEO.<br>
    2. Smart keyword research using AI SEO tools.</p>
    <img src="ai-seo.jpg" alt="AI SEO Strategy">
    <img src="chart.jpg">
    <a href="/blog/ai-seo-basics">Read more about AI SEO basics</a>
    """
    
    payload = {
        "article": article,
        "keyword": "AI SEO",
        "title": "AI SEO Guide: Master the Future of Search",
        "meta_description": "Learn how AI SEO can revolutionize your digital marketing strategy and drive better search results."
    }
    
    print(f"Testing SEO Optimizer at {url}...")
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        result = response.json()
        
        print("\nSEO Optimization Results:")
        print(f"Overall Score: {result['seo_score']}")
        print("\nMetrics:")
        print(json.dumps(result['metrics'], indent=2))
        print("\nRecommendations:")
        for rec in result['recommendations']:
            print(f"- {rec}")
            
    except Exception as e:
        print(f"Error: {e}")
        if hasattr(e, 'response') and e.response:
            print(f"Response: {e.response.text}")

if __name__ == "__main__":
    test_seo_optimizer()
