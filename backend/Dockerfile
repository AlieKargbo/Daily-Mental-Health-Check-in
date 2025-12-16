# Dockerfile (This remains the standard, secure version)

# --- STAGE 1: Build & Install Dependencies ---
FROM python:3.11-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
# Ensure pymongo[srv] is in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# --- STAGE 2: Final Runtime Image ---
FROM python:3.11-slim AS runtime

WORKDIR /app

# Copy the installed Python libraries
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages

# Copy the Python executables (like 'uvicorn')
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code (which contains the database.py logic to read MONGO_URI from env)
COPY . /app/ 

EXPOSE 7860

# CMD relies on the MONGO_URI and DB_NAME environment variables being set by Hugging Face Secrets.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]