# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0-rc1] - 2026-05-25

### Added
- **Collaborative Workspaces & RBAC:**
  - Implemented database permissions table `workspace_shares` linking users and EBIOS assessments with active foreign key cascade deletes.
  - Added sharing REST API endpoints: `GET /assessments/{id}/shares` (get collaborators list), `POST /assessments/{id}/share` (invite teammate by email), and `DELETE /assessments/{id}/share/{share_id}` (revoke workspace share).
  - Added robust role verification dependency `get_permitted_assessment_record` protecting EBIOS details, EBIOS updates, and JSON/PDF exports.
  - Built invite/revoke overlay share modal in `ProjectDetails.jsx` for workspace owners.
  - Added color-coded role tags (`Propriétaire`, `Contributeur`, `Auditeur`) to project listings in `Dashboard.jsx`.
  - Added dynamic read-only locks wrapping EBIOS forms in `<fieldset disabled={readOnly}>` and warning banners in `EBIOSForm.jsx` to block Auditor modifications.
  - Disabled SoA textareas and hid the Save button in the Statement of Applicability cockpit for Auditor roles.

### Fixed
- **Export Route Isolation:** Corrected export routes to allow permitted workspace contributors and auditors to execute JSON/PDF exports, while retaining direct blockages on unauthorized users.
- **EBIOSForm JSX Syntax Mismatch:** Patched `EBIOSForm.jsx` to resolve a missing `</div>` tag that caused Webpack JSX parsing to fail (Unterminated JSX contents error). Recompile now succeeds flawlessly.

### Security Impact
- **RBAC Server-Side Enforcement:** Ensures that read-only auditors are barred from executing manual PUT payloads, returning a strict `403 Forbidden` response.
- **IDOR Protection:** Completely mitigates sequential assessment enumeration scans by verifying active workspace permit listings on all retrieval routes.
- **Safe Failure Modes:** Ensured that unauthorized access attempts fail loudly in the backend with generalized error states, leaving database schemas hidden.

## [1.2.0] - 2026-05-25

### Added
- **EBIOS RM Visual Analytics Dashboard:** Integrated dynamic executive GRC diagnostics (Socle de Sécurité WS1, Scénarios Évalués WS3/4, Risques Critiques, Atténuation Globale) and comparative side-by-side Recharts bar charts in `ProjectDetails.jsx`.
- **ISO 27001 Statement of Applicability (SoA) Compliance Engine:**
  - Implemented dynamic mapping logic cross-referencing Workshop 1 baseline controls and Workshop 5 risk treatments to categorize the 93 ISO 27001:2022 Annex A controls into *Applicable (Implémenté)*, *Applicable (En cours)*, and *Non Applicable (Exclus)*.
  - Added `soa_justifications` JSONB dictionary schema to the FastAPI Pydantic validator (`EbiosAssessmentInput`) to securely serialize and persist compliance justifications in PostgreSQL.
  - Refactored frontend to render an interactive Statement of Applicability matrix tab complete with domain filters (A.5, A.6, A.7, A.8), 4-card KPI summaries, and inline justification editors.
- **Premium ReportLab PDF Export Engine:**
  - Migrated backend export logic from standard FPDF to a high-fidelity ReportLab Platypus engine.
  - Implemented corporate styled cover page and custom A4 double-pass page-number canvas (`NumberedCanvas`) printing dynamic `"Page X sur Y"` footers, header dividers, and methodology citations.
  - Designed dynamic row-level risk severity color-coding, cell-wrapping Paragraph flowables, and column width bounds.
  - Appended **Annexe : Déclaration d'Applicabilité (ISO/IEC 27001:2022)** to the PDF export incorporating the 93 controls, compliance statuses, and user justifications.
- **Improved Global Notifications:** Replaced legacy blocking browser `alert()` popups in `ProjectDetails.jsx`, `EBIOSForm.jsx`, and `Register.jsx` with animated, non-blocking toast notifications using `react-toastify`.

### Fixed
- **Assessments List KeyError:** Fixed database `SELECT` query in `get_assessments` route within `routes_assessments.py` to fetch the `user_id` column explicitly, preventing 500 Internal Server Errors during JSON serialization.
- **Reload Redirection Race Condition:** Fixed React Router session loader race condition in `App.js` by initializing `token` state synchronously from `localStorage` on frame load, preventing unwanted session disconnections on reload or updates.

