import React, { useState } from 'react';
import { Header } from './Header';
import { Home, Send, Lightbulb, Target, Code, Users } from 'lucide-react';
import { User } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface AskQuestionPageProps {
  currentUser: User | null;
  onSubmit: (title: string, description: string, tags: string[]) => void;
  onHomeClick: () => void;
  onLoginClick: () => void;
  isDark: boolean;
  onThemeToggle: () => void;
}

export const AskQuestionPage: React.FC<AskQuestionPageProps> = ({
  currentUser,
  onSubmit,
  onHomeClick,
  onLoginClick,
  isDark,
  onThemeToggle,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);

    try {
      await onSubmit(title.trim(), description.trim(), tags);
      // Reset form
      setTitle('');
      setDescription('');
      setTagsInput('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tips = [
    { icon: Target, title: 'Be Specific', desc: 'Make your title clear and descriptive' },
    { icon: Code, title: 'Include Code', desc: 'Add relevant code snippets and error messages' },
    { icon: Lightbulb, title: 'Show Research', desc: 'Explain what you\'ve already tried' },
    { icon: Users, title: 'Use Tags', desc: 'Add appropriate tags to help others find your question' },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header
        currentUser={currentUser}
        searchQuery=""
        onSearchChange={() => {}}
        filter="newest"
        onFilterChange={() => {}}
        onLoginClick={onLoginClick}
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
            Ask a Question
          </span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className={`
            text-3xl sm:text-4xl font-bold mb-3 transition-colors duration-300
            ${isDark ? 'text-white' : 'text-gray-900'}
          `}>
            🚀 Ask a Question
          </h1>
          <p className={`
            text-lg transition-colors duration-300
            ${isDark ? 'text-gray-300' : 'text-gray-600'}
          `}>
            Get help from our amazing community by asking a detailed question
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Question Form */}
          <div className="lg:col-span-2">
            <div className={`
              rounded-2xl p-6 sm:p-8 shadow-xl transition-all duration-300
              ${isDark 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
              }
            `}>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className={`
                    block text-sm font-semibold mb-3 transition-colors duration-300
                    ${isDark ? 'text-gray-200' : 'text-gray-700'}
                  `}>
                    Question Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What's your programming question? Be specific and clear..."
                    className={`
                      w-full px-4 py-4 rounded-xl text-sm transition-all duration-300 transform focus:scale-[1.02]
                      ${isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                      }
                      border focus:outline-none shadow-sm hover:shadow-md
                    `}
                    required
                  />
                  <p className={`
                    text-xs mt-2 transition-colors duration-300
                    ${isDark ? 'text-gray-400' : 'text-gray-500'}
                  `}>
                    💡 Be specific and imagine you're asking a question to another person
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className={`
                    block text-sm font-semibold mb-3 transition-colors duration-300
                    ${isDark ? 'text-gray-200' : 'text-gray-700'}
                  `}>
                    Detailed Description *
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide all the details someone would need to understand and answer your question. Include code snippets, error messages, and what you've tried..."
                    rows={10}
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
                  <p className={`
                    text-xs mt-2 transition-colors duration-300
                    ${isDark ? 'text-gray-400' : 'text-gray-500'}
                  `}>
                    📝 Include any error messages, code snippets, or steps you've already tried
                  </p>
                </div>

                {/* Tags */}
                <div>
                  <label htmlFor="tags" className={`
                    block text-sm font-semibold mb-3 transition-colors duration-300
                    ${isDark ? 'text-gray-200' : 'text-gray-700'}
                  `}>
                    Tags
                  </label>
                  <input
                    type="text"
                    id="tags"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="javascript, react, typescript, css (comma-separated)"
                    className={`
                      w-full px-4 py-4 rounded-xl text-sm transition-all duration-300 transform focus:scale-[1.02]
                      ${isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                      }
                      border focus:outline-none shadow-sm hover:shadow-md
                    `}
                  />
                  <p className={`
                    text-xs mt-2 transition-colors duration-300
                    ${isDark ? 'text-gray-400' : 'text-gray-500'}
                  `}>
                    🏷️ Add up to 5 tags to describe what your question is about
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    type="submit"
                    disabled={!title.trim() || !description.trim() || isSubmitting}
                    className={`
                      flex items-center justify-center space-x-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl
                      ${!title.trim() || !description.trim() || isSubmitting
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
                        <span>Post Your Question</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={onHomeClick}
                    className={`
                      px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg
                      ${isDark 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                      }
                    `}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Tips Sidebar */}
          <div className="space-y-6">
            <div className={`
              rounded-2xl p-6 shadow-xl transition-all duration-300
              ${isDark 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
              }
            `}>
              <h3 className={`
                text-lg font-bold mb-4 transition-colors duration-300
                ${isDark ? 'text-white' : 'text-gray-900'}
              `}>
                💡 Tips for Great Questions
              </h3>
              <div className="space-y-4">
                {tips.map((tip, index) => (
                  <div
                    key={index}
                    className={`
                      flex items-start space-x-3 p-3 rounded-xl transition-all duration-300 transform hover:scale-105
                      ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}
                    `}
                  >
                    <div className={`
                      p-2 rounded-lg
                      ${isDark ? 'bg-gray-600' : 'bg-white'}
                    `}>
                      <tip.icon className={`
                        w-4 h-4
                        ${isDark ? 'text-blue-400' : 'text-purple-600'}
                      `} />
                    </div>
                    <div>
                      <h4 className={`
                        text-sm font-semibold mb-1 transition-colors duration-300
                        ${isDark ? 'text-white' : 'text-gray-900'}
                      `}>
                        {tip.title}
                      </h4>
                      <p className={`
                        text-xs transition-colors duration-300
                        ${isDark ? 'text-gray-400' : 'text-gray-600'}
                      `}>
                        {tip.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Stats */}
            <div className={`
              rounded-2xl p-6 shadow-xl transition-all duration-300
              ${isDark 
                ? 'bg-gradient-to-br from-blue-900/50 to-purple-900/50 border border-gray-700' 
                : 'bg-gradient-to-br from-purple-50 to-blue-50 border border-gray-200'
              }
            `}>
              <h3 className={`
                text-lg font-bold mb-4 transition-colors duration-300
                ${isDark ? 'text-white' : 'text-gray-900'}
              `}>
                🌟 Join Our Community
              </h3>
              <div className="space-y-3">
                <div className={`
                  text-sm transition-colors duration-300
                  ${isDark ? 'text-gray-300' : 'text-gray-600'}
                `}>
                  • Get answers from experienced developers
                </div>
                <div className={`
                  text-sm transition-colors duration-300
                  ${isDark ? 'text-gray-300' : 'text-gray-600'}
                `}>
                  • Build your reputation by helping others
                </div>
                <div className={`
                  text-sm transition-colors duration-300
                  ${isDark ? 'text-gray-300' : 'text-gray-600'}
                `}>
                  • Learn from real-world coding challenges
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};