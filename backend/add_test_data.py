#!/usr/bin/env python3
"""
Add some test data to the backend for testing persistence.
"""

import requests
import json
from datetime import datetime, timedelta

# Test entries to add
test_entries = [
    {
        "user_text": "Today was a really good day! I felt productive and accomplished a lot of my goals. The weather was nice and I went for a walk in the park.",
        "expected_sentiment": "positive"
    },
    {
        "user_text": "Feeling a bit overwhelmed with work lately. There's so much to do and not enough time. I'm trying to stay positive but it's challenging.",
        "expected_sentiment": "neutral"
    },
    {
        "user_text": "Had a great conversation with my friend today. We talked about our future plans and I feel excited about what's coming next in my life.",
        "expected_sentiment": "positive"
    },
    {
        "user_text": "I'm struggling with some personal issues and feeling quite down. It's hard to see the light at the end of the tunnel right now.",
        "expected_sentiment": "negative"
    },
    {
        "user_text": "Today was an average day. Nothing particularly exciting happened, but nothing bad either. Just going through the motions.",
        "expected_sentiment": "neutral"
    }
]

def add_test_entries():
    base_url = "http://localhost:8000"
    
    print("Adding test entries to the backend...")
    
    for i, entry in enumerate(test_entries):
        try:
            response = requests.post(
                f"{base_url}/checkin",
                json={"user_text": entry["user_text"]},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✓ Entry {i+1}: Sentiment {data['sentiment_score']:.2f} ({entry['expected_sentiment']})")
            else:
                print(f"✗ Entry {i+1}: Failed with status {response.status_code}")
                
        except Exception as e:
            print(f"✗ Entry {i+1}: Error - {e}")
    
    # Check timeline
    try:
        response = requests.get(f"{base_url}/timeline")
        if response.status_code == 200:
            entries = response.json()
            print(f"\n📊 Total entries in database: {len(entries)}")
        else:
            print(f"\n❌ Failed to get timeline: {response.status_code}")
    except Exception as e:
        print(f"\n❌ Timeline error: {e}")

if __name__ == "__main__":
    add_test_entries()