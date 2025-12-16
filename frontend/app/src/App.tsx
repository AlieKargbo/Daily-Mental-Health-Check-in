import React, { useState, useCallback, useEffect } from 'react';
import CheckinForm from './components/CheckinForm';
import TimelineChart from './components/TimelineChart';
import Toast from './components/Toast';
import DataDebugPanel from './components/DataDebugPanel';
import { useAutoRefresh } from './hooks/useAutoRefresh';
import axios from 'axios';
import './style.css';

interface CheckinEntry {
  id: string;
  timestamp: string;
  sentiment_score: number;
  anomaly_flag: boolean;
  user_text?: string;
}

const App: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [entries, setEntries] = useState<CheckinEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false); // Start with auto-refresh disabled
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info' | 'warning' | 'error'} | null>(null);

  const loadEntries = useCallback(async () => {
    console.log('loadEntries: Starting API call to /api/timeline');
    
    // First, try to load from localStorage immediately for faster UI
    const localEntries = JSON.parse(localStorage.getItem('dailyEntries') || '[]');
    if (localEntries.length > 0) {
      console.log('loadEntries: Loading', localEntries.length, 'entries from localStorage');
      setEntries(localEntries);
      setLoading(false);
    }
    
    try {
      const response = await axios.get('/timeline');
      const newEntries = response.data;
      console.log('loadEntries: Received', newEntries.length, 'entries from API');
      
      // Always update localStorage with fresh data from backend
      localStorage.setItem('dailyEntries', JSON.stringify(newEntries));
      
      // Use functional update to avoid dependency on entries
      setEntries(prevEntries => {
        console.log('loadEntries: Previous entries:', prevEntries.length, 'New entries:', newEntries.length);
        // Check if we have new entries (only show toast if not initial load and we had previous data)
        if (prevEntries.length > 0 && newEntries.length > prevEntries.length) {
          setToast({
            message: `${newEntries.length - prevEntries.length} new entry(ies) loaded`,
            type: 'success'
          });
        }
        return newEntries;
      });
      
    } catch (error) {
      console.error('loadEntries: Failed to load entries from API:', error);
      
      // If we don't have local data and API fails, show error
      if (localEntries.length === 0) {
        setEntries([]);
        setToast({
          message: 'Failed to load data. Please check your connection.',
          type: 'error'
        });
      } else {
        // We already loaded local data, just show a warning
        setToast({
          message: 'Using offline data. Connection to server failed.',
          type: 'warning'
        });
      }
    } finally {
      setLoading(false);
    }
  }, []); // Remove all dependencies to prevent infinite loops

  // Initial data load on component mount
  useEffect(() => {
    console.log('App: Component mounted, loading initial data');
    loadEntries();
  }, [loadEntries]);

  // Use the auto-refresh hook
  const { isRefreshing, lastRefresh, manualRefresh } = useAutoRefresh(
    loadEntries,
    { 
      interval: 30000, // 30 seconds
      enabled: autoRefreshEnabled 
    }
  );

  const handleCheckinSuccess = () => {
    // Immediately refresh the entries and increment refresh key for chart
    manualRefresh();
    setRefreshKey(prev => prev + 1);
    setToast({
      message: 'Check-in submitted successfully! Chart updated.',
      type: 'success'
    });
  };

  const handleManualRefresh = () => {
    manualRefresh();
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Daily Mental Health Check-in
          </h1>
          <p className="text-gray-600">
            Take a moment to reflect on your day and share your thoughts
          </p>
        </header>

        <div className="space-y-8">
          {/* Check-in Form */}
          <CheckinForm onSuccess={handleCheckinSuccess} />
          
          {/* Timeline Chart with Auto-refresh */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Sentiment Timeline</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto-refresh"
                    checked={autoRefreshEnabled}
                    onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="auto-refresh" className="text-sm text-gray-600">
                    Auto-refresh (30s)
                  </label>
                </div>
                <button
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className={`flex items-center space-x-1 px-3 py-2 text-sm rounded-md transition-colors ${
                    isRefreshing 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                  title={isRefreshing ? "Refreshing..." : "Refresh now"}
                >
                  <svg 
                    className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                </button>
                <div className="flex flex-col text-xs text-gray-500">
                  <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
                  <span>Entries: {entries.length}</span>
                  {entries.some(e => (e as any).offline) && (
                    <span className="text-orange-600">⚠ Some offline entries</span>
                  )}
                  {autoRefreshEnabled && !isRefreshing && (
                    <span className="text-green-600">● Auto-refresh active</span>
                  )}
                  {autoRefreshEnabled && isRefreshing && (
                    <span className="text-yellow-600">● Refreshing...</span>
                  )}
                  {!autoRefreshEnabled && (
                    <span className="text-gray-400">○ Auto-refresh disabled</span>
                  )}
                </div>
              </div>
            </div>
            <TimelineChart refreshKey={refreshKey} entries={entries} />
          </div>

          {/* Timeline/History Section */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Journey</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading your entries...</p>
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No entries yet. Start by sharing your first reflection above!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {entries.slice(-5).reverse().map((entry) => (
                  <div 
                    key={entry.id} 
                    className={`p-4 rounded-lg border-l-4 ${
                      entry.anomaly_flag 
                        ? 'border-red-400 bg-red-50' 
                        : entry.sentiment_score > 0.6 
                        ? 'border-green-400 bg-green-50'
                        : entry.sentiment_score < 0.4
                        ? 'border-yellow-400 bg-yellow-50'
                        : 'border-blue-400 bg-blue-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-gray-600">
                        {new Date(entry.timestamp).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">
                          Sentiment: {(entry.sentiment_score * 100).toFixed(0)}%
                        </span>
                        {entry.anomaly_flag && (
                          <span className="text-xs px-2 py-1 rounded-full bg-red-200 text-red-700">
                            Needs Attention
                          </span>
                        )}
                        {(entry as any).offline && (
                          <span className="text-xs px-2 py-1 rounded-full bg-orange-200 text-orange-700">
                            Offline
                          </span>
                        )}
                      </div>
                    </div>
                    {entry.user_text && (
                      <p className="text-gray-700 text-sm">
                        {entry.user_text.length > 150 
                          ? `${entry.user_text.substring(0, 150)}...` 
                          : entry.user_text
                        }
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <footer className="text-center mt-2">
          <h1>Built with ❤️ for mental health awareness and support</h1>
        </footer>
      </div>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      {/* Debug Panel */}
      <DataDebugPanel entries={entries} />
    </div>
  );
};

export default App;