### Security Impact
- **IDOR Protections:** Ensured JWT authentication checks and ownership matches are enforced on all newly added routes and exports.
- **Input Validation & Sanitization:** Schema-less justifications and EBIOS parameters are validated through strict Pydantic character count limits and data type boundaries.
- **SSRF & HTML Injection Mitigated:** ReportLab PDF builder handles all user inputs as plain flowables under Helvetica, completely mitigating SSRF and script execution vectors.
- **Reduced Information Disclosure:** Fixed the 500 error key mismatch, ensuring database errors are handled gracefully without exposing stack traces.


## [1.1.0] - 2026-05-04

### Added
- Added `backend/app/api/dependencies.py` as the shared location for authentication, assessment ownership checks, and assessment serialization helpers.

### Changed
- Standardized export endpoints to:
  - `GET /api/v1/assessments/{id}/export/json`
  - `GET /api/v1/assessments/{id}/export/pdf`
- Refactored backend route modules to reuse shared auth and assessment access helpers instead of duplicating the same logic across files.
- Updated `frontend/src/pages/ProjectDetails.jsx` to use the standardized export routes.
- Updated `frontend/src/pages/Dashboard.jsx` to sort project history with a non-mutating pattern and to use the app-level logout callback.
- Updated `README.md` to reflect the v1.1.0 cleanup, canonical backend entrypoint, actual project structure, and current endpoint conventions.

### Removed
- Removed legacy backend entrypoint `backend/app/app.py`.
- Removed legacy backend schema file `backend/app/db/models.py`.
- Removed legacy frontend files:
  - `frontend/src/components/AuthForm.jsx`
  - `frontend/src/components/InputForm.jsx`
  - `frontend/src/pages/Home.jsx`

### Security Impact
- Reduced duplicate authorization code paths by centralizing token-based user resolution and owned-assessment lookup logic.
- Kept the existing authenticated export protections while making the route contract more consistent and easier to audit.

## [1.0.0] - Initial documented release

### Added
- **GRC Feature Expansion:** Integrated advanced InfoSecPanda-inspired features:
  - **Evidence Checklists:** "Definition-of-Done" fields for Baseline Controls and Risk Treatments to prove compliance.
  - **Contextual Guidance:** Interactive "Panda-style" help panels in Workshops 2 & 5 to explain Threat Sources, Objectives, and ISO/CIS controls.
  - **Cross-Walk Mapping:** Integrated subsets of ISO 27001 Annex A and CIS Controls for standardized risk treatment mapping.
  - **ROI Tracking:** Added a "Difficulty" metric to treatments, enabling the dashboard to automatically calculate and sort the highest ROI security improvements.
- **Documentation Overhaul:** Completely rewrote `README.md` for the v1.0.0 release to accurately reflect the new EBIOS RM architecture, PostgreSQL/Docker integration, UI refont, and future roadmap.
- Expanded `project-docs/analysis/infosecpanda_review.md` with detailed deep-dive reviews of NIST, ISO, and PCI DSS dashboards.
- Updated `project-docs/qa/qa_report_infosecpanda.md` with browser-based validation results.
- Created `project-docs/analysis/infosecpanda_review.md` containing an analysis of the InfoSecPanda website.
- Created `project-docs/qa/qa_report_infosecpanda.md` detailing QA testing for the website review task.
- **French Localization:** Translated the entire UI (Dashboard, Forms, Project details, Authentication) to French for native alignment with ANSSI standards.
- **Methodology References Footer:** Added a globally accessible footer citing EBIOS Risk Manager and ISO/IEC 27005 methodologies.
- **Project Management Architecture:** Introduced a dedicated `ProjectDetails` workspace, allowing users to view and update existing EBIOS systems dynamically.
- **Tabbed Editor Interface:** Refactored the `EBIOSForm` from a linear step-by-step wizard into a continuous tabbed interface (Context, Origins, Scenarios, Treatments) to easily edit specific system components.
- **Backend Update Endpoints:** Added `PUT /api/v1/assess/{id}` and `GET /api/v1/assessments/{id}` to support modifying existing project structures securely.
- Created `project-docs/poc/features_poc.md` to document all application features and functionality.
- Created `project-docs/qa/refactoring_qa.md` to detail security regression test results.
- Added comprehensive try-catch block error handling for all database operations in `routes_auth.py`, `routes_assessments.py`, and `routes_export.py`.
- Added authentication dependency and IDOR ownership verification to JSON and PDF export routes.
- Added simulated password hashing timing buffers to login endpoints.
- Added `Dockerfile` for backend and frontend.
- Added `docker-compose.yml` for unified application deployment.
- Updated `README.md` with explicit Windows environment setup commands and full Docker execution instructions.

