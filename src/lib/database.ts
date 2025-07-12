import { MongoClient, Db, Collection } from 'mongodb';
import { Question, Answer, User, Notification } from '../types';

class DatabaseService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnected = false;

  // In a real app, these would come from environment variables
  private connectionString = 'mongodb://localhost:27017';
  private dbName = 'stackit';

  async connect(): Promise<void> {
    try {
      // For demo purposes, we'll simulate a MongoDB connection
      // In production, you would use: this.client = new MongoClient(this.connectionString);
      console.log('Connecting to MongoDB...');
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.isConnected = true;
      console.log('Connected to MongoDB successfully');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      console.log('Disconnected from MongoDB');
    }
  }

  private getCollection<T>(name: string): Collection<T> {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }
    // In a real implementation, this would return: this.db!.collection<T>(name);
    // For demo, we'll use localStorage as a fallback
    return {} as Collection<T>;
  }

  // Questions
  async getQuestions(): Promise<Question[]> {
    try {
      // Simulate database query
      const stored = localStorage.getItem('stackit_questions');
      const questions = stored ? JSON.parse(stored) : [];
      
      // Convert date strings back to Date objects
      return questions.map((question: any) => ({
        ...question,
        createdAt: new Date(question.createdAt),
        updatedAt: new Date(question.updatedAt),
        answers: question.answers.map((answer: any) => ({
          ...answer,
          createdAt: new Date(answer.createdAt)
        }))
      }));
    } catch (error) {
      console.error('Error fetching questions:', error);
      return [];
    }
  }

  async createQuestion(question: Question): Promise<Question> {
    try {
      const questions = await this.getQuestions();
      questions.unshift(question);
      localStorage.setItem('stackit_questions', JSON.stringify(questions));
      return question;
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  }

  async updateQuestion(id: string, updates: Partial<Question>): Promise<Question | null> {
    try {
      const questions = await this.getQuestions();
      const index = questions.findIndex(q => q.id === id);
      if (index === -1) return null;

      questions[index] = { ...questions[index], ...updates };
      localStorage.setItem('stackit_questions', JSON.stringify(questions));
      return questions[index];
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  }

  // Answers
  async addAnswer(questionId: string, answer: Answer): Promise<Answer> {
    try {
      const questions = await this.getQuestions();
      const questionIndex = questions.findIndex(q => q.id === questionId);
      if (questionIndex === -1) throw new Error('Question not found');

      questions[questionIndex].answers.push(answer);
      questions[questionIndex].updatedAt = new Date();
      localStorage.setItem('stackit_questions', JSON.stringify(questions));
      return answer;
    } catch (error) {
      console.error('Error adding answer:', error);
      throw error;
    }
  }

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const stored = localStorage.getItem(`stackit_notifications_${userId}`);
      const notifications = stored ? JSON.parse(stored) : [];
      
      // Convert date strings back to Date objects
      return notifications.map((notification: any) => ({
        ...notification,
        createdAt: new Date(notification.createdAt)
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async createNotification(notification: Notification): Promise<Notification> {
    try {
      const notifications = await this.getNotifications(notification.userId);
      notifications.unshift(notification);
      localStorage.setItem(`stackit_notifications_${notification.userId}`, JSON.stringify(notifications));
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      const notifications = await this.getNotifications(userId);
      const index = notifications.findIndex(n => n.id === notificationId);
      if (index !== -1) {
        notifications[index].read = true;
        localStorage.setItem(`stackit_notifications_${userId}`, JSON.stringify(notifications));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
      const notifications = await this.getNotifications(userId);
      notifications.forEach(n => n.read = true);
      localStorage.setItem(`stackit_notifications_${userId}`, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  // Users
  async getUsers(): Promise<User[]> {
    try {
      const stored = localStorage.getItem('stackit_users');
      const users = stored ? JSON.parse(stored) : [];
      
      // Convert date strings back to Date objects if users have date fields
      return users.map((user: any) => ({
        ...user,
        ...(user.createdAt && { createdAt: new Date(user.createdAt) })
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async createUser(user: User): Promise<User> {
    try {
      const users = await this.getUsers();
      users.push(user);
      localStorage.setItem('stackit_users', JSON.stringify(users));
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
}

export const db = new DatabaseService();