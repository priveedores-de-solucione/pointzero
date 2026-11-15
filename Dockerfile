# syntax=docker/dockerfile:1

FROM python:3.12-slim

# No .pyc files, unbuffered logs (so they show up immediately in your host's log viewer)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install dependencies first so this layer is cached until requirements.txt changes
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy the application code
COPY app ./app

# Run as a non-root user
RUN useradd --create-home --uid 1000 appuser
USER appuser

# Most hosts (Render, Railway, Fly.io, Cloud Run) inject PORT; default to 8000 locally
ENV PORT=8000
EXPOSE 8000

# Uses Python's stdlib so we don't need curl in the image
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD python -c "import os,urllib.request; urllib.request.urlopen(f'http://localhost:{os.environ.get(\"PORT\",\"8000\")}/health')" || exit 1

# One worker on purpose: the rate limiter keeps its counters in memory per process.
# --proxy-headers lets the app see the real client IP behind the host's load balancer.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT} --proxy-headers --forwarded-allow-ips='*'"]