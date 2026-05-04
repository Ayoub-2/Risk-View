# Recommended Cleanup Order

## 1. Remove or quarantine legacy flows

Target files:
- `frontend/src/components/AuthForm.jsx`
- `frontend/src/pages/Home.jsx`
- `frontend/src/components/InputForm.jsx`
- `backend/app/db/models.py`
- `backend/app/app.py`

Actions:
- Confirm whether these files are still referenced by the active application flow.
- Remove unused files or move them into a clearly marked legacy area.
- Keep `backend/app/main.py` as the single backend entrypoint.
- Keep the EBIOS-based frontend flow as the canonical UX.

Why first:
- These files introduce conflicting patterns, duplicate logic, and route inconsistencies.
- Cleanup here reduces the risk of fixing the wrong flow later.

---

## 2. Fix route consistency in frontend API calls

Focus areas:
- Standardize singular vs plural route naming (`assessment` vs `assessments`).
- Ensure frontend calls match the backend route contract exactly.
- Remove any duplicated `/api/v1` prefixes from component calls because `frontend/src/services/api.js` already defines the base path.

Known candidates:
- `frontend/src/components/InputForm.jsx`
- `frontend/src/pages/ProjectDetails.jsx`
- Any other component making direct API calls

Why second:
- Route mismatches create runtime failures even when the UI looks correct.
- This is a high-value fix once legacy code is isolated.

---

## 3. Remove state mutation in `Dashboard.jsx`

Target file:
- `frontend/src/pages/Dashboard.jsx`

Actions:
- Replace in-place `history.sort(...)` with a non-mutating pattern such as sorting a copied array.
- Review derived state patterns to avoid accidental mutation elsewhere.

Why third:
- Direct state mutation can cause subtle UI bugs and unstable renders.
- This is a focused correctness fix with low implementation risk.

---

## 4. Tighten CORS and auth handling

Target areas:
- `backend/app/main.py`
- `backend/app/api/v1/routes_auth.py`
- `backend/app/api/v1/routes_assessments.py`
- `backend/app/core/security.py`

Actions:
- Replace permissive CORS settings with explicit allowed origins.
- Consolidate duplicated auth-related logic where possible.
- Review token handling strategy and session lifecycle.
- Consider adding rate limiting and stronger operational safeguards.

Why fourth:
- Security improvements are important, but they should follow flow consolidation and route cleanup.
- Hardening is easier after the active code paths are clear.

---

## 5. Add shared backend helpers for auth and assessment access

Target areas:
- `backend/app/api/v1/routes_auth.py`
- `backend/app/api/v1/routes_assessments.py`
- `backend/app/api/v1/routes_export.py`

Actions:
- Extract shared user-resolution logic.
- Extract shared assessment-loading and authorization checks.
- Reduce repeated query and validation patterns.

Why fifth:
- This improves maintainability after the main correctness and cleanup work is done.
- Refactoring shared helpers is safer once endpoint behavior is already consistent.

---

## Suggested execution notes

- Do not refactor legacy and active flows at the same time without first identifying which files are actually used.
- After each cleanup step, re-test:
  - login
  - register
  - dashboard listing
  - project creation
  - project update
  - JSON export
  - PDF export
- Prefer small, isolated commits per cleanup step.
