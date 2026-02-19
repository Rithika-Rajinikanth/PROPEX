# Real Estate Agent

A full-stack real estate platform with price analytics, ML-powered predictions, and Zillow data integration.

## Project Structure

| Directory | Tech Stack | Description |
|-----------|------------|-------------|
| `backend/` | Rust (Axum) | REST API with PostgreSQL, Redis, JWT auth |
| `frontend/` | Next.js 16, React 19 | Web UI with Tailwind CSS |
| `ml_service/` | Python (FastAPI) | ML price prediction service |
| `zillow_pipeline/` | Python | Scripts to load Zillow data into the database |

## Features

- **Regions & Analytics** — Browse metro regions and view market metrics
- **Search** — Search listings and properties
- **AI** — AI-powered insights and recommendations
- **Price Predictions** — ML-based price forecasting (linear regression)
- **User Auth** — JWT authentication with user management

## Prerequisites

- **Rust** (backend)
- **Node.js** 20+ (frontend)
- **Python** 3.10+ (ML service, Zillow pipeline)
- **PostgreSQL**
- **Redis**

## Quick Start

### Backend (Rust API)

```bash
cd backend/real_estate_api
cp .env.example .env   # Configure DATABASE_URL, REDIS_URL, etc.
cargo run
```

API runs at `http://localhost:8080` (default).  
Swagger UI: `http://localhost:8080/swagger-ui`

### Frontend (Next.js)

```bash
cd frontend/real-estate-frontend
npm install
npm run dev
```

Runs at `http://localhost:3000`.

### ML Service

```bash
cd ml_service
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn app:app --reload
```

### Zillow Pipeline

Load Zillow CSV data into PostgreSQL:

```bash
cd zillow_pipeline
pip install pandas psycopg2-binary python-dotenv
python load_zillow.py
```

Place Zillow CSV files in `zillow_pipeline/data/`.

## Environment Variables

- **Backend**: `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `HOST`, `PORT`
- **Zillow pipeline**: `DATABASE_URL` (PostgreSQL connection string)

## License

MIT
