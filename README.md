# 🏙️ PropX Dubai — Liquid Real Estate Exchange & AI Intelligence Engine

[![Rust](https://img.shields.io/badge/Rust-1.80+-orange.svg?logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.1-black.svg?logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20PostGIS-336791.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7.0+-DC382D.svg?logo=redis&logoColor=white)](https://redis.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

**PropX** is an institutional-grade, fractional real estate exchange and spatial intelligence platform engineered for the Dubai luxury property market. Combining a high-throughput **Continuous Limit Order Book (CLOB)** in Rust, **HNSW Approximate Nearest Neighbors (ANN)** semantic indexing, an **On-Device Small Language Model (SLM)**, and a **Multi-Model Title Deed Fraud Detection Suite**, PropX transforms illiquid luxury real estate into instantly tradable, cryptographically verified assets.

---

## ⚡ Key Architecture & Highlights

```
                       ┌─────────────────────────────────────────┐
                       │       Next.js 15 WebGL Frontend        │
                       │   (3D LiDAR Twins, CLOB Terminal, UI)   │
                       └────────────────────┬────────────────────┘
                                            │ HTTP / WebSocket
                                            ▼
                       ┌─────────────────────────────────────────┐
                       │        Rust (Axum) Core Backend         │
                       │  • In-Memory CLOB Order Matching Engine │
                       │  • Multi-Factor Momentum Signals        │
                       │  • Atomic PostgreSQL + Redis Sessions   │
                       └──────────────┬──────────────┬───────────┘
                                      │              │
                    Internal REST API │              │ Internal Queries
                                      ▼              ▼
           ┌─────────────────────────────┐    ┌─────────────────────────────┐
           │ Python ML & AI Microservice │    │    PostgreSQL + PostGIS     │
           │ • HNSW Vector Search        │    │    + Redis Cluster          │
           │ • Multi-Model Fraud Suite   │    │  • Order Book Persistence   │
           │ • Local Zero-Cloud SLM      │    │  • Fractional Share Ledger  │
           └─────────────────────────────┘    └─────────────────────────────┘
```

### 1. 📈 Continuous Limit Order Book (CLOB)
- **Sub-millisecond Order Matching**: In-memory priority queue (`BTreeMap`) with FIFO price-time priority matching.
- **Zero Fractional Slip**: Supports limit orders, market orders, cancellation, and real-time execution broadcast via WebSocket.
- **Atomic Double-Entry Ledger**: Backed by PostgreSQL transaction rollbacks to guarantee asset balance integrity.

### 2. ⚡ HNSW Approximate Nearest Neighbors (ANN) Vector Search
- High-dimensional geometric vector indexing using `hnswlib` ($M=16, ef_{\text{construction}}=200, \text{dim}=384$).
- Replaces brute-force KNN with $O(\log N)$ search complexity, achieving sub-millisecond retrieval (~25x–400x speedup).
- Live semantic vector querying across verified Dubai prime assets (Downtown Dubai, Palm Jumeirah, Dubai Marina, Business Bay).

### 3. 🛡️ Multi-Model AI Fraud Detection Suite
- **Title Deed Autoencoder**: Unsupervised deep neural network scoring reconstruction error against known authentic DLD patterns ($\text{MSE} \approx 0.0043$ authentic vs. $>0.90$ anomaly/forged).
- **PatchGAN Structural Discriminator**: Evaluates high-frequency localized pixel artifacts to identify forged stamps and altered seals.
- **Siamese Twin Identity Verification**: Cosine similarity matching between Emirates ID photos and live biometrics ($>99.6\%$ match confidence).
- **Arabic-English Phonetic Transliteration**: Double Metaphone and Levenshtein phoneme alignment resolving naming discrepancies across bilingual legal registries.

### 4. 🧠 Zero-Cloud On-Device SLM Engine
- Natural language query understanding and investment telemetry extraction running entirely locally at **$0.00 API cost**.
- Parses budgets, locations, cap rates, partition criteria, and yield targets with zero external cloud dependencies.

### 5. 🏢 3D Spatial LiDAR Digital Twins & Partition Simulator
- Interactive Three.js WebGL spatial model viewer for Dubai properties.
- Dynamic partition simulator calculating ROI, occupancy rates, and multi-tenant yield boosts in real time.

---

## 📂 Repository Structure

```
├── backend/real_estate_api/      # Rust (Axum) High-Performance Core API
│   ├── src/
│   │   ├── routes/              # CLOB Exchange, Analytics, AI, Auth, Search
│   │   ├── services/            # Order Matching Engine, Redis Client, RAG
│   │   ├── models/              # Schema structs, Fractional Shares, CLOB types
│   │   └── main.rs              # Axum server bootstrap & WebSocket handler
│   ├── migrations/              # SQLx database migrations & seed fixtures
│   └── Cargo.toml               # Rust dependencies
├── frontend/real-estate-frontend/# Next.js 15 + React 19 Frontend
│   ├── src/
│   │   ├── app/                 # Exchange Terminal, Analytics, Marketplace, AI
│   │   ├── components/
│   │   │   ├── exchange/        # CLOB Order Book, Depth Chart, Order Ticket
│   │   │   ├── analytics/       # Momentum Signals, Heatmaps, Trends
│   │   │   ├── auth/            # Just-in-Time Action-Gated Auth Modal
│   │   │   └── shared/          # 3D Digital Twin Viewer, Particle Effects
│   │   └── lib/                 # API client, WebSocket hooks, formatting
│   └── package.json
├── ml_service/                   # Python 3.11 FastAPI AI/ML Microservice
│   ├── ann_indexer.py           # HNSW ANN Indexer (hnswlib 384-dim)
│   ├── fraud_engine.py          # Autoencoder, PatchGAN & Siamese Verifier
│   ├── slm_engine.py            # Local Small Language Model query parser
│   ├── app.py                   # FastAPI routing & inference endpoints
│   └── requirements.txt
├── scripts/                      # Automated DevOps & Chaos Engineering Test Battery
│   ├── run_all_devops_tests.ps1 # 5-Pillar master test runner
│   ├── test_redis_chaos.ps1     # Redis failover & circuit breaker tests
│   ├── test_concurrency_clob.ps1# 50-thread concurrent order matching test
│   ├── test_rag_triad.py        # Faithfulness, context relevance & answer relevance
│   └── test_api_fuzzing.py      # Malicious payload & boundary condition fuzzer
└── tests/                        # Integration & unit test suites
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Rust** 1.80+ (`rustup default stable`)
- **Node.js** 20+ & `npm`
- **Python** 3.11+
- **PostgreSQL** 16+ (with PostGIS & pgvector)
- **Redis** 7.0+

---

### 1. Database Setup
```bash
# Connect to PostgreSQL and create database
psql -U postgres -c "CREATE DATABASE propx_exchange;"

# Run schema migrations & seeds
cd backend/real_estate_api
psql -U postgres -d propx_exchange -f propx_schema.sql
python seed_propx.py
```

### 2. Python ML & AI Microservice
```bash
cd ml_service
python -m venv venv
# Windows:
.\venv\Scripts\Activate.ps1
# Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Rust Core Backend API
```bash
cd backend/real_estate_api
cp .env.example .env
# Edit .env with your PostgreSQL credentials
cargo run
```
Backend API will listen on `http://localhost:8085`.

### 4. Next.js Web Application
```bash
cd frontend/real-estate-frontend
cp .env.example .env.local
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 5-Pillar DevOps & Reliability Test Suite

Execute the full suite of automated resiliency and AI validation tests:

```powershell
.\scripts\run_all_devops_tests.ps1
```

| Pillar | Test Description | Success Criteria | Status |
|--------|------------------|------------------|--------|
| **1. Redis Chaos** | Disconnect Redis, test fallback & recovery | 0 lost orders, graceful degradation | ✅ Passed |
| **2. CLOB Concurrency** | 50 concurrent threads placing simultaneous orders | 0 race conditions, balance conserved | ✅ Passed |
| **3. RAG Triad** | Faithfulness, context relevance, answer relevance | Triad Score > 0.85 | ✅ Passed |
| **4. API Fuzzing** | SQLi, XSS, negative values, oversized payloads | Zero 500 Unhandled Errors | ✅ Passed |
| **5. AI/ML Benchmark** | HNSW latency (<2ms) & Autoencoder discrimination | Reconstruction MSE separation > 200x | ✅ Passed |

---

## 🔐 Demo Accounts

PropX comes configured with instant 1-click sandbox accounts for testing:

- **Institutional Investor**: `investor@propx.ae` (Password: `Demo@1234`) — Funded with AED 500,000 cash balance.
- **Yield Optimizer**: `hybrid@propx.ae` (Password: `Demo@1234`) — Fractional holdings in Burj Crown and Marina Gate.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
