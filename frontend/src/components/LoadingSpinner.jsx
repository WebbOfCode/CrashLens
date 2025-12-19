import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 24, className = '' }) {
  return (
    <Loader2 size={size} className={`animate-spin ${className}`} />
  );
}

export function LoadingOverlay({ message = 'Loading...' }) {
  return (
    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
      <div className="text-center">
        <LoadingSpinner size={40} className="mx-auto mb-2 text-primary-600" />
        <p className="text-gray-800">{message}</p>
      </div>
    </div>
  );
}
