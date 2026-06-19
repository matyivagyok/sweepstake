---
applyTo: "backend/**"
---

## Backend — FastAPI + SQLModel

**Structure:** One domain module = `models.py` + `crud.py` + `routers.py`. All domain areas live under `backend/src/<domain>/`.

**API docs:** Live in `routers.py` only — endpoint docstrings and field `description=` params. Do not duplicate in `crud.py` or `models.py`.

**Auth:** JWT via HttpOnly cookies. Endpoints use `Depends(verify_access_token)` → `token_payload["uid"]`. Never use Authorization headers. Never redesign the auth flow.

**DB access:** Always async. Preserve `Depends(get_db)`. Use `selectinload` for relationships (no N+1). Call `db.flush()` before reading auto-generated IDs. Encapsulate reusable filters in a `_query_x()` helper.

**Models:** Keep `table=True` SQLModel classes separate from Pydantic schemas (`XCreate`, `XRead`, `XUpdate`).

**Migrations:** Never hand-write Alembic migrations. Change SQLModel field definitions — migrations are auto-generated at startup from `/app/data/db_migrations`.

**Config:** All runtime config in `backend/src/config.py`. Settings are loaded (in priority order) from: environment variables → `data/.env.local` → `data/.env` → `data/settings.yaml`. Env var names match the uppercase field name (e.g. `SECRET_KEY`, `DATABASE_URL`). No hardcoded values in application code. When adding a new setting, also add a row to the **README.md environment variables table**.

**OpenAPI tags:** Router tag names are declared in `main.py`'s `tags_metadata`. Use only the existing tags: `auth`, `tournament`, `team`, `group`, `match`, `stage`, `predictions`, `stats`, `general`. Do not invent new tag strings.

**Model changes — cascade rule:** When any `models.py` field is added, removed, renamed, or retyped, audit every layer in order:

1. **`crud.py`** — Are any field names used that no longer exist? Are `selectinload` calls still referencing valid relationships? Are new required fields handled in create/update logic?
2. **`routers.py`** — Do `response_model` annotations match current `XRead` schemas? Are any field `description=` params stale? Do any endpoints still accept removed fields?
3. **Frontend `frontend/src/types/`** — Are any TypeScript fields stale (renamed/removed)? Are new fields present? Do optional/required markers match the backend schema?
4. **Frontend `frontend/src/api/`** — Do RTK Query request body types reference removed fields? Do response types match the updated `XRead`? Are cache tag types still valid?

Do not leave any layer inconsistent with the model.
