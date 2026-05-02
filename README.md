# Arthlytics AI

> An AI-powered data analytics and collaboration platform. Upload CSV or Excel datasets and get automated statistics, smart data cleaning, AI-generated visualizations, natural language SQL querying, and real-time team collaboration — all via a production-grade REST + WebSocket API.

---

## Tech Stack

### Backend

| Layer | Technology | Version |
|---|---|---|
| **Framework** | FastAPI | 0.111.0 |
| **Runtime** | Python | 3.11+ |
| **Server** | Uvicorn (ASGI) | 0.29.0 |
| **Database** | PostgreSQL | — |
| **ORM** | SQLAlchemy | 2.0.30 |
| **Migrations** | Alembic | 1.13.1 |
| **Auth** | JWT (`python-jose`) + bcrypt (`passlib`) | 3.3.0 / 1.7.4 |
| **Data Processing** | Pandas + OpenPyXL | 2.2.2 / 3.1.2 |
| **AI — Visualization** | Google Gemini 2.5 Flash (`google-generativeai`) | 0.5.4 |
| **AI — SQL Agent** | LangChain + LangChain-Community + LangGraph | latest |
| **LLM — Primary** | Groq (`langchain-groq`) — llama-3.1-8b-instant | 0.1.6 |
| **LLM — Fallback** | Google Gemini (`langchain-google-genai`) | 1.0.6 |
| **LLM — Insights** | HuggingFace Inference API | — |
| **Vector Search** | FAISS (`faiss-cpu`) | 1.8.0 |
| **Embeddings** | Sentence-Transformers | 2.7.0 |
| **Tracing** | LangSmith | 0.7.37 |
| **Ephemeral DB** | SQLite (per-file, for SQL agents) | — |
| **Real-time** | WebSockets (FastAPI native) | — |
| **Validation** | Pydantic + pydantic-settings | 2.7.1 / 2.2.1 |
| **File I/O** | aiofiles | 23.2.1 |

---

## Project Structure

```
Arthlytics-AI/
├── backend/
│   ├── alembic/                      # Database migrations
│   │   └── versions/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py               # Register & login endpoints
│   │   │   ├── chat.py               # SmartQuery AI chat (SQL Agent)
│   │   │   ├── health.py             # Health check endpoint
│   │   │   ├── projects.py           # Project CRUD, member management, message history
│   │   │   ├── stats.py              # Dataset stats, auto-cleaning & cleaned file download
│   │   │   ├── upload.py             # File upload / list / delete
│   │   │   ├── visualize.py          # AI chart config & data generation
│   │   │   └── ws_chat.py            # WebSocket real-time project chat
│   │   ├── models/
│   │   │   ├── file.py               # UploadedFile SQLAlchemy model
│   │   │   ├── user.py               # User SQLAlchemy model
│   │   │   └── workspace.py          # Project, ProjectMember, Message models
│   │   ├── schemas/
│   │   │   ├── auth.py               # Pydantic schemas for auth
│   │   │   ├── file.py               # Pydantic schemas for files & stats
│   │   │   └── workspace.py          # Pydantic schemas for projects & members
│   │   ├── services/
│   │   │   ├── ai_service.py         # SmartQuery: CSV→SQLite, LangChain SQL Agent, humanize
│   │   │   ├── auth_service.py       # User creation, JWT encode/decode
│   │   │   ├── chart_service.py      # Gemini prompt, chart config & data builder
│   │   │   ├── clean_service.py      # Auto-cleaning pipeline, IQR outlier detection, NL insights
│   │   │   ├── data_service.py       # File save, DataFrame load, stats computation
│   │   │   └── ws_manager.py         # WebSocket connection manager (per-project rooms)
│   │   ├── config.py                 # App settings via pydantic-settings (.env)
│   │   ├── database.py               # SQLAlchemy engine, session factory, Base
│   │   ├── dependencies.py           # get_current_user JWT dependency
│   │   └── main.py                   # FastAPI app, CORS middleware, router registration
│   ├── alembic.ini
│   └── requirements.txt
└── frontend/                         # (in progress)
```

---

## API Endpoints

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Register a new user, returns JWT |
| `POST` | `/api/auth/login` | No | Login with credentials, returns JWT |

### Health

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | No | Service health check |

### File Management

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/upload` | Yes | Upload a CSV or XLSX file |
| `GET` | `/api/upload` | Yes | List all files uploaded by the current user |
| `DELETE` | `/api/upload/{file_id}` | Yes | Delete a file and its disk record |

### Data Statistics & Cleaning

| Method | Path | Auth | Query Params | Description |
|---|---|---|---|---|
| `GET` | `/api/stats/{file_id}` | Yes | `clean`, `remove_outliers`, `insights` | Per-column stats; optional auto-clean pipeline and NL insights |
| `GET` | `/api/stats/{file_id}/download-cleaned` | Yes | `filename` | Download a previously cleaned file |

### Smart Visualization

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/visualize` | Yes | Natural language query → Gemini generates chart config + aggregated data |

