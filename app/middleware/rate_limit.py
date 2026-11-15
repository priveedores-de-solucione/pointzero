import time
from collections import defaultdict, deque

from fastapi import Request

from app.core.exceptions import AppError

_hits: dict[str, deque] = defaultdict(deque)


def rate_limit(max_calls: int, seconds: int):
    """In-memory limiter (per process). Fine for a single Render instance."""
    def dependency(request: Request):
        ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "x").split(",")[0].strip()
        key = f"{request.url.path}:{ip}"
        now = time.time()
        q = _hits[key]
        while q and now - q[0] > seconds:
            q.popleft()
        if len(q) >= max_calls:
            raise AppError(429, "RATE_LIMITED", "Too many requests, try again later")
        q.append(now)
    return dependency