![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Version: 2.0.0-rc1](https://img.shields.io/badge/Version-2.0.0--rc1-orange.svg)

# RiskView: Plateforme d'Analyse des Risques (EBIOS RM / ISO 27005)

A professional-grade, French-localized dashboard built for Governance, Risk, and Compliance (GRC) teams to conduct structured cybersecurity risk assessments. This tool is built specifically to align with the **EBIOS Risk Manager (ANSSI)** methodology and **ISO/IEC 27005**, enabling consultants, auditors, and internal security teams to evaluate, quantify, and visualize cyber risks effectively.

---

## 🌐 Project Overview (v2.0.0-rc1)

RiskView has evolved into a fully-fledged **Collaborative Workspace & Project Management Architecture**. It allows users to:

- Create and manage persistent security assessment "Workspaces" for various IT systems.
- View a **Visual GRC Cockpit** containing diagnostic KPI cards (conformity index, critical risk count, attenuation rate) and dynamic **Comparative Risk Score Bar Charts** using Recharts.
- Use a **Tabbed Editor** to systematically progress through EBIOS RM workshops (Context, Risk Origins, Strategic/Operational Scenarios, Risk Treatment).
- View residual risks visually via interactive 4x4 standard EBIOS Risk Matrices.
- Export premium, publication-grade **PDF Executive Reports** powered by ReportLab, featuring structured cover pages, auto-wrapping styled tables, and dynamic risk severity row color-coding.
- Export raw assessment schema to JSON.
- Authenticate securely via JWT-based login.
- Operate on a simplified codebase with legacy flows removed and a single canonical backend entrypoint.

---

## 🧩 Key Features

- 🇫🇷 **French Localization:** Native alignment with ANSSI terminology (Vraisemblance, Gravité, Bien Support, etc.).
- 🎨 **Premium Aesthetic:** Modern UI featuring the "Orange EBIOS" color palette and "Outfit" typography.
- 🛡️ **ISO 27001 SoA Compliance Engine:**
  - **Dynamic Cross-Workshop Mapping:** Automatically cross-references security measures from Workshop 1 (Socle) and Workshop 5 (Traitements) to classify Annex A controls.
  - **Interactive Matrix Tab:** Allows seamless switching to the SoA tab containing domain filters (A.5, A.6, A.7, A.8), progress KPI metrics, and inline exclusion justifications.
  - **Publication-Grade PDF Annex:** Automatically generates and appends an official Statement of Applicability Annex to the ReportLab PDF export with color-coded status rows.
- 🏢 **Project Workspaces:** A dedicated launchpad to view, sort, and re-enter existing risk assessments.
- 👥 **Collaborative Workspaces & RBAC:** Multi-tenant workspace sharing with custom roles (`Owner`, `Contributor`, `Auditor`). Read-only auditor view with automatic `<fieldset>` form locks, and permission-isolated backend routing.
- 📝 **Continuous Assessment:** `PUT` APIs allow for continuous updating of existing risk scenarios without duplicating records.
- 🔐 **Secure Authentication:** JWT-based sessions with hashed passwords and IDOR protection.
- 📊 **Risk Scoring with Visual Charts:** Dynamic, responsive heatmaps and comparative Recharts bar charts based on EBIOS standard annexes.
---

## ⚙️ Tech Stack

**Frontend:**
- React.js (React Router for Workspace Navigation)
- Tailwind CSS (Custom Design System)
- Custom React-based 4x4 Heatmap rendering
- Axios

**Backend:**
- FastAPI
- PostgreSQL (via `asyncpg` with `JSONB` for nested EBIOS data structures)
- Pydantic
- JWT Authentication

---

## 🐳 Docker Setup (Recommended)

You can run the entire application stack (Frontend, Backend, and PostgreSQL) easily using Docker Compose. The environment is configured with **Volume Mounts** for hot-reloading during development.

1. Ensure Docker and Docker Compose are installed on your system.
2. In the root directory of the project, create a `.env` file for the backend variables if you haven't already.
3. Run the following command:

```bash
docker compose up -d
```

This will:
- Spin up a PostgreSQL container (`risk_view_postgres`) on port `5432`.
- Start the FastAPI backend (`risk_view_backend`) on port `8000` (auto-reloading on code changes).
- Start the React frontend (`risk_view_frontend`) on port `3000` (auto-reloading on code changes).

To stop the containers:
```bash
docker compose down
```

---

## 🛠️ Local Development Setup (Manual)

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd Risk-View
```

### 2. Backend Setup (FastAPI - Windows Focus)

```powershell
cd backend
python -m venv venv

# Activate virtual environment on Windows (PowerShell):
.\venv\Scripts\Activate.ps1

pip install -r requirements.txt
```

Create a `.env` file inside the `backend/` folder:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/security_dashboard
SECRET_KEY=your_secure_random_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

Run the FastAPI server:

```bash
uvicorn app.main:app --reload
```

The canonical backend entrypoint is `backend/app/main.py`.

### 3. Frontend Setup (React)

```bash
cd ../frontend
npm install
```

Create a `.env` file inside the `frontend/` folder:
```env
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
```

Start the React app:
```bash
npm start
```

---

## 📁 Project Structure

```text
Risk-View/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── dependencies.py (Shared auth and assessment helpers)
│   │   │   └── v1/ (API routes including auth, assessments, exports)
│   │   ├── core/   (Security & configuration)
│   │   ├── db/     (PostgreSQL connection pool & Pydantic Schemas)
│   │   └── services/ (Risk Model Calculation logic)
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/ (EBIOSForm, HeatMap, Footer)
│   │   ├── pages/      (Dashboard, ProjectDetails, Login, Register)
│   │   └── services/   (Axios API Client)
│   ├── Dockerfile
│   ├── tailwind.config.js
│   └── package.json
│
├── cleanup-plan.md
├── docker-compose.yml
├── VERSION
└── README.md
```

---

## 🔌 API Notes

- Base API path: `/api/v1`
- Assessment detail route: `GET /api/v1/assessments/{id}`
- Assessment update route: `PUT /api/v1/assess/{id}`
- Export routes:
	- `GET /api/v1/assessments/{id}/export/json`
	- `GET /api/v1/assessments/{id}/export/pdf`

---

## 🔮 Future Enhancements (Roadmap)

- **Multilingual UI i18n Localization:** Full, runtime dynamic toggle between English and French catalogs and interface layouts.
- **Interactive STRIDE/LINDDUN Threat Modeling:** Advanced visual module to map system supports directly to structured threat categories.
- **CVE/GHSA Vulnerability Integration:** Automated feeds fetching known CVEs to enrich Workshop 3 and 4 supporting asset vulnerability assessments.

---

## License
This project is licensed under the MIT License.
