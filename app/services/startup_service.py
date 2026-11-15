from app.core.exceptions import AppError
from app.repositories.startup_repository import StartupRepository

startups = StartupRepository()


def get_startup(startup_id: str) -> dict:
    startup = startups.get_active(startup_id)
    if not startup:
        raise AppError(404, "NOT_FOUND", "Startup not found")
    return startup


def membership(startup_id: str, user_id: str):
    return startups.membership(startup_id, user_id)


def founder_count(startup_id: str) -> int:
    return startups.founder_count(startup_id)


def my_startup_ids(user_id: str, founder_only: bool = False) -> list[str]:
    return startups.member_startup_ids(user_id, founder_only)


def require_access(startup_id: str, user: dict, founder_only: bool = True, read: bool = False) -> dict:
    """startups.write = full access; startups.read only counts for read endpoints."""
    startup = get_startup(startup_id)
    perms = user["permissions"]
    if "startups.write" in perms or (read and "startups.read" in perms):
        return startup
    m = membership(startup_id, user["id"])
    if not m or (founder_only and not m["is_founder"]):
        raise AppError(403, "FORBIDDEN", "You do not have access to this startup")
    return startup