### Changed
- **Aesthetic Overhaul:** Transitioned the application's global design system from standard blue to a premium "EBIOS Orange" (`#F97316`) and "Dark Grey" (`#111827`) color palette.
- **Typography:** Adopted the Google Font `Outfit` for a sleek, modern, and readable interface.
- **Dashboard Redesign:** The dashboard now acts purely as a "My Projects" list, providing a clearer overview of all active assessments rather than forcing an immediate new assessment.
- **Database Migration:** Migrated the backend database from MongoDB to PostgreSQL (`postgres:15-alpine`) using `asyncpg` and JSONB columns.
- **Docker Image Optimization:** Refactored Dockerfiles to utilize existing local images (`node:20-alpine` and `alpine:latest` for Python) to reduce bandwidth and build dependencies.

- **Architectural Pivot:** Migrated the entire application data model from generic NIST/ISO checklists to the structured 5-Workshop methodology of **EBIOS RM** and **ISO 27005**.
- Replaced flat `Threat` and `Control` schemas with structured EBIOS models (`RiskOrigin`, `RiskScenario`, `RiskTreatment`).
- Transformed the single-page `InputForm` into a dynamic multi-step wizard (`EBIOSForm.jsx`) guiding the user through the 5 EBIOS workshops.
- Updated Risk Engine to calculate Initial Risk vs. Residual Risk on a standard 4x4 matrix, discarding the generic 1-5 multiplier.
- Refactored frontend `Dashboard.jsx` to render EBIOS metrics and replaced generic charts with a custom 4x4 Risk Matrix (`HeatMap.jsx`).
- Rewrote the PDF Export engine to chronologically format the deliverable according to EBIOS RM workshops.
- Removed `.git` directory to detach from previous repository history and initialize a new project based on the existing `Security-Risk-Assessment-Dashboard` codebase.
- Moved all project files from the `Security-Risk-Assessment-Dashboard` subfolder to the parent directory (`Risk View`) and removed the empty subfolder.
- Refactored `schemas.py` to enforce strict length limits on strings and value constraints on numeric inputs.
- Refactored frontend `Dashboard.jsx` export links to authenticate securely via `axios` and trigger blob downloads.
- Removed hardcoded default fallback for `SECRET_KEY` in `config.py`.

### Added
- Created `project-docs/poc/features_poc.md` to document all application features and functionality.
- Created `project-docs/qa/refactoring_qa.md` to detail security regression test results.
- Added comprehensive try-catch block error handling for all database operations in `routes_auth.py`, `routes_assessments.py`, and `routes_export.py`.
- Added authentication dependency and IDOR ownership verification to JSON and PDF export routes.
- Added simulated password hashing timing buffers to login endpoints.
- Added `Dockerfile` for backend and frontend.
- Added `docker-compose.yml` for unified application deployment.
- Updated `README.md` with explicit Windows environment setup commands and full Docker execution instructions.

### Security Impact
- Detaching from the previous git history eliminates exposure of past commit messages, potential hardcoded secrets in the git history, and metadata from the original authors. This ensures a clean slate for security tracking in the new repository.
- File restructuring has no direct security impact but simplifies pathing and structural tracking.
- **IDOR Mitigated:** Export endpoints now explicitly require JWT authentication and ensure the requested document `user_id` matches the token `sub`.
- **Timing Attacks Mitigated:** Failed logins involving unregistered emails now hash a dummy password to ensure response times parallel valid but incorrect login attempts.
- **Data Integrity & XSS Mitigated:** Backend now enforces strict validation boundaries (min/max characters, valid integer ranges) via Pydantic `Field` rules, discarding malformed hostile data.
- **Hardcoded Secret Elimination:** Backend configuration requires `SECRET_KEY` directly from `.env`, failing securely if absent.
- **Information Leakage Mitigated:** All MongoDB operations are wrapped in try-catch to log failures securely while returning generalized 500 Server Errors, preventing stack trace disclosure.
- **Container Isolation Mitigated:** Implementing Docker ensures applications run in isolated environments, preventing direct host-level access and ensuring dependency constraints are consistently met across deployments.
