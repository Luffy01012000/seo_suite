FROM mcr.microsoft.com/playwright/python:1.49.1

WORKDIR /app

# Install uv
RUN pip install uv

# Copy project
COPY . .

# Install dependencies
RUN uv sync --active

# Run app
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]