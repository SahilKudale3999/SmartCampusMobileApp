// Single source of truth for role-based navigation & route access.
// `roles: undefined` (or omitted) means "any authenticated user".
// Adjust freely as real permission rules get clarified with the backend.

export const NAV_CONFIG = [
  { path: "/", label: "Dashboard" }, // everyone lands here, content differs by role
  { path: "/users", label: "Users", roles: ["ADMIN"] },
  { path: "/faculty", label: "Faculty", roles: ["ADMIN"] },
  { path: "/students", label: "Students", roles: ["ADMIN", "FACULTY"] },
  { path: "/courses", label: "Courses" },
  { path: "/subjects", label: "Subjects" },
  { path: "/assignments", label: "Assignments" },
  { path: "/attendance", label: "Attendance" },
  { path: "/submissions", label: "Submissions" },
  { path: "/events", label: "Events" },
  { path: "/notices", label: "Notices" },
];

export function canAccess(path, role) {
  const entry = NAV_CONFIG.find((n) => n.path === path);
  if (!entry) return true; // unlisted paths default to open (e.g. /login, /register)
  if (!entry.roles) return true; // open to any authenticated role
  return entry.roles.includes(role);
}

export function visibleNavLinks(role) {
  return NAV_CONFIG.filter((entry) => !entry.roles || entry.roles.includes(role));
}
