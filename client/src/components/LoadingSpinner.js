import React from 'react';

function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`${sizeClasses[size]} loading-spinner mb-4`}></div>
      {text && (
        <p className="text-gray-600 font-medium">{text}</p>
      )}
    </div>
  );
}

export default LoadingSpinner; 