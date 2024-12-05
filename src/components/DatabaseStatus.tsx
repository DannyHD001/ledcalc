import React from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface DatabaseStatusProps {
  status: 'connected' | 'disconnected' | 'error';
  error: string | null;
}

export function DatabaseStatus({ status, error }: DatabaseStatusProps) {
  return (
    <div className="fixed bottom-4 right-4">
      <div className={`rounded-lg shadow-lg p-4 flex items-center gap-2 ${
        status === 'connected' 
          ? 'bg-green-50 text-green-700' 
          : status === 'error' 
            ? 'bg-red-50 text-red-700'
            : 'bg-yellow-50 text-yellow-700'
      }`}>
        {status === 'connected' && <CheckCircle className="h-5 w-5" />}
        {status === 'disconnected' && <AlertCircle className="h-5 w-5" />}
        {status === 'error' && <XCircle className="h-5 w-5" />}
        
        <span className="text-sm font-medium">
          {status === 'connected' && 'Connected to database'}
          {status === 'disconnected' && 'Connecting to database...'}
          {status === 'error' && (error || 'Database connection error')}
        </span>
      </div>
    </div>
  );
}