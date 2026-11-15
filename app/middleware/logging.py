import logging
import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware

from app.core.security import get_client_ip

logger = logging.getLogger("pointzero")


def setup_logging():
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        request_id = uuid.uuid4().hex[:8]
        started = time.perf_counter()
        try:
            response = await call_next(request)
        except Exception:
            logger.exception("[%s] %s %s crashed", request_id, request.method, request.url.path)
            raise
        ms = int((time.perf_counter() - started) * 1000)
        logger.info("[%s] %s %s -> %s %dms ip=%s", request_id, request.method,
                    request.url.path, response.status_code, ms, get_client_ip(request))
        response.headers["X-Request-ID"] = request_id
        return response