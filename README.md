---
title: Wellshift Backend
emoji: 🚀
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
---

# Wellshift Backend
This repository hosts the backend API for Wellshift.

# Daily Mental Health Check-in Application

A comprehensive mental health monitoring application that combines AI-powered sentiment analysis with real-time data visualization to help users track their emotional well-being over time.

## Live Demo & Documentation

- **Frontend (Live App):** [https://aliekargbo.github.io/Daily-Mental-Health-Check-in/](https://aliekargbo.github.io/Daily-Mental-Health-Check-in/)
- **Backend API Docs:** [https://apkargbo-wellshift-backend.hf.space/health](https://apkargbo-wellshift-backend.hf.space/health)
- **Model Hosting:** [Hugging Face Space](https://huggingface.co/spaces/apKargbo/wellshift-backend)

## Features

### **Smart Check-in System**
- **Voice Input Support** - Speech-to-text for easy entry
- **20-Character Minimum** - Ensures meaningful analysis
- **Real-time Validation** - Instant feedback on input
- **Offline Support** - Works without internet connection

### **AI-Powered Analysis**
- **RoBERTa Sentiment Analysis** - Advanced NLP model for accurate emotion detection
- **Anomaly Detection** - IQR-based statistical analysis to identify concerning patterns
- **Support Messages** - Contextual mental health guidance based on analysis
- **Confidence Scoring** - Intensity metrics for analysis reliability

### **Interactive Timeline Dashboard**
- **Auto-refresh Timeline** - Updates every 30 seconds (configurable)
- **Color-coded Sentiment Points** - Visual indicators for different emotional states
- **Chart.js Integration** - Smooth, responsive data visualization
- **100% Visibility Fix** - Proper scaling for high sentiment values
- **Hover Tooltips** - Detailed information on data points

### **Robust Data Persistence**
- **Dual Storage Strategy** - Backend database + localStorage backup
- **Instant Loading** - Immediate data display from cache
- **Background Sync** - Seamless server synchronization
- **Offline Entries** - Local storage when server unavailable

### **Real-time Updates**
- **Toast Notifications** - Success/error feedback system
- **Manual Refresh** - On-demand data updates
- **Visual Status Indicators** - Connection and sync status
- **Debug Panel** - Development and troubleshooting tools

## Architecture

### Frontend (React TypeScript)
```
frontend/app/
├── src/
│   ├── components/
│   │   ├── CheckinForm.tsx      # Main input form with voice support
│   │   ├── TimelineChart.tsx    # Chart.js visualization component
│   │   ├── Toast.tsx           # Notification system
│   │   └── DataDebugPanel.tsx  # Development debugging tools
│   ├── hooks/
│   │   ├── useAutoRefresh.ts   # Auto-refresh functionality
│   │   └── useVoiceInput.ts    # Speech recognition hook
│   ├── App.tsx                 # Main application component
│   └── main.tsx               # React entry point
├── package.json
└── vite.config.js             # Vite configuration with API proxy
```

### Backend (Python FastAPI)
```
backend/
├── main.py                    # FastAPI application with endpoints
├── nlp_model.py              # RoBERTa sentiment analysis model
├── database.py               # MongoDB integration with PyMongo
├── requirements.txt          # Python dependencies
├── start_server.py          # Server startup script
└── test_server.py           # Lightweight test server
```

## Quick Start

### Prerequisites
- **Node.js** (v18+) and npm
- **Python** (3.9+) and pip
- **MongoDB** (local or cloud instance)

### 1. Clone Repository
```bash
git clone <repository-url>
cd Daily-Mental-Health-Check-in
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python start_server.py
# OR for testing without NLP model:
python test_server.py
```

### 3. Frontend Setup
```bash
cd frontend/app

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📡 API Endpoints

### Core Endpoints
- `POST /checkin` - Submit new mental health check-in
- `GET /timeline` - Retrieve all check-in history
- `GET /health` - Server health check

### Request/Response Examples

#### Submit Check-in
```bash
curl -X POST "http://localhost:8000/checkin" \
  -H "Content-Type: application/json" \
  -d '{"user_text": "Today was a great day! I feel accomplished and happy."}'
```

#### Response
```json
{
  "id": "507f1f77bcf86cd799439011",
  "timestamp": "2024-12-16T10:30:00Z",
  "sentiment_score": 0.87,
  "anomaly_flag": false,
  "support_message": "Great job! Your reflection shows a positive mindset.",
  "user_text": "Today was a great day! I feel accomplished and happy."
}
```

## Configuration

### Environment Variables
```bash
# Backend (.env)
MONGO_URI=mongodb://localhost:27017/
DB_NAME=mental_health_db
COLLECTION_NAME=checkin_entries

# Frontend (vite.config.js)
API_PROXY_TARGET=http://localhost:8000
```

### Auto-refresh Settings
```typescript
// In useAutoRefresh hook
{
  interval: 30000,        // 30 seconds
  rateLimitMs: 5000,      // 5 second minimum between calls
  enabled: false          // Starts disabled by default
}
```

## Testing

### Add Test Data
```bash
cd backend
python add_test_data.py        # Adds 5 sample entries
python test_high_sentiment.py  # Adds high sentiment test (98.7%)
```

### Frontend Testing
```bash
cd frontend/app
npm run build          # Production build test
npx tsc --noEmit      # TypeScript compilation check
```

### Manual Testing Scenarios
1. **Normal Operation**: Submit entries → refresh tab → verify persistence
2. **Offline Mode**: Stop backend → submit entries → verify offline storage
3. **Auto-refresh**: Enable auto-refresh → verify 30-second updates
4. **Voice Input**: Use microphone → verify speech-to-text functionality

## Data Flow

### Check-in Submission Flow
```
User Input → Voice/Text Processing → Frontend Validation → 
API Call → Sentiment Analysis → Anomaly Detection → 
Database Storage → Response → UI Update → localStorage Sync
```

### Data Persistence Strategy
```
Page Load → localStorage (immediate) → API Call (background) → 
Data Sync → UI Update → localStorage Update
```

## UI/UX Features

### Visual Indicators
- Green: High sentiment (70%+), auto-refresh active
- Blue: Neutral sentiment (30-70%)
- Orange: Low sentiment (30%-), offline entries
- Red: Anomaly detected, needs attention

### Accessibility
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Voice Input**: Speech-to-text for motor accessibility
- **High Contrast**: Clear visual distinctions

## Development

### Project Structure
```
Daily-Mental-Health-Check-in/
├── README.md                 # This file
├── backend/                  # Python FastAPI backend
│   ├── README.md            # Backend-specific documentation
│   └── ...
├── frontend/app/            # React TypeScript frontend
│   ├── README.md           # Frontend-specific documentation
│   ├── DATA_PERSISTENCE.md # Data persistence guide
│   ├── CHART_VISIBILITY.md # Chart improvements documentation
│   └── ...
└── .vscode/                # VS Code configuration
```

### Key Technologies
- **Frontend**: React 19, TypeScript, Tailwind CSS, Chart.js, Axios
- **Backend**: FastAPI, PyMongo, Transformers (RoBERTa), Pandas
- **Database**: MongoDB
- **Build Tools**: Vite, Python venv
- **AI/ML**: Hugging Face Transformers, Cardiff NLP RoBERTa model

## Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check Python version
python --version  # Should be 3.9+

# Reinstall dependencies
pip install -r requirements.txt

# Try test server (no ML model)
python test_server.py
```

#### Frontend Build Errors
```bash
# Clear node modules
rm -rf node_modules package-lock.json
npm install

# Check TypeScript
npx tsc --noEmit
```

#### Data Not Persisting
1. Check browser console for errors
2. Verify backend server is running (http://localhost:8000/health)
3. Check localStorage in browser DevTools
4. Use debug panel (bottom-right button) to compare data sources

#### Auto-refresh Issues
1. Check console for rate limiting messages
2. Verify auto-refresh is enabled (checkbox)
3. Check network connectivity
4. Manual refresh should always work

## Performance

### Optimization Features
- **Rate Limiting**: Prevents excessive API calls (5-second minimum)
- **localStorage Caching**: Instant UI loading
- **Background Sync**: Non-blocking data updates
- **Lazy Loading**: Components load on demand
- **Debounced Input**: Prevents excessive validation calls

### Scalability Considerations
- **Database Indexing**: Timestamp-based queries
- **API Pagination**: For large datasets (future enhancement)
- **Data Cleanup**: Automatic old entry removal (configurable)
- **CDN Ready**: Static assets can be served from CDN

## Contributing

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Follow the Quick Start guide for local setup
4. Make changes and test thoroughly
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Code linting and formatting
- **Python**: PEP 8 style guide
- **Testing**: Manual testing scenarios documented

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **Hugging Face** - For the RoBERTa sentiment analysis model
- **Chart.js** - For beautiful data visualization
- **FastAPI** - For the high-performance Python backend
- **React Team** - For the excellent frontend framework
- **Tailwind CSS** - For the utility-first CSS framework

## 📞 Support

For support, please:
1. Check the troubleshooting section above
2. Review the component-specific README files
3. Check the browser console for error messages
4. Use the debug panel for data persistence issues

---

**Built with ❤️ for mental health awareness and support**
