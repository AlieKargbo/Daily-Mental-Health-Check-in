#!/usr/bin/env python3
"""
Lightweight test server without NLP model for quick testing.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import datetime
import random

app = FastAPI()

# Simple in-memory storage for testing
test_entries = []

class CheckinRequest(BaseModel):
    user_text: str

class CheckinResponse(BaseModel):
    id: str
    timestamp: datetime.datetime
    sentiment_score: float
    anomaly_flag: bool
    support_message: Optional[str] = None
    user_text: Optional[str] = None

# Enable CORS
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/checkin", response_model=CheckinResponse)
def submit_checkin(request: CheckinRequest):
    """Test endpoint with mock sentiment analysis."""
    
    # Mock sentiment analysis
    sentiment_score = random.uniform(0.2, 0.9)
    anomaly_flag = sentiment_score < 0.3
    
    entry = {
        "id": str(len(test_entries) + 1),
        "timestamp": datetime.datetime.now(),
        "sentiment_score": sentiment_score,
        "anomaly_flag": anomaly_flag,
        "user_text": request.user_text
    }
    
    test_entries.append(entry)
    
    support_message = "Thank you for sharing your thoughts!"
    if anomaly_flag:
        support_message = "We noticed you might need extra support. Please reach out if needed."
    
    return CheckinResponse(
        id=entry["id"],
        timestamp=entry["timestamp"],
        sentiment_score=entry["sentiment_score"],
        anomaly_flag=entry["anomaly_flag"],
        support_message=support_message,
        user_text=entry["user_text"]
    )

@app.get("/timeline", response_model=List[CheckinResponse])
def get_timeline():
    """Return all test entries."""
    return [
        CheckinResponse(
            id=entry["id"],
            timestamp=entry["timestamp"],
            sentiment_score=entry["sentiment_score"],
            anomaly_flag=entry["anomaly_flag"],
            user_text=entry["user_text"]
        )
        for entry in test_entries
    ]

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.datetime.now()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)