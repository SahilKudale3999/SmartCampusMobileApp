# Smart Campus backend contract

Source reviewed: `smart-campus.zip` Spring Boot source (11 REST controllers).

Every successful response is wrapped as `{ success, message, data }`. The frontend Axios client unwraps `data` centrally. JWT authentication is `Authorization: Bearer <token>`; only `/api/auth/**` and `/api/courses/**` are public in the supplied `SecurityConfig`.

## Authentication

| Method | Path | Request | Result |
|---|---|---|---|
| POST | `/api/auth/login` | `email`, `password` | `token`, `user` |
| POST | `/api/auth/register` | User request | `token`, `user` |
| POST | `/api/users/login` | `email`, `password` | Legacy login response |

Roles: `ADMIN`, `FACULTY`, `STUDENT`.

## Resource endpoints

| Module | Base path | Operations beyond standard CRUD |
|---|---|---|
| Users | `/api/users` | `PATCH /{id}/activate`, `PATCH /{id}/deactivate`, `PUT /{id}/password` |
| Courses | `/api/courses` | CRUD |
| Students | `/api/students` | `GET /course/{courseId}`, `GET /roll/{rollNo}` |
| Faculty | `/api/faculty` | `GET /department/{department}`, `GET /dashboard/{facultyId}` |
| Subjects | `/api/subject` | `GET /course/{courseId}`, `GET /faculty/{facultyId}` |
| Assignments | `/api/assignments` | `GET /subject/{subjectId}` |
| Attendance | `/api/attendance` | `GET /student/{studentId}`, `/subject/{subjectId}`, `/date/{date}`, `/percentage?studentId=&subjectId=`; no all-records GET exists |
| Submissions | `/api/submissions` | `GET /assignment/{assignmentId}`, `/student/{studentId}`, `PATCH /{id}/grade?grade=` |
| Events | `/api/event` | `GET /upcoming` |
| Notices | `/api/notice` | CRUD |

Standard CRUD means `POST /`, `GET /`, `GET /{id}`, `PUT /{id}`, and `DELETE /{id}` where provided by the controller. Attendance intentionally omits `GET /`.

## Important integration notes

- Vite proxies `/api` to `http://localhost:8080` in development, avoiding the backend's restrictive CORS list.
- For a separately deployed frontend, add that production origin (and the Vite development origin if used) to Spring's `allowedOrigins`.
- The supplied backend authenticates most routes but does not enforce role-specific controller authorization. The frontend hides inaccessible modules by role; backend-side `@PreAuthorize` policies should be added before a production deployment.
