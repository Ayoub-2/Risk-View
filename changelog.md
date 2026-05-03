# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
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
