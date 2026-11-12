from fastapi import Depends

from app.core.exceptions import AppError
from app.dependencies.auth import get_current_user


def require_permission(permission: str):
    def checker(user: dict = Depends(get_current_user)) -> dict:
        if permission not in user["permissions"]:
            raise AppError(403, "FORBIDDEN", "You do not have permission to do this")
        return user
    return checker


def require_roles(*roles: str):
    def checker(user: dict = Depends(get_current_user)) -> dict:
        if user["role"] not in roles:
            raise AppError(403, "FORBIDDEN", "You do not have access to this resource")
        return user
    return checker