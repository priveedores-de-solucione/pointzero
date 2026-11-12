from typing import Optional

from app.repositories.base import BaseRepository

PUBLIC_COLUMNS = "id,first_name,last_name,avatar_url,bio,country,city,website,linkedin,twitter,github,role"


class UserRepository(BaseRepository):
    table = "profiles"

    def by_email(self, email: str) -> Optional[dict]:
        return self.get_by(email=email.lower())

    def public_profile(self, user_id: str) -> Optional[dict]:
        res = self.query(PUBLIC_COLUMNS).eq("id", user_id).eq("profile_public", True) \
            .eq("status", "ACTIVE").limit(1).execute()
        return res.data[0] if res.data else None