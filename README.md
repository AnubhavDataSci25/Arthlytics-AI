# Arthlytics AI

An AI-powered data analytics platform. Upload a CSV or Excel dataset and get automated statistics, data quality insights, and AI-generated interactive visualizations — all via a REST API.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI, Python 3.11+ |
| Database | PostgreSQL + SQLAlchemy (ORM) + Alembic (migrations) |
| Auth | JWT (python-jose), bcrypt (passlib) |
| Data | Pandas, OpenPyXL |
| AI | Google Gemini 2.5 Flash (`google-generativeai`) |
| Server | Uvicorn |

---

## Project Structure

```
Arthlytics-AI/
└── backend/
    ├── alembic/                # Database migrations
    │   └── versions/
    ├── app/
    │   ├── api/
    │   │   ├── auth.py         # Register & login endpoints
    │   │   ├── health.py       # Health check endpoint
    │   │   ├── stats.py        # Dataset statistics endpoint
    │   │   ├── upload.py       # File upload/list/delete endpoints
    │   │   └── visualize.py    # AI chart generation endpoint
    │   ├── models/
    │   │   ├── user.py         # User SQLAlchemy model
    │   │   └── file.py         # UploadedFile SQLAlchemy model
    │   ├── schemas/
    │   │   ├── auth.py         # Pydantic schemas for auth
    │   │   └── file.py         # Pydantic schemas for files & stats
    │   ├── services/
    │   │   ├── auth_service.py # User creation, JWT logic
    │   │   ├── data_service.py # File save, dataframe load, stats compute
    │   │   └── chart_service.py# Gemini prompt, chart config & data builder
    │   ├── config.py           # App settings (env vars via pydantic-settings)
    │   ├── database.py         # SQLAlchemy engine & session
    │   ├── dependencies.py     # get_current_user JWT dependency
    │   └── main.py             # FastAPI app, CORS, router registration
    ├── alembic.ini
    └── requirements.txt
```

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Register new user, returns JWT |
| POST | `/api/auth/login` | No | Login, returns JWT |
| POST | `/api/upload` | Yes | Upload CSV/XLSX file |
| GET | `/api/upload` | Yes | List user's uploaded files |
| DELETE | `/api/upload/{file_id}` | Yes | Delete a file |
| GET | `/api/stats/{file_id}` | Yes | Get dataset statistics |
| POST | `/api/visualize` | Yes | Generate AI chart config + data |

---

## Development Phases

| Phase | Work Done |
|---|---|
| 1 | Project setup — FastAPI app, config, database, CORS, health endpoint |
| 2 | Auth system — User model, JWT register/login, protected route dependency |
| 3 | File upload — Upload/list/delete CSV & XLSX files with metadata stored in DB |
| 4 | Data statistics — Per-column stats (dtype, nulls, mean, median, std, top values), duplicate & missing cell counts, sample rows |
| 5 | Smart visualization — Gemini 2.5 Flash generates chart config (type, axes, aggregation) from a natural language query; backend builds and returns data points |

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

API docs available at `http://localhost:8000/docs`.

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Full PostgreSQL connection string |
| `JWT_SECRET_KEY` | Secret key for signing JWTs |
| `GEMINI_API_KEY` | Google Gemini API key |
| `UPLOAD_DIR` | Directory to store uploaded files (default: `./uploads`) |
| `MAX_UPLOAD_SIZE_MB` | Max upload size in MB (default: `10`) |