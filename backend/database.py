# database.py (MongoDB Version)
import pymongo
from pymongo.errors import ConnectionFailure
import datetime
import os
from dotenv import load_dotenv

# Optional: Load environment variables from a .env file for security
load_dotenv()

# --- Configuration ---
# Get connection string from environment variable or replace directly
#os.environ.get("mongodb+srv://Wellshift:Wellshift2025hack@cluster0.wtydpqz.mongodb.net/?appName=Cluster0")
# Example local URI: "mongodb://localhost:27017/"
# Example Atlas URI: "mongodb+srv://<username>:<password>@clustername.mongodb.net/..."
MONGO_URI = os.environ.get("MONGO_URI") 
DB_NAME = "amhci_data_db"
COLLECTION_NAME = "checkin_entries"
# ---------------------

# Global variables for the client and collection objects
mongo_client = None
mongo_collection = None

def get_mongo_collection():
    """
    Establishes the MongoDB connection and returns the collection object.
    This function should be called before performing any database operations.
    """
    global mongo_client, mongo_collection

    if mongo_collection is not None:
        return mongo_collection

    try:
        # Create a connection using MongoClient
        mongo_client = pymongo.MongoClient(MONGO_URI)
        
        # Access the specified database and collection
        db = mongo_client[DB_NAME]
        mongo_collection = db[COLLECTION_NAME]

        print(f"Connected to MongoDB: Database '{DB_NAME}', Collection '{COLLECTION_NAME}'")
        return mongo_collection

    except ConnectionFailure as e:
        print(f"ERROR: Could not connect to MongoDB: {e}")
        # Exit the program or handle the error gracefully
        raise

def close_mongo_connection():
    """Closes the MongoDB connection."""
    global mongo_client
    if mongo_client:
        mongo_client.close()
        print("MongoDB connection closed.")


def insert_checkin_entry(user_text, sentiment_score, keyword_intensity, anomaly_flag=False):
    """
    Inserts a new check-in document into the MongoDB collection.
    """
    collection = get_mongo_collection()
    
    # MongoDB stores data as documents (Python dictionaries)
    entry_data = {
        "timestamp": datetime.datetime.now(), # MongoDB handles datetime objects natively
        "user_text": user_text,
        "sentiment_score": sentiment_score,
        "keyword_intensity": keyword_intensity,
        "anomaly_flag": anomaly_flag
    }
    
    # Insert the document
    result = collection.insert_one(entry_data)
    print(f"Inserted document ID: {result.inserted_id}")
    return result.inserted_id

# --- Example Usage ---
if __name__ == '__main__':
    try:
        # Example of how to use the insert function
        insert_checkin_entry(
            user_text="I feel great today, everything is going well.",
            sentiment_score=0.9,
            keyword_intensity=0.1
        )
        
        # Example of reading back data
        print("\nRetrieving all entries:")
        for doc in get_mongo_collection().find():
            print(doc)

    except Exception as e:
        print(f"An error occurred during database operations: {e}")
    finally:
        # Ensure the connection is closed when the script finishes
        close_mongo_connection()
