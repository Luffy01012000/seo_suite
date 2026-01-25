# SEO Suite - Quick Start Guide

## Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd /home/goku/Downloads/AI_SEO_FULL_Project/backend
   ```

2. **Activate virtual environment**:
   ```bash
   source ./seoAi/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   ```bash
   cp example.env .env
   # Edit .env and add your GEMINI_API_KEY (required)
   # Other API keys are optional - services will use fallbacks
   ```

5. **Start the backend**:
   ```bash
   uvicorn main:app --reload
   ```

   Backend will be available at: `http://localhost:8000`
   API docs at: `http://localhost:8000/docs`

## Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd /home/goku/Downloads/AI_SEO_FULL_Project/frontend
   ```

2. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

   Frontend will be available at: `http://localhost:3000`

## Usage

1. Open `http://localhost:3000` in your browser
2. Click on "Smart Keyword Research" from the landing page
3. Enter a seed keyword (e.g., "seo tools")
4. Click "Analyze" and wait for results
5. Explore:
   - Keyword clusters with AI-generated themes
   - Detailed keyword metrics table
   - Strategic insights and recommendations

## API Keys (Optional)

### Minimum Configuration
- **GEMINI_API_KEY**: Required for AI analysis

### Optional Enhancements
- **DataForSEO**: Better keyword suggestions (free tier available)
- **Google Ads API**: Accurate search volume data
- **SerpAPI/ValueSERP**: Real SERP analysis

Without optional keys, the system uses intelligent fallbacks:
- Google Autocomplete for keyword suggestions
- Estimation for search volume
- Mock data for SERP analysis

## Testing the API

```bash
# Health check
curl http://localhost:8000/health

# Get keyword suggestions
curl -X POST http://localhost:8000/api/v1/keywords/suggest \
  -H "Content-Type: application/json" \
  -d '{"seed_keyword": "seo tools", "limit": 10}'

# Complete analysis
curl -X POST http://localhost:8000/api/v1/keywords/analyze \
  -H "Content-Type: application/json" \
  -d '{"seed_keyword": "content marketing"}'
```

## Troubleshooting

### Backend won't start
- Check that virtual environment is activated
- Verify all dependencies are installed
- Check `.env` file exists with GEMINI_API_KEY

### Frontend can't connect to backend
- Verify backend is running on port 8000
- Check `.env` in frontend has correct API_URL
- Check browser console for CORS errors

### No results returned
- Check backend logs for errors
- Verify GEMINI_API_KEY is valid
- Try with a different keyword
