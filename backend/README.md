# Mental Health Check-in Backend

FastAPI backend with sentiment analysis and anomaly detection for mental health check-ins.

## Features

- **Sentiment Analysis**: Uses RoBERTa model for text sentiment analysis
- **Anomaly Detection**: IQR-based detection for concerning patterns
- **MongoDB Storage**: Stores check-in entries with timestamps
- **Support Messages**: Generates contextual support messages
- **REST API**: FastAPI endpoints for frontend integration

## Setup

1. **Activate Virtual Environment**:
   ```bash
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # Linux/Mac
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Start MongoDB** (if using local MongoDB):
   ```bash
   mongod
   ```

4. **Start the Server**:
   ```bash
   python start_server.py
   # OR
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## API Endpoints

- `POST /checkin` - Submit a new check-in entry
- `GET /timeline` - Retrieve all check-in history
- `GET /health` - Health check endpoint

## Environment Variables

- `MONGO_URI` - MongoDB connection string (default: `mongodb://localhost:27017/`)

## Models Used

- **Sentiment Analysis**: `cardiffnlp/twitter-roberta-base-sentiment-latest`
- **Database**: MongoDB with PyMongo
- **Anomaly Detection**: IQR-based statistical analysis