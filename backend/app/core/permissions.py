ALL_ROLES = {
    "SUPER_ADMIN", "ADMIN", "STAFF", "FOUNDER", "BUILDER",
    "STUDENT", "MENTOR", "INVESTOR", "PARTNER",
}

# Roles a user may pick for themselves during onboarding. Never admin/staff.
SELF_SERVICE_ROLES = {"FOUNDER", "BUILDER", "STUDENT", "MENTOR", "INVESTOR", "PARTNER"}

ADMIN_PERMISSIONS = {
    "applications.read", "applications.review",
    "users.read", "users.manage",
    "startups.read", "startups.write",
    "programs.manage", "events.manage",
    "investors.read", "investors.verify", "investors.access",
    "mentors.manage", "partners.manage",
    "analytics.read", "audit_logs.read",
}

STAFF_PERMISSIONS = {
    "applications.read", "applications.review",
    "startups.read", "events.manage", "analytics.read",
}


def permissions_for(role: str) -> list[str]:
    if role == "SUPER_ADMIN":
        return sorted(ADMIN_PERMISSIONS)
    if role == "ADMIN":
        return sorted(ADMIN_PERMISSIONS - {"audit_logs.read"} | {"audit_logs.read"})
    
    if role == "STAFF":
        return sorted(STAFF_PERMISSIONS)
    return []