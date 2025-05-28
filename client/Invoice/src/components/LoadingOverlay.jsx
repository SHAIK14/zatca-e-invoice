// LoadingOverlay.jsx
import React from 'react';

const LoadingOverlay = ({ isVisible, message = "Processing..." }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
        <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-2"></div>
        <p className="text-gray-700 text-sm">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;