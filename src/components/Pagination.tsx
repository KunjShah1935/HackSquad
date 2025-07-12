import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isDark: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  isDark,
}) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 mt-12">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`
          flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg
          ${currentPage === 1
            ? isDark 
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
            : isDark
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700 hover:shadow-blue-500/25'
              : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-gray-300 hover:shadow-purple-500/25'
          }
        `}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {getVisiblePages().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className={`px-3 py-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                ...
              </span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`
                  w-10 h-10 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-110 shadow-lg
                  ${currentPage === page
                    ? isDark 
                      ? 'bg-blue-600 text-white border border-blue-500 shadow-blue-500/25' 
                      : 'bg-purple-600 text-white border border-purple-500 shadow-purple-500/25'
                    : isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700 hover:shadow-blue-500/25'
                      : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-gray-300 hover:shadow-purple-500/25'
                  }
                `}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`
          flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg
          ${currentPage === totalPages
            ? isDark 
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
            : isDark
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700 hover:shadow-blue-500/25'
              : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-gray-300 hover:shadow-purple-500/25'
          }
        `}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};