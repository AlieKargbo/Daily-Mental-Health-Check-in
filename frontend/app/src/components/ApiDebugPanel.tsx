// src/components/ApiDebugPanel.tsx
import React from 'react';
import { API_BASE_URL, endpoints } from '../config';

const ApiDebugPanel: React.FC = () => {
  const envVar = import.meta.env?.VITE_API_BASE_URL;
  
  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">API Debug Info</h3>
      <div className="space-y-1">
        <div>
          <span className="text-gray-300">Env Var:</span> 
          <span className="ml-1">{envVar || 'Not set'}</span>
        </div>
        <div>
          <span className="text-gray-300">API Base:</span> 
          <span className="ml-1 break-all">{API_BASE_URL}</span>
        </div>
        <div>
          <span className="text-gray-300">Timeline:</span> 
          <span className="ml-1 break-all">{endpoints.timeline}</span>
        </div>
        <div>
          <span className="text-gray-300">Checkin:</span> 
          <span className="ml-1 break-all">{endpoints.checkin}</span>
        </div>
        <div>
          <span className="text-gray-300">Mode:</span> 
          <span className="ml-1">{import.meta.env?.MODE || 'unknown'}</span>
        </div>
      </div>
    </div>
  );
};

export default ApiDebugPanel;