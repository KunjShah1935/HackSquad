import React from 'react';
import { Header } from './Header';
import { QuestionCard } from './QuestionCard';
import { Pagination } from './Pagination';
import { Question, User, FilterType } from '../types';
import { TrendingUp, Users, MessageSquare, Award } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

interface HomePageProps {
  questions: Question[];
  currentUser: User | null;
  searchQuery: string;
  filter: FilterType;
  currentPage: number;
  totalPages: number;
  onSearchChange: (query: string) => void;
  onFilterChange: (filter: FilterType) => void;
  onPageChange: (page: number) => void;
  onQuestionClick: (question: Question) => void;
  onLoginClick: () => void;
  onAskQuestionClick: () => void;
  onHomeClick: () => void;
  isDark: boolean;
  onThemeToggle: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  questions,
  currentUser,
  searchQuery,
  filter,
  currentPage,
  totalPages,
  onSearchChange,
  onFilterChange,
  onPageChange,
  onQuestionClick,
  onLoginClick,
  onAskQuestionClick,
  onHomeClick,
  isDark,
  onThemeToggle,
}) => {
  const stats = [
    { icon: MessageSquare, label: 'Questions', value: 1247, color: isDark ? 'text-blue-400' : 'text-purple-600' },
    { icon: Users, label: 'Users', value: 892, color: isDark ? 'text-green-400' : 'text-green-600' },
    { icon: Award, label: 'Answers', value: 3456, color: isDark ? 'text-yellow-400' : 'text-orange-600' },
    { icon: TrendingUp, label: 'Active Today', value: 156, color: isDark ? 'text-pink-400' : 'text-pink-600' },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header
        currentUser={currentUser}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        filter={filter}
        onFilterChange={onFilterChange}
        onLoginClick={onLoginClick}
        onAskQuestionClick={onAskQuestionClick}
        onHomeClick={onHomeClick}
        isDark={isDark}
        onThemeToggle={onThemeToggle}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`
                p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg
                ${isDark 
                  ? 'bg-gray-800 border border-gray-700 hover:shadow-2xl hover:shadow-blue-500/10' 
                  : 'bg-white border border-gray-200 hover:shadow-2xl hover:shadow-purple-500/10'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <AnimatedCounter 
                    value={stat.value} 
                    className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                  />
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {stat.label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Page Title */}
        <div className="mb-6 sm:mb-8">
          <h1 className={`
            text-3xl sm:text-4xl font-bold mb-3 transition-colors duration-300
            ${isDark ? 'text-white' : 'text-gray-900'}
          `}>
            {filter === 'newest' ? '🔥 Latest Questions' : '❓ Unanswered Questions'}
          </h1>
          <p className={`
            text-lg transition-colors duration-300
            ${isDark ? 'text-gray-300' : 'text-gray-600'}
          `}>
            {filter === 'newest' 
              ? 'Discover the most recent questions from our community'
              : 'Help the community by answering these questions'
            }
          </p>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {questions.length > 0 ? (
            questions.map((question, index) => (
              <div
                key={question.id}
                className="animate-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <QuestionCard
                  question={question}
                  onClick={() => onQuestionClick(question)}
                  isDark={isDark}
                />
              </div>
            ))
          ) : (
            <div className={`
              text-center py-16 rounded-2xl transition-all duration-300 shadow-lg
              ${isDark 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
              }
            `}>
              <div className="mb-4">
                <MessageSquare className={`
                  w-16 h-16 mx-auto mb-4 transition-colors duration-300
                  ${isDark ? 'text-gray-600' : 'text-gray-300'}
                `} />
              </div>
              <div className={`
                text-xl font-semibold mb-2 transition-colors duration-300
                ${isDark ? 'text-gray-300' : 'text-gray-600'}
              `}>
                No questions found
              </div>
              <p className={`
                text-base mb-6 transition-colors duration-300
                ${isDark ? 'text-gray-400' : 'text-gray-500'}
              `}>
                {searchQuery 
                  ? 'Try adjusting your search terms or explore different topics'
                  : 'Be the first to ask a question and start the conversation!'
                }
              </p>
              {!searchQuery && (
                <button
                  onClick={onAskQuestionClick}
                  className={`
                    px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg
                    ${isDark 
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25' 
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/25'
                    }
                  `}
                >
                  Ask the First Question
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          isDark={isDark}
        />
      </main>
    </div>
  );
};