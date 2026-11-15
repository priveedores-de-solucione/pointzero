from typing import Optional

from app.core.exceptions import AppError
from app.repositories.mentor_repository import MentorRepository
from app.utils.helpers import count_rows

mentors = MentorRepository()


def my_mentor(user: dict) -> Optional[dict]:
    return mentors.by_user(user["id"])


def mentor_by_id(mentor_id: str) -> dict:
    mentor = mentors.get(mentor_id)
    if not mentor:
        raise AppError(404, "NOT_FOUND", "Mentor not found")
    return mentor


def update_profile(user: dict, changes: dict) -> dict:
    mentor = my_mentor(user)
    if not mentor:
        raise AppError(404, "NOT_FOUND", "You are not a mentor")
    if not changes:
        raise AppError(400, "NO_CHANGES", "Nothing to update")
    return mentors.update(mentor["id"], changes)


def stats(mentor_id: str) -> dict:
    ratings = mentors.rating_values(mentor_id)
    return {
        "sessions_completed": count_rows("pz_mentor_sessions", mentor_id=mentor_id, status="COMPLETED"),
        "pending_requests": count_rows("pz_mentorship_requests", mentor_id=mentor_id, status="PENDING"),
        "average_rating": round(sum(ratings) / len(ratings), 2) if ratings else None,
    }