from supabase import create_client
from app.core.config import settings

# Service-role client: bypasses RLS, so every permission check must happen in the API.
supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)