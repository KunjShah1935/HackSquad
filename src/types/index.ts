export interface User {
  id: string;
  username: string;
  avatar?: string;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  tags: string[];
  author: User;
  votes: number;
  answers: Answer[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Answer {
  id: string;
  content: string;
  author: User;
  votes: number;
  createdAt: Date;
  questionId: string;
}

export interface Vote {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'question' | 'answer';
  value: 1 | -1;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'question_answered' | 'answer_voted' | 'question_voted' | 'new_question';
  title: string;
  message: string;
  relatedId: string;
  relatedType: 'question' | 'answer';
  read: boolean;
  createdAt: Date;
}

export interface DatabaseConfig {
  connectionString: string;
  dbName: string;
}