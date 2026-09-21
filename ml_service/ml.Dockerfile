# ml_service/Dockerfile
#
# app.py reads REDIS_URL env var (Azure) or REDIS_HOST/PORT (local).
# Both are handled automatically — no changes needed to app.py.

FROM python:3.11-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Pre-download the sentence-transformers model into the image.
# This avoids a slow download on every cold start in Azure.
RUN PYTHONPATH=/install/lib/python3.11/site-packages \
    python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y libpq5 ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /install /usr/local
COPY --from=builder /root/.cache /root/.cache

COPY app.py .
COPY external_data.py .

RUN useradd -m -u 1001 mluser && chown -R mluser:mluser /app
USER mluser

EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]