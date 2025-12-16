# Mental Health Check-in Frontend

React TypeScript frontend with auto-refreshing timeline dashboard for mental health check-ins.

## Features

### ✅ Auto-Refresh Dashboard
- **30-second auto-refresh** for timeline data
- **Manual refresh button** with loading states
- **Real-time updates** when new entries are submitted
- **Toggle auto-refresh** on/off
- **Visual indicators** for refresh status

### ✅ Interactive Timeline Chart
- **Chart.js integration** with React
- **Color-coded sentiment points** (red=anomaly, green=high, orange=low, blue=neutral)
- **Hover tooltips** with anomaly warnings
- **Responsive design** with proper scaling
- **Empty state handling** with helpful messages

### ✅ Enhanced Check-in Form
- **Voice input support** with speech-to-text
- **20-character minimum validation**
- **Real-time character counter**
- **Axios HTTP client** for API calls
- **Loading states** and error handling

### ✅ Toast Notifications
- **Success notifications** for submitted entries
- **Warning notifications** for connection issues
- **Auto-dismiss** with manual close option
- **Multiple notification types** (success, info, warning, error)

### ✅ Modern UI/UX
- **Tailwind CSS** for styling
- **Responsive design** for mobile/desktop
- **Loading animations** and transitions
- **Accessibility features** (ARIA labels, keyboard navigation)

## Auto-Refresh Features

### Timeline Dashboard
- Automatically refreshes every 30 seconds
- Shows last refresh timestamp
- Visual indicator when auto-refresh is active
- Manual refresh button with loading animation
- Toggle to enable/disable auto-refresh

### Real-time Updates
- Immediate refresh when new entries are submitted
- Toast notifications for successful submissions
- Chart updates automatically with new data
- No need to manually refresh the page

### Offline Support
- Falls back to local storage when backend is unavailable
- Shows warning notifications for connection issues
- Maintains functionality even without internet

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

## Configuration

### Auto-refresh Settings
- **Interval**: 30 seconds (configurable in `useAutoRefresh` hook)
- **Enable/Disable**: Toggle in dashboard header
- **Manual Refresh**: Available at any time

### API Endpoints
- Uses Vite proxy to forward `/api/*` to `http://localhost:8000`
- Configurable in `vite.config.js`

## Components

- **App.tsx**: Main application with auto-refresh logic
- **CheckinForm.tsx**: Form component with voice input
- **TimelineChart.tsx**: Chart.js timeline visualization
- **Toast.tsx**: Notification system
- **useAutoRefresh.ts**: Custom hook for auto-refresh functionality
- **useVoiceInput.ts**: Custom hook for speech recognition

## Technologies

- **React 19** with TypeScript
- **Chart.js** with react-chartjs-2
- **Tailwind CSS** for styling
- **Axios** for HTTP requests
- **Vite** for build tooling
- **Web Speech API** for voice input