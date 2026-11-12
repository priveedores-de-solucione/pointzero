from datetime import datetime, timezone

from app.core.exceptions import AppError
from app.repositories.application_repository import ApplicationRepository
from app.repositories.program_repository import ProgramRepository

applications = ApplicationRepository()
programs = ProgramRepository()


def assert_program_accepting(program_id: str) -> dict:
    program = programs.get(program_id)
    if not program:
        raise AppError(404, "NOT_FOUND", "Program not found")
    if not program["application_open"]:
        raise AppError(409, "APPLICATIONS_CLOSED", "Applications are closed for this program")
    deadline = program.get("application_deadline")
    if deadline and datetime.fromisoformat(deadline) < datetime.now(timezone.utc):
        raise AppError(409, "DEADLINE_PASSED", "The application deadline has passed")
    return program


def assert_no_active_application(user_id: str, program_id: str) -> None:
    if applications.active_for_program(user_id, program_id):
        raise AppError(409, "ALREADY_APPLIED", "You already have an active application for this program")


def enroll_applicant(application: dict):
    """Called when an application is accepted. Applications without a program enroll nobody."""
    if not application.get("program_id"):
        return None
    return programs.enroll(application["user_id"], application["program_id"])