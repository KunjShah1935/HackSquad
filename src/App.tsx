import React, { useState, useMemo } from 'react';
import { HomePage } from './components/HomePage';
import { AskQuestionPage } from './components/AskQuestionPage';
import { QuestionDetailPage } from './components/QuestionDetailPage';
import { FloatingActionButton } from './components/FloatingActionButton';
import { AuthModal } from './components/AuthModal';
import { mockQuestions, mockUsers } from './data/mockData';
import { Question, User, FilterType, Answer } from './types';
import { useNotifications } from './hooks/useNotifications';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import { db } from './lib/database';

type Page = 'home' | 'ask' | 'question';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('newest');
  const [pageNumber, setPageNumber] = useState(1);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const { isDark, toggleTheme } = useTheme();
  const { user: currentUser, isAuthenticated, login, logout } = useAuth();

  const {
    notifyQuestionAnswered,
    notifyAnswerVoted,
    notifyQuestionVoted,
    notifyNewQuestion,
  } = useNotifications(currentUser);

  const questionsPerPage = 5;

  // Initialize database connection and load data
  React.useEffect(() => {
    const initializeApp = async () => {
      try {
        await db.connect();
        
        // Load questions from database or initialize with mock data
        const dbQuestions = await db.getQuestions();
        if (dbQuestions.length === 0) {
          // Initialize with mock data
          for (const question of mockQuestions) {
            await db.createQuestion(question);
          }
          setQuestions(mockQuestions);
        } else {
          setQuestions(dbQuestions);
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
        // Fallback to mock data
        setQuestions(mockQuestions);
      }
    };

    initializeApp();
  }, []);

  // Filter and search questions
  const filteredQuestions = useMemo(() => {
    let filtered = questions;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.title.toLowerCase().includes(query) ||
          q.description.toLowerCase().includes(query) ||
          q.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply filter
    if (filter === 'unanswered') {
      filtered = filtered.filter((q) => q.answers.length === 0);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    return filtered;
  }, [questions, searchQuery, filter]);

  // Pagination
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
  const paginatedQuestions = filteredQuestions.slice(
    (pageNumber - 1) * questionsPerPage,
    pageNumber * questionsPerPage
  );

  const handleLogin = () => {
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: User) => {
    login(user);
    setIsAuthModalOpen(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleAskQuestion = () => {
    setCurrentPage('ask');
  };

  const handleQuestionClick = (question: Question) => {
    setSelectedQuestion(question);
    setCurrentPage('question');
  };

  const handleHomeClick = () => {
    setCurrentPage('home');
    setSelectedQuestion(null);
  };

  const handleSubmitQuestion = (title: string, description: string, tags: string[]) => {
    if (!currentUser) return;

    const newQuestion: Question = {
      id: Date.now().toString(),
      title,
      description,
      tags,
      author: currentUser,
      votes: 0,
      answers: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to database
    db.createQuestion(newQuestion).then(() => {
      setQuestions((prev) => [newQuestion, ...prev]);
      
      // Notify about new question (in a real app, this would notify followers)
      notifyNewQuestion(title, currentUser.username, newQuestion.id, tags);
    }).catch(error => {
      console.error('Error saving question:', error);
      // Still update UI for demo
      setQuestions((prev) => [newQuestion, ...prev]);
    });
    
    setCurrentPage('home');
  };

  const handleVoteQuestion = (questionId: string, direction: 'up' | 'down') => {
    if (!currentUser) return;

    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, votes: q.votes + (direction === 'up' ? 1 : -1) }
          : q
      )
    );

    // Notify question author about the vote
    notifyQuestionVoted(
      question.author.id,
      currentUser.username,
      question.title,
      questionId,
      direction
    );

    // Update selected question if it's the one being voted on
    if (selectedQuestion?.id === questionId) {
      setSelectedQuestion((prev) =>
        prev
          ? { ...prev, votes: prev.votes + (direction === 'up' ? 1 : -1) }
          : null
      );
    }
  };

  const handleVoteAnswer = (answerId: string, direction: 'up' | 'down') => {
    if (!currentUser) return;

    // Find the answer to get author info
    let answerAuthor: User | null = null;
    for (const question of questions) {
      const answer = question.answers.find(a => a.id === answerId);
      if (answer) {
        answerAuthor = answer.author;
        break;
      }
    }

    const updateAnswerVotes = (answers: Answer[]) =>
      answers.map((a) =>
        a.id === answerId
          ? { ...a, votes: a.votes + (direction === 'up' ? 1 : -1) }
          : a
      );

    setQuestions((prev) =>
      prev.map((q) => ({
        ...q,
        answers: updateAnswerVotes(q.answers),
      }))
    );

    // Notify answer author about the vote
    if (answerAuthor) {
      notifyAnswerVoted(answerAuthor.id, currentUser.username, answerId, direction);
    }

    if (selectedQuestion) {
      setSelectedQuestion((prev) =>
        prev
          ? { ...prev, answers: updateAnswerVotes(prev.answers) }
          : null
      );
    }
  };

  const handleSubmitAnswer = (questionId: string, content: string) => {
    if (!currentUser) return;

    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const newAnswer: Answer = {
      id: Date.now().toString(),
      content,
      author: currentUser,
      votes: 0,
      createdAt: new Date(),
      questionId,
    };

    // Save to database
    db.addAnswer(questionId, newAnswer).then(() => {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? { ...q, answers: [...q.answers, newAnswer], updatedAt: new Date() }
            : q
        )
      );
      
      // Notify question author about the new answer
      notifyQuestionAnswered(
        question.author.id,
        question.title,
        currentUser.username,
        questionId
      );
    }).catch(error => {
      console.error('Error saving answer:', error);
      // Still update UI for demo
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? { ...q, answers: [...q.answers, newAnswer], updatedAt: new Date() }
            : q
        )
      );
    });

    if (selectedQuestion?.id === questionId) {
      setSelectedQuestion((prev) =>
        prev
          ? { ...prev, answers: [...prev.answers, newAnswer], updatedAt: new Date() }
          : null
      );
    }
  };

  const handlePageChange = (page: number) => {
    setPageNumber(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPageNumber(1); // Reset to first page when searching
  };

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    setPageNumber(1); // Reset to first page when filtering
  };

  if (currentPage === 'ask') {
    return (
      <div className={isDark ? 'dark' : ''}>
        <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <AskQuestionPage
          currentUser={currentUser}
          onSubmit={handleSubmitQuestion}
          onHomeClick={handleHomeClick}
          onLoginClick={handleLogin}
          onLogoutClick={currentUser ? handleLogout : undefined}
          isDark={isDark}
          onThemeToggle={toggleTheme}
        />
        </div>
      </div>
    );
  }

  if (currentPage === 'question' && selectedQuestion) {
    return (
      <div className={isDark ? 'dark' : ''}>
        <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <QuestionDetailPage
          question={selectedQuestion}
          currentUser={currentUser}
          onVoteQuestion={handleVoteQuestion}
          onVoteAnswer={handleVoteAnswer}
          onSubmitAnswer={handleSubmitAnswer}
          onHomeClick={handleHomeClick}
          onLoginClick={handleLogin}
          onLogoutClick={currentUser ? handleLogout : undefined}
          isDark={isDark}
          onThemeToggle={toggleTheme}
        />
        </div>
      </div>
    );
  }

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <HomePage
          questions={paginatedQuestions}
          currentUser={currentUser}
          searchQuery={searchQuery}
          filter={filter}
          currentPage={pageNumber}
          totalPages={totalPages}
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
          onPageChange={handlePageChange}
          onQuestionClick={handleQuestionClick}
          onLoginClick={handleLogin}
          onLogoutClick={currentUser ? handleLogout : undefined}
          onAskQuestionClick={handleAskQuestion}
          onHomeClick={handleHomeClick}
          isDark={isDark}
          onThemeToggle={toggleTheme}
        />
        
        <FloatingActionButton 
          onAskQuestion={handleAskQuestion}
          isDark={isDark}
        />
        
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={handleAuthSuccess}
          isDark={isDark}
        />
      </div>
    </div>
  );
}

export default App;