# Dockerfile

# --- STAGE 1: Build & Install Dependencies ---
# Use a Python base image suitable for slim deployments
FROM python:3.11-slim AS builder

# Set working directory inside the container
WORKDIR /app

# Install system dependencies needed for some Python packages (like psycopg2 for Postgres)
# We include curl and build-essential just in case, which is good practice.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file
COPY requirements.txt .

# Install Python dependencies (transformers, torch, fastapi, pandas, etc.)
# --no-cache-dir reduces image size
RUN pip install --no-cache-dir -r requirements.txt

# --- STAGE 2: Final Runtime Image ---
# Use the same slim base image for the final production environment
FROM python:3.11-slim AS runtime

# Set working directory
WORKDIR /app

# Copy only the installed Python packages from the builder stage
# This saves space by not including build dependencies like build-essential
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages

# Copy application code (main.py, nlp_model.py, database.py)
COPY ./backend /app/

# IMPORTANT: Set the internal port. Hugging Face Spaces defaults to 7860.
EXPOSE 7860

# Command to run the application using Uvicorn
# 0.0.0.0 is needed to listen on all interfaces.
# --port 7860 must match the EXPOSE and the space.yaml configuration.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]