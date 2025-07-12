import React, { useState } from 'react';
import { Plus, MessageCircle, Search, TrendingUp } from 'lucide-react';

interface FloatingActionButtonProps {
  onAskQuestion: () => void;
  isDark: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ 
  onAskQuestion, 
  isDark 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const actions = [
    { icon: MessageCircle, label: 'Ask Question', action: onAskQuestion },
    { icon: Search, label: 'Search', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    { icon: TrendingUp, label: 'Trending', action: () => console.log('Trending') },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action Items */}
      <div className={`
        absolute bottom-16 right-0 space-y-3 transition-all duration-300 transform
        ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
      `}>
        {actions.map((action, index) => (
          <div
            key={index}
            className={`
              flex items-center space-x-3 transition-all duration-300 transform
              ${isOpen ? 'translate-x-0' : 'translate-x-full'}
            `}
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            <span className={`
              px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg
              ${isDark 
                ? 'bg-gray-800 text-white border border-gray-700' 
                : 'bg-white text-gray-900 border border-gray-200'
              }
            `}>
              {action.label}
            </span>
            <button
              onClick={action.action}
              className={`
                w-12 h-12 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110
                ${isDark 
                  ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                  : 'bg-purple-600 hover:bg-purple-500 text-white'
                }
              `}
            >
              <action.icon className="w-5 h-5 mx-auto" />
            </button>
          </div>
        ))}
      </div>

      {/* Main FAB */}
      <button
        onClick={toggleMenu}
        className={`
          w-14 h-14 rounded-full shadow-xl transition-all duration-300 transform hover:scale-110
          ${isDark 
            ? 'bg-blue-600 hover:bg-blue-500 text-white' 
            : 'bg-purple-600 hover:bg-purple-500 text-white'
          }
          ${isOpen ? 'rotate-45' : 'rotate-0'}
        `}
      >
        <Plus className="w-6 h-6 mx-auto" />
      </button>
    </div>
  );
};