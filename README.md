![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

# Security Risk Assessment Dashboard (NIST CSF / ISO 27001 Based)

A professional-grade dashboard built for Governance, Risk, and Compliance (GRC) teams to conduct structured cybersecurity risk assessments. This tool helps align organizational risks with control frameworks like **NIST Cybersecurity Framework (CSF)** and **ISO/IEC 27001**, enabling consultants, auditors, and internal security teams to evaluate, quantify, and visualize cyber risks effectively.

---

## 🌐 Project Overview

This application allows users to:

- Enter system details, known threats, and security controls  
- Map entries to NIST CSF or ISO 27001 domains  
- Automatically calculate risk scores using custom logic  
- View risks visually via heatmaps and radar charts  
- Export assessments to JSON or PDF  
- Authenticate securely via JWT-based login  

---

## 🧩 Key Features

- 🔐 Secure Authentication System  
- 📋 Dynamic Risk Assessment Input Form  
- 📊 Risk Scoring with Visual Charts  
- 📂 Assessment Export (JSON / PDF)  
- ♻️ Assessment History and Review  
- 📚 Framework Mapping (NIST & ISO)

---
## 📷 Screenshots
![ss1](https://github.com/user-attachments/assets/023ea255-9ba5-434c-9175-8b8630cb0a23)
![ss2](https://github.com/user-attachments/assets/b57154d6-a905-49cb-90b6-d9fb41e2964d)
![ss3](https://github.com/user-attachments/assets/ba147c28-a939-4fd0-9b3d-63f393d829f6)
![ss4](https://github.com/user-attachments/assets/19544390-4d31-4fa3-a559-977d4b317450)
![ss5](https://github.com/user-attachments/assets/6d7471c4-fd8c-433a-997a-45e14b7faea7)

## Sample PDF Report
[report (2).pdf](https://github.com/user-attachments/files/20963098/report.2.pdf)
---
## ⚙️ Tech Stack

**Frontend:**

- React.js  
- Tailwind CSS  
- Chart.js  
- Axios  
- React Toastify  

**Backend:**

- FastAPI  
- PostgreSQL (Asyncpg)  
- Pydantic  
- JWT Authentication  

---

## 🛠️ Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/abdmath/Security-Risk-Assessment-Dashboard.git
cd Security-Risk-Assessment-Dashboard
# (Note: For this local setup, the codebase is in the root directory)
```

### 2. Backend Setup (FastAPI - Windows Focus)

```powershell
cd backend
python -m venv venv

# Activate virtual environment on Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# (For Command Prompt, use: venv\Scripts\activate.bat)
# (For Unix/macOS, use: source venv/bin/activate)

pip install -r requirements.txt
```

Create a `.env` file inside the `backend/` folder (or at the root depending on configuration):

```env
DATABASE_URL=postgresql://user:password@localhost:5432/security_dashboard
# IMPORTANT: You must provide a secure random string for SECRET_KEY. The app will fail to start without it.
SECRET_KEY=your_secure_random_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

Run the FastAPI server:

```
uvicorn app.main:app --reload
```

Your backend will run at: http://localhost:8000

---
### 3. Frontend Setup (React)

```
cd ../frontend
npm install
```
Create a .env file inside the frontend/ folder:
```
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
```
Start the React app:
```
npm start
```
Frontend will run at: http://localhost:3000

---

## 🐳 Docker Setup

You can run the entire application stack (Frontend, Backend, and PostgreSQL) easily using Docker Compose.

1. Ensure Docker and Docker Compose are installed on your system.
2. In the root directory of the project, create a `.env` file for the backend variables if you haven't already.
3. Run the following command:

```bash
docker-compose up --build -d
```

This will:
- Spin up a PostgreSQL container (`risk_view_postgres`) on port `5432`.
- Build and run the FastAPI backend (`risk_view_backend`) on port `8000`.
- Build and run the React frontend (`risk_view_frontend`) on port `3000`.

To stop the containers:
```bash
docker-compose down
```

---

## 📁 Project Structure

```
Security-Risk-Assessment-Dashboard/
│
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   ├── core/
│   │   ├── db/
│   │   └── services/
│   ├── requirements.txt
│   ├── start.sh
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── services/
│   ├── public/
│   ├── .env
│   └── package.json
│
└── README.md
```
---

## 🔮 Future Enhancements

- Role-Based Access Control (RBAC)
- Compliance Checklist per Framework
- Risk Trends & Timeline Graphs
- XLSX Export & Email Integration
- AI Risk Suggestion Engine

---

## License
This project is licensed under the MIT License.
