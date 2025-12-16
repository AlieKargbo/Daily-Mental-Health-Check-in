// src/components/CheckinForm.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useVoiceInput } from '../hooks/useVoiceInput';

interface CheckinFormProps {
  onSuccess: () => void; // Callback to refresh the chart after a successful submission
}

const CheckinForm: React.FC<CheckinFormProps> = ({ onSuccess }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported } = useVoiceInput();

  // Update text when voice transcript changes
  useEffect(() => {
    if (transcript) {
      setText(prev => prev + (prev ? ' ' : '') + transcript);
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (text.trim().length < 20) {
      setError("Please write at least 20 characters for a meaningful analysis.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use the deployed backend URL from environment variable
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await axios.post(`${apiBaseUrl}/checkin`, {
        user_text: text,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      });

      console.log('Check-in submitted successfully:', response.data);
      
      // Log sentiment feedback for debugging
      const sentimentLabel = response.data.sentiment_score > 0.6 ? 'positive' : 
                            response.data.sentiment_score < 0.4 ? 'concerning' : 'neutral';
      console.log(`Sentiment analysis: ${sentimentLabel} (${(response.data.sentiment_score * 100).toFixed(1)}%)`);
      
      // Immediately add to localStorage for instant persistence
      const localEntries = JSON.parse(localStorage.getItem('dailyEntries') || '[]');
      const newEntry = {
        id: response.data.id,
        timestamp: response.data.timestamp,
        sentiment_score: response.data.sentiment_score,
        anomaly_flag: response.data.anomaly_flag,
        user_text: text.trim()
      };
      localEntries.push(newEntry);
      localStorage.setItem('dailyEntries', JSON.stringify(localEntries));
      console.log('CheckinForm: Added entry to localStorage, total entries:', localEntries.length);
      
      // Clear the form
      setText('');
      
      // Trigger immediate refresh of parent components
      onSuccess();
    } catch (err: any) {
      console.error('CheckinForm: API error:', err);
      
      if (err.code === 'ECONNABORTED') {
        setError("Request timed out. The server might be starting up, please try again in a moment.");
      } else if (err.response?.status === 500) {
        setError("Server error. The backend database might be unavailable. Your entry has been saved locally.");
      } else if (err.response?.status >= 400) {
        setError(`Server error (${err.response.status}): ${err.response.data?.detail || 'Unknown error'}`);
      } else if (err.request) {
        setError("Cannot connect to server. Please check your internet connection or try again later.");
      } else {
        setError("Failed to submit entry. Please try again.");
      }
      
      // Even if backend fails, save to localStorage as offline backup
      const localEntries = JSON.parse(localStorage.getItem('dailyEntries') || '[]');
      const offlineEntry = {
        id: `offline-${Date.now()}`,
        timestamp: new Date().toISOString(),
        sentiment_score: 0.5, // Default neutral sentiment
        anomaly_flag: false,
        user_text: text.trim(),
        offline: true // Mark as offline entry
      };
      localEntries.push(offlineEntry);
      localStorage.setItem('dailyEntries', JSON.stringify(localEntries));
      console.log('CheckinForm: Saved offline entry to localStorage');
      
      // Still trigger refresh to show the offline entry
      setText('');
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Daily Reflection Check-in</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reflection-text" className="block text-lg font-medium text-gray-700 mb-3">
            How are you feeling today? Share whatever is on your mind.
          </label>
          <textarea
            id="reflection-text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError(null);
            }}
            rows={6}
            placeholder="Write about your day, your feelings, thoughts, or anything you'd like to share..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-700 placeholder-gray-400"
            disabled={loading}
            required
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">
              {text.length}/20 characters minimum
            </span>
            {isSupported && (
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                  isListening 
                    ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                    : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                }`}
                title={isListening ? 'Stop voice input' : 'Start voice input'}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd"></path>
                </svg>
                <span>{isListening ? 'Listening...' : 'Voice Input'}</span>
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
              </svg>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <button 
            type="submit" 
            disabled={loading || text.trim().length < 20}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {loading ? 'Analyzing...' : 'Submit Entry'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckinForm;