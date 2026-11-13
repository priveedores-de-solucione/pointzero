from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.core.exceptions import AppError
from app.core.supabase import supabase
from app.dependencies.roles import require_permission
from app.schemas.program import CohortCreate, CohortUpdate, ProgramCreate, ProgramUpdate
from app.utils.helpers import log_audit, ok, page_range, paginated
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/programs", tags=["Programs"])
admin_router = APIRouter(prefix="/admin", tags=["Admin: Programs"])


# ---------- Public ----------
@router.get("/my")
def my_programs(user: dict = Depends(get_current_user)):
    res = supabase.table("pz_enrollments").select("*, programs:pz_programs(*), cohorts:pz_cohorts(*)").eq("user_id", user["id"]).execute()
    return ok(res.data)
@router.get("")
def list_programs(
    status: Optional[str] = Query(None, pattern="^(UPCOMING|ACTIVE|CLOSED)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    start, end = page_range(page, limit)
    q = supabase.table("pz_programs").select("*", count="exact")
    if status:
        q = q.eq("status", status)
    res = q.order("created_at", desc=True).range(start, end).execute()
    return paginated(res.data, page, limit, res.count or 0)


@router.get("/{slug}")
def get_program(slug: str):
    res = supabase.table("pz_programs").select("*").eq("slug", slug).limit(1).execute()
    if not res.data:
        raise AppError(404, "NOT_FOUND", "Program not found")
    return ok(res.data[0])


@router.get("/{program_id}/cohorts")
def program_cohorts(program_id: str):
    res = supabase.table("pz_cohorts").select("*").eq("program_id", program_id).order("number").execute()
    return ok(res.data)


@router.get("/{program_id}/curriculum")
def program_curriculum(program_id: str):
    # Needs a `program_curriculum` table: id, program_id, week, title, description, position
    res = supabase.table("pz_program_curriculum").select("*").eq("program_id", program_id).order("position").execute()
    return ok(res.data)


# ---------- Admin ----------

@admin_router.post("/programs", status_code=201)
def create_program(body: ProgramCreate, user: dict = Depends(require_permission("programs.manage"))):
    data = body.model_dump(mode="json")
    exists = supabase.table("pz_programs").select("id").eq("slug", data["slug"]).execute()
    if exists.data:
        raise AppError(409, "CONFLICT", "A program with this slug already exists")
    res = supabase.table("pz_programs").insert(data).execute()
    program = res.data[0]
    log_audit(user["id"], "program.created", "program", program["id"])
    return ok(program)


@admin_router.patch("/programs/{program_id}")
def update_program(program_id: str, body: ProgramUpdate, user: dict = Depends(require_permission("programs.manage"))):
    changes = body.model_dump(mode="json", exclude_unset=True)
    if not changes:
        raise AppError(400, "NO_CHANGES", "Nothing to update")
    res = supabase.table("pz_programs").update(changes).eq("id", program_id).execute()
    if not res.data:
        raise AppError(404, "NOT_FOUND", "Program not found")
    log_audit(user["id"], "program.updated", "program", program_id, changes)
    return ok(res.data[0])


@admin_router.delete("/programs/{program_id}", status_code=204)
def delete_program(program_id: str, user: dict = Depends(require_permission("programs.manage"))):
    # Archive rather than hard-delete.
    res = supabase.table("pz_programs").update({"status": "CLOSED", "application_open": False}).eq("id", program_id).execute()
    if not res.data:
        raise AppError(404, "NOT_FOUND", "Program not found")
    log_audit(user["id"], "program.archived", "program", program_id)


@admin_router.post("/programs/{program_id}/cohorts", status_code=201)
def create_cohort(program_id: str, body: CohortCreate, user: dict = Depends(require_permission("programs.manage"))):
    data = body.model_dump(mode="json")
    data["program_id"] = program_id
    res = supabase.table("pz_cohorts").insert(data).execute()
    log_audit(user["id"], "cohort.created", "cohort", res.data[0]["id"])
    return ok(res.data[0])


@admin_router.patch("/cohorts/{cohort_id}")
def update_cohort(cohort_id: str, body: CohortUpdate, user: dict = Depends(require_permission("programs.manage"))):
    changes = body.model_dump(mode="json", exclude_unset=True)
    if not changes:
        raise AppError(400, "NO_CHANGES", "Nothing to update")
    res = supabase.table("pz_cohorts").update(changes).eq("id", cohort_id).execute()
    if not res.data:
        raise AppError(404, "NOT_FOUND", "Cohort not found")
    log_audit(user["id"], "cohort.updated", "cohort", cohort_id, changes)
    return ok(res.data[0])