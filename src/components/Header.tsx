import React, { useState } from 'react';
import { Search, Menu, X, User, LogIn, LogOut, Plus, Sparkles } from 'lucide-react';
import { User as UserType, FilterType } from '../types';
import { NotificationDropdown } from './NotificationDropdown';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  currentUser: UserType | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  onLoginClick: () => void;
  onLogoutClick?: () => void;
  onAskQuestionClick: () => void;
  onHomeClick: () => void;
  showFilters?: boolean;
  isDark: boolean;
  onThemeToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  onLoginClick,
  onLogoutClick,
  onAskQuestionClick,
  onHomeClick,
  showFilters = true,
  isDark,
  onThemeToggle
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className={`
      sticky top-0 z-50 transition-all duration-300
      ${isDark 
        ? 'bg-gray-900/95 border-gray-700' 
        : 'bg-white/95 border-gray-200'
      }
      backdrop-blur-md border-b shadow-lg
    `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={onHomeClick}
              className={`
                flex items-center space-x-2 text-2xl font-bold transition-all duration-300 transform hover:scale-105
                ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-purple-600 hover:text-purple-700'}
              `}
            >
              <Sparkles className="w-7 h-7" />
              <span>StackIt</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-2xl mx-8">
            {/* Search Bar */}
            <div className="relative flex-1 group">
              <Search className={`
                absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-300
                ${isDark ? 'text-gray-400 group-focus-within:text-blue-400' : 'text-gray-400 group-focus-within:text-purple-600'}
              `} />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className={`
                  w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all duration-300 transform focus:scale-105
                  ${isDark 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                  }
                  border focus:outline-none shadow-sm hover:shadow-md
                `}
              />
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="flex space-x-2">
                <button
                  onClick={() => onFilterChange('newest')}
                  className={`
                    px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-sm
                    ${filter === 'newest'
                      ? isDark 
                        ? 'bg-blue-600 text-white shadow-blue-500/25' 
                        : 'bg-purple-600 text-white shadow-purple-500/25'
                      : isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }
                  `}
                >
                  Newest
                </button>
                <button
                  onClick={() => onFilterChange('unanswered')}
                  className={`
                    px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-sm
                    ${filter === 'unanswered'
                      ? isDark 
                        ? 'bg-blue-600 text-white shadow-blue-500/25' 
                        : 'bg-purple-600 text-white shadow-purple-500/25'
                      : isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }
                  `}
                >
                  Unanswered
                </button>
              </div>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={onAskQuestionClick}
              className={`
                flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg
                ${isDark 
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25' 
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/25'
                }
                font-medium text-sm
              `}
            >
              <Plus className="w-4 h-4" />
              <span>Ask Question</span>
            </button>

            <ThemeToggle isDark={isDark} onToggle={onThemeToggle} />

            <NotificationDropdown currentUser={currentUser} isDark={isDark} />

            {currentUser ? (
              <div className="flex items-center space-x-2">
                <div className={`
                  flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-300 transform hover:scale-105
                  ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'}
                  shadow-sm hover:shadow-md
                `}>
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.username}
                    className="w-8 h-8 rounded-full border-2 border-current opacity-80"
                  />
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {currentUser.username}
                  </span>
                </div>
                {onLogoutClick && (
                  <button
                    onClick={onLogoutClick}
                    className={`
                      flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-sm
                      ${isDark 
                        ? 'bg-red-600 hover:bg-red-500 text-white' 
                        : 'bg-red-600 hover:bg-red-500 text-white'
                      }
                      font-medium text-sm
                    `}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className={`
                  flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-sm
                  ${isDark 
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                  }
                  font-medium text-sm
                `}
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle isDark={isDark} onToggle={onThemeToggle} />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`
                p-2 rounded-lg transition-all duration-300 transform hover:scale-110
                ${isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}
              `}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={`
            md:hidden py-4 border-t transition-all duration-300 transform
            ${isDark ? 'border-gray-700 bg-gray-900/95' : 'border-gray-200 bg-white/95'}
            backdrop-blur-md
          `}>
            {/* Mobile Search */}
            <div className="relative mb-4 group">
              <Search className={`
                absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-300
                ${isDark ? 'text-gray-400 group-focus-within:text-blue-400' : 'text-gray-400 group-focus-within:text-purple-600'}
              `} />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className={`
                  w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all duration-300
                  ${isDark 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                  }
                  border focus:outline-none shadow-sm
                `}
              />
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => onFilterChange('newest')}
                  className={`
                    flex-1 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform active:scale-95
                    ${filter === 'newest'
                      ? isDark 
                        ? 'bg-blue-600 text-white shadow-blue-500/25' 
                        : 'bg-purple-600 text-white shadow-purple-500/25'
                      : isDark
                        ? 'bg-gray-800 text-gray-300 border border-gray-700'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }
                    shadow-sm
                  `}
                >
                  Newest
                </button>
                <button
                  onClick={() => onFilterChange('unanswered')}
                  className={`
                    flex-1 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform active:scale-95
                    ${filter === 'unanswered'
                      ? isDark 
                        ? 'bg-blue-600 text-white shadow-blue-500/25' 
                        : 'bg-purple-600 text-white shadow-purple-500/25'
                      : isDark
                        ? 'bg-gray-800 text-gray-300 border border-gray-700'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }
                    shadow-sm
                  `}
                >
                  Unanswered
                </button>
              </div>
            )}

            {/* Mobile Actions */}
            <div className="space-y-3">
              <button
                onClick={onAskQuestionClick}
                className={`
                  w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 transform active:scale-95 shadow-lg
                  ${isDark 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25' 
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/25'
                  }
                  font-medium text-sm
                `}
              >
                <Plus className="w-4 h-4" />
                <span>Ask Question</span>
              </button>

              <div className="flex justify-center">
                <NotificationDropdown currentUser={currentUser} isDark={isDark} />
              </div>

              {currentUser ? (
                <div className="space-y-3">
                  <div className={`
                    flex items-center space-x-3 p-3 rounded-xl transition-all duration-300
                    ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'}
                    shadow-sm
                  `}>
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.username}
                      className="w-8 h-8 rounded-full border-2 border-current opacity-80"
                    />
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {currentUser.username}
                    </span>
                  </div>
                  {onLogoutClick && (
                    <button
                      onClick={onLogoutClick}
                      className={`
                        w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 transform active:scale-95 shadow-sm
                        ${isDark 
                          ? 'bg-red-600 hover:bg-red-500 text-white' 
                          : 'bg-red-600 hover:bg-red-500 text-white'
                        }
                        font-medium text-sm
                      `}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={onLoginClick}
                  className={`
                    w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 transform active:scale-95 shadow-sm
                    ${isDark 
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                    }
                    font-medium text-sm
                  `}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};