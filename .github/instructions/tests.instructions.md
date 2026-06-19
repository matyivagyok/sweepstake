---
applyTo: "backend/tests/**"
---

## Testing — pytest + FastAPI TestClient

**Fixtures:** Defined in `backend/tests/conftest.py`.
- Use `client_user_1` (auth bypassed via dependency override) for unit tests.
- Use `client_unauth` only when testing the actual cookie/JWT auth flow.
- Do not hand-write auth tokens or override dependencies inside individual test files.

**Model changes:** After any `models.py` change (new/removed/renamed fields, type changes, new relationships), verify existing tests still pass and add or update tests to cover the new behaviour. At minimum assert:
- New fields are returned in API responses.
- New fields are accepted in create/update requests.
- Validation behaves correctly.

**Run scope:** `pytest backend/tests/<touched_area>/` — always run the narrowest relevant test scope.
