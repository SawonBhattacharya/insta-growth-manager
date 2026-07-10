# Auth Testing Playbook

See `/app/memory/test_credentials.md` for the canonical instructions. Use the mongosh snippet to mint a test user and session, then call protected endpoints with the printed `session_token` as either a Bearer token or `session_token` cookie.

Quick checklist:
- `GET /api/auth/me` with the token → 200 with user data
- `POST /api/projects` with token + JSON body → 200
- `GET /api/projects` with token → list
- `POST /api/projects/{id}/uploads` with multipart (`file`, `platform`) → 200
- `POST /api/projects/{id}/analyze` → returns `{report_id, status: "running"}`; poll `GET /api/reports/{id}` until status=complete
