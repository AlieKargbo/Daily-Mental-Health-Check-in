#!/usr/bin/env python3
"""
Add a test entry with very high sentiment (close to 100%) to test chart visibility.
"""

import requests
import json

def add_high_sentiment_entry():
    base_url = "http://localhost:8000"
    
    # Test entry with very positive sentiment
    high_sentiment_text = """
    Today was absolutely incredible! I woke up feeling energized and motivated. 
    I accomplished all my goals, had amazing conversations with friends, 
    received great news about my career, and felt completely at peace with myself. 
    I'm filled with joy, gratitude, and excitement for the future. 
    Everything feels perfect and I couldn't be happier! 
    This is one of the best days of my life and I feel so blessed and fortunate.
    """
    
    try:
        response = requests.post(
            f"{base_url}/checkin",
            json={"user_text": high_sentiment_text.strip()},
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            sentiment_percentage = data['sentiment_score'] * 100
            print(f"✓ High sentiment entry added!")
            print(f"  Sentiment Score: {sentiment_percentage:.1f}%")
            print(f"  Anomaly Flag: {data['anomaly_flag']}")
            
            if sentiment_percentage >= 95:
                print(f"🎉 Perfect! Sentiment is {sentiment_percentage:.1f}% - this will test the chart's top visibility")
            elif sentiment_percentage >= 85:
                print(f"👍 Good! Sentiment is {sentiment_percentage:.1f}% - should be visible near the top")
            else:
                print(f"⚠️  Sentiment is only {sentiment_percentage:.1f}% - might need a more positive text")
                
        else:
            print(f"✗ Failed with status {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"✗ Error: {e}")

if __name__ == "__main__":
    add_high_sentiment_entry()