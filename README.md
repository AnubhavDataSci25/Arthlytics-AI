# Arthlytics AI

AI-powered analytics and collaboration platform for CSV/XLSX datasets: clean, analyze, visualize, query with AI, and collaborate in real time.

---

## Latest Changes

- Frontend docs page added and available at `/docs` (`frontend/src/pages/Docs.jsx`).
- Frontend app structure is now active (React + Vite + Tailwind), not just placeholder/in-progress.
- Root documentation updated to include frontend setup and frontend docs scope.

---

## Project Structure

```text
Arthlytics-AI/
├── backend/
│   ├── alembic/                      # Database migrations
│   ├── app/
│   │   ├── api/                      # FastAPI route modules
│   │   ├── models/                   # SQLAlchemy models
│   │   ├── schemas/                  # Pydantic schemas
│   │   ├── services/                 # Business and AI services
│   │   ├── config.py
│   │   ├── database.py
│   │   └── main.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── pages/                    # Landing, Dashboard, Docs, Auth pages
    │   ├── components/               # Layout and reusable UI
    │   ├── services/                 # API/auth service layer
    │   ├── store/                    # Zustand state store
    │   ├── App.jsx                   # Route configuration
    │   └── main.jsx                  # App bootstrap
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

---

## Tech Stack

### Backend

| Layer | Technology |
|---|---|
| Framework | FastAPI |
| Runtime | Python 3.11+ |
| Database | PostgreSQL |
| ORM / Migrations | SQLAlchemy / Alembic |
| Authentication | JWT + bcrypt |
| Data Processing | Pandas + OpenPyXL |
| AI / Agents | LangChain, LangGraph, Groq, Gemini, HuggingFace |
| Realtime | FastAPI WebSockets |

### Frontend

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| Data Fetching | Axios + React Query |
| State | Zustand |
| Charts | Recharts |
| UI | Lucide icons, react-hot-toast |

---

## Core Features

- **CleanStats**: automated cleaning + descriptive statistics.
- **AutoViz**: natural language to chart configuration/data.
- **SmartQuery**: natural language SQL-style querying via AI agent.
- **Workspace**: invite-code projects, member roles, and real-time chat.

---

## Backend API Overview

| Area | Endpoints |
|---|---|
| Auth | `/api/auth/register`, `/api/auth/login` |
| Upload | `/api/upload` (POST/GET/DELETE) |
| Stats/Cleaning | `/api/stats/{file_id}`, `/api/stats/{file_id}/download-cleaned` |
| Visualization | `/api/visualize` |
| AI Chat | `/api/chat`, `/api/chat/index/{file_id}` |
| Projects | `/api/projects` + member/message routes |
| WebSocket | `/ws/project/{project_id}?token=<jwt>` |

---

## Frontend Docs

- **Route:** `/docs`
- **Source file:** `frontend/src/pages/Docs.jsx`
- **Scope covered in docs page:**
  - Getting Started
  - Core Features (CleanStats, AutoViz, SmartQuery, Workspace)
  - AI & Models
  - Architecture (Frontend/Backend/Database/AI layer)
  - Security & Privacy
  - Collaboration and roles

---

## Getting Started

### 1) Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

Backend docs: `http://localhost:8000/docs`

### 2) Frontend

```bash
cd frontend
npm ci
npm run dev
```

Frontend app: `http://localhost:5173`  
Frontend docs page: `http://localhost:5173/docs`

---

## Environment Variables (No Secret Values)

Do not commit real secrets/API keys.

### Backend (`backend/.env`)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` or `DB_*` | PostgreSQL connection configuration |
| `JWT_SECRET_KEY` | JWT signing secret |
| `GEMINI_API_KEY` | Gemini model access |
| `GROQ_API_KEY` | Groq model access |
| `HF_API_KEY` | HuggingFace inference access |
| `LANGSMITH_*` | LangSmith tracing configuration |
| `UPLOAD_DIR`, `MAX_UPLOAD_SIZE_MB` | File upload storage/limit settings |
| `ENV` | Runtime mode |

### Frontend (`frontend/.env`)

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Optional frontend API base URL override |

---

## Development Status

All backend phases (setup, auth, upload, stats/cleaning, visualization, SmartQuery, collaboration) are implemented, and frontend foundations with dedicated docs page are in place.