### SmartQuery AI Chat

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/chat` | Yes | Natural language query → LangChain SQL Agent answers from uploaded dataset |
| `DELETE` | `/api/chat/index/{file_id}` | Yes | Clear cached SQLite index for a file |

### Projects & Collaboration

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/projects` | Yes | Create a new project (creator auto-joined as Admin) |
| `GET` | `/api/projects` | Yes | List all projects the user is a member of |
| `GET` | `/api/projects/{project_id}` | Yes | Get project details |
| `DELETE` | `/api/projects/{project_id}` | Yes | Delete a project (owner only) |
| `POST` | `/api/projects/join` | Yes | Join a project via invite code |
| `DELETE` | `/api/projects/{project_id}/leave` | Yes | Leave a project (non-admin only) |
| `PATCH` | `/api/projects/{project_id}/members/{user_id}` | Yes (Admin) | Update a member's role (Admin / Editor / Viewer) |
| `DELETE` | `/api/projects/{project_id}/members/{user_id}` | Yes (Admin) | Remove a member from a project |
| `GET` | `/api/projects/{project_id}/messages` | Yes | Fetch paginated message history |

### WebSocket

| Protocol | Path | Auth | Description |
|---|---|---|---|
| `WS` | `/ws/project/{project_id}?token=<jwt>` | Yes | Real-time project chat room |

---

## Development Phases

| Phase | Status | Work Done |
|---|---|---|
| 1 | ✅ Done | **Project Setup** — FastAPI app, config, PostgreSQL via SQLAlchemy, Alembic, CORS, health endpoint |
| 2 | ✅ Done | **Auth System** — User model, JWT register/login, `get_current_user` dependency, bcrypt password hashing |
| 3 | ✅ Done | **File Upload** — Upload / list / delete CSV & XLSX files; metadata (shape, columns) stored in DB |
| 4 | ✅ Done | **Data Statistics** — Per-column stats (dtype, nulls, mean, median, std, top values), duplicate & missing-cell counts, sample rows |
| 5 | ✅ Done | **Smart Visualization** — Gemini 2.5 Flash generates chart type, axes & aggregation from a natural language query; backend builds and returns ready-to-render data points |
| 6 | ✅ Done | **SmartQuery AI Chat** — CSV/XLSX → ephemeral SQLite; LangChain SQL Agent (Groq primary, Gemini fallback) answers natural language questions; LangSmith tracing integrated |
| 7 | ✅ Done | **Auto Data Cleaning** — Duplicate removal, missing-value imputation (median/mode), dtype coercion, IQR outlier detection & optional removal; NL insights via HuggingFace; before/after comparison; cleaned file download |
| 8 | ✅ Done | **Projects & Collaboration** — Project CRUD with invite-code join, role-based membership (Admin / Editor / Viewer), persisted message history, real-time WebSocket chat rooms |

---

## Getting Started

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Copy and fill in your environment variables
cp .env.example .env

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

Interactive API docs are available at `http://localhost:8000/docs`.

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes* | — | Full PostgreSQL connection string (overrides individual DB_* vars) |
| `DB_USER` | Yes* | `postgres` | PostgreSQL username |
| `DB_PASSWORD` | Yes* | — | PostgreSQL password |
| `DB_HOST` | Yes* | `localhost` | PostgreSQL host |
| `DB_PORT` | Yes* | `5432` | PostgreSQL port |
| `DB_NAME` | Yes* | `arthlytics_db` | PostgreSQL database name |
| `JWT_SECRET_KEY` | Yes | — | Secret key for signing JWTs |
| `GEMINI_API_KEY` | Yes | — | Google Gemini API key (visualization & fallback LLM) |
| `GROQ_API_KEY` | No | — | Groq API key (primary LLM for SQL Agent) |
| `HF_API_KEY` | No | — | HuggingFace Inference API key (NL cleaning insights) |
| `LANGSMITH_API_KEY` | No | — | LangSmith API key (agent tracing) |
| `LANGSMITH_PROJECT` | No | — | LangSmith project name |
| `LANGSMITH_ENDPOINT` | No | — | LangSmith endpoint URL |
| `UPLOAD_DIR` | No | `./uploads` | Directory to store uploaded files |
| `MAX_UPLOAD_SIZE_MB` | No | `10` | Maximum allowed upload size in MB |
| `ENV` | No | `development` | Runtime environment (`development` / `production`) |

> \* Provide either `DATABASE_URL` **or** the individual `DB_*` variables.