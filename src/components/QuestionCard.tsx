import React from 'react';
import { ChevronUp, MessageCircle, Clock, User, Tag } from 'lucide-react';
import { Question } from '../types';
import { AnimatedCounter } from './AnimatedCounter';

interface QuestionCardProps {
  question: Question;
  onClick: () => void;
  isDark: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onClick, isDark }) => {
  const formatDate = (date: Date) => {
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  return (
    <div
      onClick={onClick}
      className={`
        group cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1
        ${isDark 
          ? 'bg-gray-800 border-gray-700 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10' 
          : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-500/10'
        }
        border rounded-2xl p-6 shadow-lg
      `}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-6">
        {/* Vote and Answer Stats */}
        <div className="flex sm:flex-col items-center sm:items-center gap-4 sm:gap-3 order-2 sm:order-1">
          <div className={`
            flex items-center sm:flex-col space-x-2 sm:space-x-0 sm:space-y-1 rounded-xl p-3 transition-all duration-300
            ${isDark ? 'bg-gray-700 group-hover:bg-gray-600' : 'bg-gray-50 group-hover:bg-gray-100'}
            shadow-sm group-hover:shadow-md
          `}>
            <ChevronUp className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
            <AnimatedCounter 
              value={question.votes} 
              className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
            />
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>votes</span>
          </div>
          
          <div className={`
            flex items-center sm:flex-col space-x-2 sm:space-x-0 sm:space-y-1 rounded-xl p-3 transition-all duration-300
            ${isDark ? 'bg-gray-700 group-hover:bg-gray-600' : 'bg-gray-50 group-hover:bg-gray-100'}
            shadow-sm group-hover:shadow-md
          `}>
            <MessageCircle className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-purple-600'}`} />
            <AnimatedCounter 
              value={question.answers.length} 
              className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
            />
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>answers</span>
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 order-1 sm:order-2 space-y-4">
          <h3 className={`
            text-lg sm:text-xl font-bold transition-all duration-300 group-hover:translate-x-1
            ${isDark 
              ? 'text-white group-hover:text-blue-400' 
              : 'text-gray-900 group-hover:text-purple-600'
            }
          `}>
            {question.title}
          </h3>
          
          <p className={`
            text-sm sm:text-base line-clamp-2 transition-all duration-300
            ${isDark ? 'text-gray-300' : 'text-gray-600'}
          `}>
            {question.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {question.tags.map((tag) => (
              <span
                key={tag}
                className={`
                  inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 transform hover:scale-105
                  ${isDark 
                    ? 'bg-blue-900/50 text-blue-300 border border-blue-700/50' 
                    : 'bg-purple-50 text-purple-700 border border-purple-200'
                  }
                  shadow-sm hover:shadow-md
                `}
              >
                <Tag className="w-3 h-3" />
                <span>{tag}</span>
              </span>
            ))}
          </div>

          {/* Author and Date */}
          <div className={`
            flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t transition-all duration-300
            ${isDark ? 'border-gray-700' : 'border-gray-200'}
          `}>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={question.author.avatar}
                  alt={question.author.username}
                  className="w-8 h-8 rounded-full border-2 border-current opacity-80 transition-all duration-300 group-hover:scale-110"
                />
                <div className={`
                  absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-current
                  ${isDark ? 'bg-green-400' : 'bg-green-500'}
                `} />
              </div>
              <div>
                <div className={`
                  flex items-center space-x-1 text-sm font-medium transition-all duration-300
                  ${isDark ? 'text-gray-200' : 'text-gray-700'}
                `}>
                  <User className="w-3 h-3" />
                  <span>{question.author.username}</span>
                </div>
              </div>
            </div>
            
            <div className={`
              flex items-center space-x-1 text-xs transition-all duration-300
              ${isDark ? 'text-gray-400' : 'text-gray-500'}
            `}>
              <Clock className="w-3 h-3" />
              <span>{formatDate(question.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};