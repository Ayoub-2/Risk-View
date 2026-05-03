![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Version: 1.0.0](https://img.shields.io/badge/Version-1.0.0-blue.svg)

# RiskView: Plateforme d'Analyse des Risques (EBIOS RM / ISO 27005)

A professional-grade, French-localized dashboard built for Governance, Risk, and Compliance (GRC) teams to conduct structured cybersecurity risk assessments. This tool is built specifically to align with the **EBIOS Risk Manager (ANSSI)** methodology and **ISO/IEC 27005**, enabling consultants, auditors, and internal security teams to evaluate, quantify, and visualize cyber risks effectively.

---

## 🌐 Project Overview (v1.0.0)

RiskView has evolved into a fully-fledged **Project Management Architecture**. It allows users to:

- Create and manage persistent security assessment "Workspaces" for various IT systems.
- Use a **Tabbed Editor** to systematically progress through EBIOS RM workshops (Context, Risk Origins, Strategic/Operational Scenarios, Risk Treatment).
- Automatically calculate Initial and Residual risk scores based on standardized EBIOS 4-level scales.
- View risks visually via interactive Heatmaps.
- Export assessment reports to JSON or PDF.
- Authenticate securely via JWT-based login.

---

## 🧩 Key Features

- 🇫🇷 **French Localization:** Native alignment with ANSSI terminology (Vraisemblance, Gravité, Bien Support, etc.).
- 🎨 **Premium Aesthetic:** Modern UI featuring the "Orange EBIOS" color palette and "Outfit" typography.
- 🏢 **Project Workspaces:** A dedicated launchpad to view, sort, and re-enter existing risk assessments.
- 📝 **Continuous Assessment:** `PUT` APIs allow for continuous updating of existing risk scenarios without duplicating records.
- 🔐 **Secure Authentication:** JWT-based sessions with hashed passwords and IDOR protection.
- 📊 **Risk Scoring with Visual Charts:** Dynamic, responsive heatmaps based on EBIOS standard annexes.

---

## ⚙️ Tech Stack

**Frontend:**
- React.js (React Router for Workspace Navigation)
- Tailwind CSS (Custom Design System)
- Chart.js (Heatmaps)
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
git clone https://github.com/abdmath/Security-Risk-Assessment-Dashboard.git
cd Security-Risk-Assessment-Dashboard
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
Risk View/
│
├── backend/
│   ├── app/
│   │   ├── api/v1/ (API Routes including auth, assessments, exports)
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
├── project-docs/       (QA Reports, Analysis, Evidence, PoC)
├── docker-compose.yml
├── VERSION
└── README.md
```

---

## 🔮 Future Enhancements (Roadmap)

- **Evidence Checklists:** "Definition-of-Done" fields to link controls to actual evidence.
- **Difficulty vs. Priority Ratings:** ROI tracking for risk treatments.
- **Cross-Walk Mapping:** Integrating ISO 27001 Annex A controls directly into the risk treatment selection.
- **Interactive Contextual Guidance:** Fly-out panels explaining threat sources and impacts in plain language.

---

## License
This project is licensed under the MIT License.
