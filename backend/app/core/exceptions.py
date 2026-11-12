from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from postgrest.exceptions import APIError

class AppError(Exception):
    def __init__(self, status_code: int, code: str, message: str, details=None):
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details or []


def _error(status: int, code: str, message: str, details=None):
    return JSONResponse(
        status_code=status,
        content={"error": {"code": code, "message": message, "details": details or []}},
    )


def register_exception_handlers(app: FastAPI):
    @app.exception_handler(AppError)
    async def app_error(_: Request, exc: AppError):
        return _error(exc.status_code, exc.code, exc.message, exc.details)
    
    @app.exception_handler(APIError)
    async def db_error(_: Request, exc: APIError):
        code = getattr(exc, "code", None)
        if code == "22P02":
            return _error(422, "INVALID_ID", "Invalid identifier")
        if code == "23505":
            return _error(409, "CONFLICT", "This record already exists")
        if code in ("23503", "23514"):
            return _error(409, "CONFLICT", "Request conflicts with existing data")
        return _error(500, "INTERNAL_ERROR", "Something went wrong")
    
    @app.exception_handler(RequestValidationError)
    async def validation_error(_: Request, exc: RequestValidationError):
        details = [{"field": ".".join(str(p) for p in e["loc"][1:]), "message": e["msg"]} for e in exc.errors()]
        return _error(422, "VALIDATION_ERROR", "Invalid request", details)

    @app.exception_handler(StarletteHTTPException)
    async def http_error(_: Request, exc: StarletteHTTPException):
        return _error(exc.status_code, "HTTP_ERROR", str(exc.detail))

    @app.exception_handler(Exception)
    async def unhandled(_: Request, exc: Exception):
        return _error(500, "INTERNAL_ERROR", "Something went wrong")