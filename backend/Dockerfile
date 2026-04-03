FROM mcr.microsoft.com/playwright/python:v1.50.0-noble

WORKDIR /app

# Install uv
RUN pip install uv

# Copy files
COPY . .

# Install dependencies
RUN uv sync

# Expose port (Render uses 10000 internally)
EXPOSE 10000

# Start app
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]