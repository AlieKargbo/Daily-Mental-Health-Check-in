# Data Persistence Guide

This document explains how data persistence works in the Mental Health Check-in app.

## How Data Persistence Works

### 1. **Dual Storage Strategy**
- **Primary**: Backend database (via API calls)
- **Backup**: Browser localStorage for offline access

### 2. **Data Loading Priority**
1. **Immediate**: Load from localStorage for instant UI
2. **Background**: Fetch from backend API
3. **Sync**: Update localStorage with fresh backend data
4. **Fallback**: Use localStorage if backend is unavailable

### 3. **Data Flow**

#### On App Load (Tab Refresh)
```
1. Component mounts
2. Load from localStorage immediately (fast UI)
3. Call /api/timeline in background
4. Update localStorage with fresh data
5. Update UI with latest data
```

#### On New Entry Submission
```
1. Submit to backend /api/checkin
2. Add to localStorage immediately
3. Trigger UI refresh
4. If backend fails: save as offline entry
```

### 4. **Offline Support**

#### When Backend is Available
- ✅ Data saved to backend database
- ✅ localStorage updated with backend response
- ✅ Real-time sentiment analysis

#### When Backend is Unavailable
- ⚠️ Data saved to localStorage only
- ⚠️ Marked as "offline" entry
- ⚠️ Default neutral sentiment (0.5)
- 🔄 Will sync when backend comes back online

### 5. **Data Indicators**

#### UI Status Indicators
- **Green dot**: Auto-refresh active
- **Yellow dot**: Currently refreshing
- **Orange warning**: Some offline entries exist
- **Entry badges**: "Offline" badge for offline entries

#### Debug Panel
- Click "Debug Data" button (bottom-right)
- Shows app state vs localStorage comparison
- Allows clearing localStorage for testing

### 6. **Testing Data Persistence**

#### Test Scenarios
1. **Normal Operation**:
   - Submit entries → Should appear immediately
   - Refresh tab → Data should persist

2. **Offline Mode**:
   - Stop backend server
   - Submit entries → Should save as offline
   - Restart backend → Should show offline entries

3. **Data Recovery**:
   - Clear app state (not localStorage)
   - Refresh → Should reload from localStorage
   - Backend available → Should sync with backend

#### Manual Testing
```bash
# 1. Add test data to backend
cd backend
python add_test_data.py

# 2. Open frontend
cd frontend/app
npm run dev

# 3. Test persistence
- Submit new entries
- Refresh browser tab
- Check debug panel
- Stop/start backend server
```

### 7. **Data Structure**

#### Entry Format
```typescript
interface CheckinEntry {
  id: string;              // Unique identifier
  timestamp: string;       // ISO date string
  sentiment_score: number; // 0.0 to 1.0
  anomaly_flag: boolean;   // True if concerning
  user_text?: string;      // Original text
  offline?: boolean;       // True if saved offline
}
```

#### localStorage Key
- **Key**: `dailyEntries`
- **Format**: JSON array of CheckinEntry objects
- **Auto-sync**: Updated on every backend response

### 8. **Troubleshooting**

#### Data Not Persisting
1. Check browser console for errors
2. Verify backend server is running
3. Check localStorage in DevTools
4. Use debug panel to compare data sources

#### Offline Entries Not Syncing
1. Ensure backend is accessible
2. Check network connectivity
3. Manual refresh should trigger sync
4. Clear localStorage and reload if needed

#### Performance Issues
1. Auto-refresh has 5-second rate limiting
2. localStorage is limited to ~5-10MB
3. Consider data cleanup for old entries

### 9. **Configuration**

#### Auto-refresh Settings
```typescript
// In useAutoRefresh hook
interval: 30000,        // 30 seconds
rateLimitMs: 5000,      // 5 second minimum between calls
enabled: false          // Starts disabled
```

#### localStorage Settings
```typescript
// Automatic cleanup (future enhancement)
maxEntries: 1000,       // Keep last 1000 entries
maxAge: 90 * 24 * 60 * 60 * 1000  // 90 days
```