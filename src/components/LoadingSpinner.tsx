import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  isDark?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  isDark = false 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`
        ${sizeClasses[size]} 
        border-2 border-transparent rounded-full animate-spin
        ${isDark 
          ? 'border-t-blue-400 border-r-blue-400' 
          : 'border-t-purple-600 border-r-purple-600'
        }
      `} />
    </div>
  );
};