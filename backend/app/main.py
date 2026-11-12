from app.routers import admin, applications, auth, cohorts, events, files, introductions, investors, mentors, mentorship, messages, milestones, notifications, partners, programs, resources, search, startups
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.middleware.logging import RequestLoggingMiddleware, setup_logging
from app.routers import (
    users,
)

setup_logging()
app = FastAPI(title="POINTZERO API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

API = "/api/v1"
app.include_router(auth.router, prefix=API)
app.include_router(programs.router, prefix=API)
app.include_router(programs.admin_router, prefix=API)
app.include_router(applications.router, prefix=API)
app.include_router(applications.admin_router, prefix=API)
app.include_router(startups.router, prefix=API)
app.include_router(startups.milestones_router, prefix=API)
app.include_router(startups.admin_router, prefix=API)
app.include_router(events.router, prefix=API)
app.include_router(events.admin_router, prefix=API)
app.include_router(resources.router, prefix=API)
app.include_router(resources.admin_router, prefix=API)
app.include_router(partners.router, prefix=API)
app.include_router(partners.admin_router, prefix=API)
app.include_router(mentors.mentors_router, prefix=API)
app.include_router(mentors.router, prefix=API)
app.include_router(investors.router, prefix=API)
app.include_router(investors.introductions_router, prefix=API)
app.include_router(investors.admin_router, prefix=API)
app.include_router(messages.router, prefix=API)
app.include_router(notifications.router, prefix=API)
app.include_router(admin.router, prefix=API)
app.include_router(files.router, prefix=API)
app.include_router(search.router, prefix=API)
app.include_router(cohorts.router, prefix=API)
app.include_router(cohorts.admin_router, prefix=API)
app.include_router(milestones.router, prefix=API)
app.include_router(introductions.router, prefix=API)   # after investors.introductions_router
app.include_router(mentorship.router, prefix=API)
app.include_router(users.router, prefix=API)
app.include_router(notifications.admin_router, prefix=API)

@app.get("/health")
def health():
    return {"status": "ok"}