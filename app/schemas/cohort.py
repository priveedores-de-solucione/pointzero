from pydantic import BaseModel

from app.schemas.program import CohortCreate, CohortUpdate  # noqa: F401  (defined in program.py)


class CohortAssign(BaseModel):
    user_id: str