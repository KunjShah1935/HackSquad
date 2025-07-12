import React, { useState } from 'react';
import { Header } from './Header';
import { Home, ChevronUp, ChevronDown, Send, Award, Clock, User } from 'lucide-react';
import { Question, Answer, User as UserType } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { AnimatedCounter } from './AnimatedCounter';

interface QuestionDetailPageProps {
  question: Question;
  currentUser: UserType | null;
  onVoteQuestion: (questionId: string, direction: 'up' | 'down') => void;
  onVoteAnswer: (answerId: string, direction: 'up' | 'down') => void;
  onSubmitAnswer: (questionId: string, content: string) => void;
  onHomeClick: () => void;
  onLoginClick: () => void;
  onLogoutClick?: () => void;
  isDark: boolean;
  onThemeToggle: () => void;
}

export const QuestionDetailPage: React.FC<QuestionDetailPageProps> = ({
  question,
  currentUser,
  onVoteQuestion,
  onVoteAnswer,
  onSubmitAnswer,
  onHomeClick,
  onLoginClick,
  onLogoutClick,
  isDark,
  onThemeToggle,
}) => {
  const [answerContent, setAnswerContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerContent.trim() || !currentUser) return;

    setIsSubmitting(true);
    try {
      await onSubmitAnswer(question.id, answerContent.trim());
      setAnswerContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header
        currentUser={currentUser}
        searchQuery=""
        onSearchChange={() => {}}
        filter="newest"
        onFilterChange={() => {}}
        onLoginClick={onLoginClick}
        onLogoutClick={onLogoutClick}
        onAskQuestionClick={() => {}}
        onHomeClick={onHomeClick}
        showFilters={false}
        isDark={isDark}
        onThemeToggle={onThemeToggle}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className={`
          flex items-center space-x-2 text-sm mb-6 transition-colors duration-300
          ${isDark ? 'text-gray-400' : 'text-gray-500'}
        `}>
          <button
            onClick={onHomeClick}
            className={`
              flex items-center space-x-1 transition-all duration-300 transform hover:scale-105
              ${isDark ? 'hover:text-blue-400' : 'hover:text-purple-600'}
            `}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
          <span>/</span>
          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Question
          </span>
        </nav>

        {/* Question */}
        <div className={`
          rounded-2xl p-6 sm:p-8 mb-8 shadow-xl transition-all duration-300
          ${isDark 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
          }
        `}>
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Vote Controls */}
            <div className="flex sm:flex-col items-center sm:items-center gap-4 sm:gap-6 order-2 sm:order-1">
              <button
                onClick={() => onVoteQuestion(question.id, 'up')}
                disabled={!currentUser}
                className={`
                  p-3 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg
                  ${!currentUser
                    ? isDark 
                      ? 'bg-gray-700 text-gray-600 cursor-not-allowed' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isDark
                      ? 'bg-gray-700 hover:bg-green-600 text-green-400 hover:text-white border border-gray-600 hover:border-green-500'
                      : 'bg-gray-50 hover:bg-green-500 text-green-600 hover:text-white border border-gray-200 hover:border-green-500'
                  }
                `}
              >
                <ChevronUp className="w-6 h-6" />
              </button>
              
              <AnimatedCounter 
                value={question.votes} 
                className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
              />
              
              <button
                onClick={() => onVoteQuestion(question.id, 'down')}
                disabled={!currentUser}
                className={`
                  p-3 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg
                  ${!currentUser
                    ? isDark 
                      ? 'bg-gray-700 text-gray-600 cursor-not-allowed' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isDark
                      ? 'bg-gray-700 hover:bg-red-600 text-red-400 hover:text-white border border-gray-600 hover:border-red-500'
                      : 'bg-gray-50 hover:bg-red-500 text-red-600 hover:text-white border border-gray-200 hover:border-red-500'
                  }
                `}
              >
                <ChevronDown className="w-6 h-6" />
              </button>
            </div>

            {/* Question Content */}
            <div className="flex-1 order-1 sm:order-2">
              <h1 className={`
                text-2xl sm:text-3xl font-bold mb-6 transition-colors duration-300
                ${isDark ? 'text-white' : 'text-gray-900'}
              `}>
                {question.title}
              </h1>

              <div className="prose prose-gray max-w-none mb-6">
                <p className={`
                  text-base leading-relaxed whitespace-pre-wrap transition-colors duration-300
                  ${isDark ? 'text-gray-300' : 'text-gray-700'}
                `}>
                  {question.description}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {question.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`
                      px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-sm
                      ${isDark 
                        ? 'bg-blue-900/50 text-blue-300 border border-blue-700/50' 
                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }
                    `}
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Author Info */}
              <div className={`
                flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t transition-all duration-300
                ${isDark ? 'border-gray-700' : 'border-gray-200'}
              `}>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={question.author.avatar}
                      alt={question.author.username}
                      className="w-12 h-12 rounded-full border-2 border-current opacity-80 transition-all duration-300 hover:scale-110"
                    />
                    <div className={`
                      absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-current
                      ${isDark ? 'bg-green-400' : 'bg-green-500'}
                    `} />
                  </div>
                  <div>
                    <div className={`
                      flex items-center space-x-2 text-base font-semibold transition-colors duration-300
                      ${isDark ? 'text-gray-200' : 'text-gray-700'}
                    `}>
                      <User className="w-4 h-4" />
                      <span>{question.author.username}</span>
                    </div>
                    <div className={`
                      flex items-center space-x-1 text-sm transition-colors duration-300
                      ${isDark ? 'text-gray-400' : 'text-gray-500'}
                    `}>
                      <Clock className="w-3 h-3" />
                      <span>asked {formatDate(question.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                {question.updatedAt > question.createdAt && (
                  <div className={`
                    text-sm transition-colors duration-300
                    ${isDark ? 'text-gray-400' : 'text-gray-500'}
                  `}>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>modified {formatDate(question.updatedAt)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Answers */}
        <div className="mb-8">
          <h2 className={`
            text-2xl sm:text-3xl font-bold mb-6 transition-colors duration-300
            ${isDark ? 'text-white' : 'text-gray-900'}
          `}>
            💬 {question.answers.length} {question.answers.length === 1 ? 'Answer' : 'Answers'}
          </h2>

          <div className="space-y-6">
            {question.answers.map((answer, index) => (
              <div
                key={answer.id}
                className={`
                  rounded-2xl p-6 sm:p-8 shadow-xl transition-all duration-300 animate-in slide-in-from-bottom-4
                  ${isDark 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-white border border-gray-200'
                  }
                `}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Vote Controls */}
                  <div className="flex sm:flex-col items-center sm:items-center gap-4 sm:gap-4 order-2 sm:order-1">
                    <button
                      onClick={() => onVoteAnswer(answer.id, 'up')}
                      disabled={!currentUser}
                      className={`
                        p-2 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg
                        ${!currentUser
                          ? isDark 
                            ? 'bg-gray-700 text-gray-600 cursor-not-allowed' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : isDark
                            ? 'bg-gray-700 hover:bg-green-600 text-green-400 hover:text-white border border-gray-600 hover:border-green-500'
                            : 'bg-gray-50 hover:bg-green-500 text-green-600 hover:text-white border border-gray-200 hover:border-green-500'
                        }
                      `}
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>
                    
                    <AnimatedCounter 
                      value={answer.votes} 
                      className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                    />
                    
                    <button
                      onClick={() => onVoteAnswer(answer.id, 'down')}
                      disabled={!currentUser}
                      className={`
                        p-2 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg
                        ${!currentUser
                          ? isDark 
                            ? 'bg-gray-700 text-gray-600 cursor-not-allowed' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : isDark
                            ? 'bg-gray-700 hover:bg-red-600 text-red-400 hover:text-white border border-gray-600 hover:border-red-500'
                            : 'bg-gray-50 hover:bg-red-500 text-red-600 hover:text-white border border-gray-200 hover:border-red-500'
                        }
                      `}
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Answer Content */}
                  <div className="flex-1 order-1 sm:order-2">
                    <div className="prose prose-gray max-w-none mb-4">
                      <p className={`
                        text-base leading-relaxed whitespace-pre-wrap transition-colors duration-300
                        ${isDark ? 'text-gray-300' : 'text-gray-700'}
                      `}>
                        {answer.content}
                      </p>
                    </div>

                    {/* Author Info */}
                    <div className={`
                      flex items-center space-x-3 pt-4 border-t transition-all duration-300
                      ${isDark ? 'border-gray-700' : 'border-gray-200'}
                    `}>
                      <div className="relative">
                        <img
                          src={answer.author.avatar}
                          alt={answer.author.username}
                          className="w-8 h-8 rounded-full border-2 border-current opacity-80 transition-all duration-300 hover:scale-110"
                        />
                        <div className={`
                          absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-current
                          ${isDark ? 'bg-green-400' : 'bg-green-500'}
                        `} />
                      </div>
                      <div>
                        <div className={`
                          flex items-center space-x-2 text-sm font-semibold transition-colors duration-300
                          ${isDark ? 'text-gray-200' : 'text-gray-700'}
                        `}>
                          <Award className="w-3 h-3" />
                          <span>{answer.author.username}</span>
                        </div>
                        <div className={`
                          flex items-center space-x-1 text-xs transition-colors duration-300
                          ${isDark ? 'text-gray-400' : 'text-gray-500'}
                        `}>
                          <Clock className="w-3 h-3" />
                          <span>answered {formatDate(answer.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Answer */}
        <div className={`
          rounded-2xl p-6 sm:p-8 shadow-xl transition-all duration-300
          ${isDark 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
          }
        `}>
          <h3 className={`
            text-xl font-bold mb-6 transition-colors duration-300
            ${isDark ? 'text-white' : 'text-gray-900'}
          `}>
            ✍️ Your Answer
          </h3>
          
          {currentUser ? (
            <form onSubmit={handleSubmitAnswer} className="space-y-6">
              <textarea
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                placeholder="Write your answer here... Be detailed and helpful!"
                rows={8}
                className={`
                  w-full px-4 py-4 rounded-xl text-sm transition-all duration-300 transform focus:scale-[1.02] resize-vertical
                  ${isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                  }
                  border focus:outline-none shadow-sm hover:shadow-md
                `}
                required
              />
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={!answerContent.trim() || isSubmitting}
                  className={`
                    flex items-center justify-center space-x-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl
                    ${!answerContent.trim() || isSubmitting
                      ? isDark 
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : isDark
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25'
                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/25'
                    }
                  `}
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" isDark={isDark} />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Post Your Answer</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-12">
              <div className="mb-6">
                <User className={`
                  w-16 h-16 mx-auto mb-4 transition-colors duration-300
                  ${isDark ? 'text-gray-600' : 'text-gray-300'}
                `} />
              </div>
              <p className={`
                text-lg font-medium mb-4 transition-colors duration-300
                ${isDark ? 'text-gray-300' : 'text-gray-600'}
              `}>
                Join the conversation!
              </p>
              <p className={`
                text-base mb-6 transition-colors duration-300
                ${isDark ? 'text-gray-400' : 'text-gray-500'}
              `}>
                You need to be logged in to post an answer and help the community.
              </p>
              <button
                onClick={onLoginClick}
                className={`
                  px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl
                  ${isDark 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25' 
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/25'
                  }
                `}
              >
                Login to Answer
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};