# main.py
import datetime
from typing import List, Optional

# Third-party libraries
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd

# Local modules
from database import get_mongo_collection, insert_checkin_entry, close_mongo_connection
from nlp_model import analyze_text
from bson import ObjectId 

# Initialize the FastAPI application
app = FastAPI()

# --- Pydantic Models for Data Validation ---

class CheckinRequest(BaseModel):
    """Model for incoming user check-in data."""
    user_text: str

class CheckinResponse(BaseModel):
    """Model for data returned after a single check-in."""
    id: str
    timestamp: datetime.datetime
    sentiment_score: float
    anomaly_flag: bool
    support_message: Optional[str] = None # The supportive message/nudge
    user_text: Optional[str] = None

# --- Helper Functions ---

def check_for_anomaly(all_entries: List[dict], new_score: float) -> bool:
    """
    Checks if the new score represents a significant, negative shift 
    using the Interquartile Range (IQR) rule against historical data.
    """
    
    # Needs at least 4 past data points to establish a stable baseline (e.g., 3 days + new day)
    if len(all_entries) < 4: 
        return False
        
    # Gather only historical scores (sentiment_score is a float from 0.0 to 1.0)
    historical_scores = [entry['sentiment_score'] for entry in all_entries]
    
    df = pd.DataFrame(historical_scores, columns=['score'])
    
    # Calculate key statistics (Median and IQR are robust against outliers)
    Q1 = df['score'].quantile(0.25)
    Q3 = df['score'].quantile(0.75)
    IQR = Q3 - Q1

    # Anomaly Rule: 1.5 * IQR below the first quartile (Q1)
    LOWER_BOUND = Q1 - (1.5 * IQR)
    
    # Anomaly is flagged if the new score is significantly below the typical low point.
    if new_score < LOWER_BOUND:
        print(f"ANOMALY DETECTED! New Score ({new_score:.2f}) is below Lower Bound ({LOWER_BOUND:.2f})")
        return True
        
    return False


def generate_support_message(sentiment_score: float, is_anomaly: bool) -> str:
    """
    Generates a supportive message (nudge) based on the analysis.
    """
    
    # 1. Anomaly/Crisis Nudge (Highest Priority)
    if is_anomaly:
        return (
            "⚠️ Significant Change Detected. Your recent entries show a notable dip below your typical baseline. "
            "Please reach out to a support professional or review your coping strategies. "
            "Remember: small steps are still progress."
        )

    # 2. Low Sentiment Nudge
    if sentiment_score < 0.3: 
        return (
            "🫂 It sounds like you are going through a difficult time. "
            "It's okay to feel overwhelmed. Focus on one small, manageable task today."
        )

    # 3. Mid-Range/Neutral Nudge
    elif sentiment_score < 0.6: 
        return (
            "⚖️ A steady day is still a good day. If you feel stuck, try a short break or a mindfulness exercise. "
            "Keep an eye on how you feel tomorrow."
        )

    # 4. Positive Nudge (Reinforcement)
    else: 
        return (
            "✨ Great job! Your reflection shows a positive mindset. "
            "Take a moment to recognize what made today successful and carry that momentum forward."
        )


# --- API Endpoints ---

@app.post("/checkin", response_model=CheckinResponse)
def submit_checkin(request: CheckinRequest):
    """
    Receives a new check-in entry, runs AI analysis, checks for anomalies, 
    saves the data, and returns the result with a supportive message.
    """
    
    try:
        # 1. Analyze the text using the sentiment model
        analysis = analyze_text(request.user_text)
        
        # 2. Retrieve all past entries for robust anomaly check
        collection = get_mongo_collection()
        # Fetch all entries, ordered by time (descending)
        past_entries = list(collection.find().sort("timestamp", -1))
        
        # 3. Check for anomaly
        is_anomaly = check_for_anomaly(past_entries, analysis["sentiment"])
        
        # 4. Generate the supportive message
        support_message = generate_support_message(analysis["sentiment"], is_anomaly)

        # 5. Save the new entry to the database
        entry_id = insert_checkin_entry(
            user_text=request.user_text,
            sentiment_score=analysis["sentiment"],
            keyword_intensity=analysis["intensity"],
            anomaly_flag=is_anomaly
        )
        
        # 6. Return the saved entry ALONGSIDE the generated message
        return CheckinResponse(
            id=str(entry_id),
            timestamp=datetime.datetime.now(),
            sentiment_score=analysis["sentiment"],
            anomaly_flag=is_anomaly,
            support_message=support_message,
            user_text=request.user_text
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing check-in: {str(e)}")
# --- 2. GET Endpoint for Timeline Data ---
@app.get("/timeline", response_model=List[CheckinResponse])
def get_timeline():
    try:
        # Retrieve all entries, ordered by time
        collection = get_mongo_collection()
        entries = list(collection.find().sort("timestamp", 1))
        
        # Convert MongoDB documents to response format
        timeline_data = []
        for entry in entries:
            timeline_data.append(CheckinResponse(
                id=str(entry["_id"]),
                timestamp=entry["timestamp"],
                sentiment_score=entry["sentiment_score"],
                anomaly_flag=entry.get("anomaly_flag", False),
                user_text=entry.get("user_text", "")
            ))
        
        return timeline_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving timeline: {str(e)}")

# --- Health Check Endpoint ---
@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.datetime.now()}
    
# --- CORS Headers (Crucial for Hosting) ---
# Enable CORS for frontend development
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)