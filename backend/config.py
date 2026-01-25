from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    """
    Centralized application configuration using Pydantic Settings.
    All values are loaded from environment variables.
    """
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    # Gemini/AI Configuration
    gemini_api_key: str
    gemini_model: str = "gemini-2.5-flash-lite"
    
    # Keyword Suggestion APIs (choose one or use fallbacks)
    dataforseo_login: Optional[str] = None
    dataforseo_password: Optional[str] = None
    
    # Google Ads API (for volume & competition data)
    google_ads_developer_token: Optional[str] = None
    google_ads_client_id: Optional[str] = None
    google_ads_client_secret: Optional[str] = None
    google_ads_refresh_token: Optional[str] = None
    google_ads_customer_id: Optional[str] = None
    
    # SERP APIs (choose one)
    serpapi_key: Optional[str] = None
    valueserpapi_key: Optional[str] = None
    
    # Optional: Redis for caching
    redis_url: Optional[str] = None
    
    # Application Settings
    api_version: str = "v1"
    cache_ttl_seconds: int = 1800  # 30 minutes default
    
    def has_google_ads_credentials(self) -> bool:
        """Check if Google Ads API is configured"""
        return all([
            self.google_ads_developer_token,
            self.google_ads_client_id,
            self.google_ads_client_secret,
            self.google_ads_refresh_token,
            self.google_ads_customer_id
        ])
    
    def has_serpapi(self) -> bool:
        """Check if any SERP API is configured"""
        return bool(self.serpapi_key or self.valueserpapi_key)
    
    def has_dataforseo(self) -> bool:
        """Check if DataForSEO is configured"""
        return bool(self.dataforseo_login and self.dataforseo_password)


# Global settings instance
settings = Settings()
