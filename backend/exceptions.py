"""
Base exceptions for the SEO Suite application.
"""


class SEOServiceError(Exception):
    """Base exception for all SEO service errors"""
    pass


class APIKeyMissingError(SEOServiceError):
    """Raised when a required API key is not configured"""
    pass


class APIRateLimitError(SEOServiceError):
    """Raised when an API rate limit is exceeded"""
    pass


class APIRequestError(SEOServiceError):
    """Raised when an external API request fails"""
    pass


class DataValidationError(SEOServiceError):
    """Raised when data validation fails"""
    pass


class ServiceUnavailableError(SEOServiceError):
    """Raised when a required service is unavailable"""
    pass
