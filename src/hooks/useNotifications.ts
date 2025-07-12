import { useState, useEffect, useCallback } from 'react';
import { Notification, User } from '../types';
import { db } from '../lib/database';

export const useNotifications = (currentUser: User | null) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const createNotification = useCallback(async (
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    relatedId: string,
    relatedType: 'question' | 'answer'
  ) => {
    const notification: Notification = {
      id: Date.now().toString(),
      userId,
      type,
      title,
      message,
      relatedId,
      relatedType,
      read: false,
      createdAt: new Date(),
    };

    try {
      await db.createNotification(notification);
      
      // If the notification is for the current user, update local state
      if (currentUser && userId === currentUser.id) {
        setNotifications(prev => [notification, ...prev]);
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }, [currentUser]);

  const notifyQuestionAnswered = useCallback(async (
    questionAuthorId: string,
    questionTitle: string,
    answererUsername: string,
    questionId: string
  ) => {
    if (questionAuthorId === currentUser?.id) return; // Don't notify self
    
    await createNotification(
      questionAuthorId,
      'question_answered',
      'New Answer',
      `${answererUsername} answered your question "${questionTitle}"`,
      questionId,
      'question'
    );
  }, [createNotification, currentUser]);

  const notifyAnswerVoted = useCallback(async (
    answerAuthorId: string,
    voterUsername: string,
    answerId: string,
    voteType: 'up' | 'down'
  ) => {
    if (answerAuthorId === currentUser?.id) return; // Don't notify self
    
    await createNotification(
      answerAuthorId,
      'answer_voted',
      `Answer ${voteType === 'up' ? 'Upvoted' : 'Downvoted'}`,
      `${voterUsername} ${voteType === 'up' ? 'upvoted' : 'downvoted'} your answer`,
      answerId,
      'answer'
    );
  }, [createNotification, currentUser]);

  const notifyQuestionVoted = useCallback(async (
    questionAuthorId: string,
    voterUsername: string,
    questionTitle: string,
    questionId: string,
    voteType: 'up' | 'down'
  ) => {
    if (questionAuthorId === currentUser?.id) return; // Don't notify self
    
    await createNotification(
      questionAuthorId,
      'question_voted',
      `Question ${voteType === 'up' ? 'Upvoted' : 'Downvoted'}`,
      `${voterUsername} ${voteType === 'up' ? 'upvoted' : 'downvoted'} your question "${questionTitle}"`,
      questionId,
      'question'
    );
  }, [createNotification, currentUser]);

  const notifyNewQuestion = useCallback(async (
    questionTitle: string,
    authorUsername: string,
    questionId: string,
    tags: string[]
  ) => {
    // In a real app, you'd notify users who follow these tags or are interested
    // For demo, we'll skip this to avoid spam
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      if (currentUser) {
        try {
          const userNotifications = await db.getNotifications(currentUser.id);
          setNotifications(userNotifications);
        } catch (error) {
          console.error('Error loading notifications:', error);
        }
      } else {
        setNotifications([]);
      }
    };

    loadNotifications();
  }, [currentUser]);

  return {
    notifications,
    notifyQuestionAnswered,
    notifyAnswerVoted,
    notifyQuestionVoted,
    notifyNewQuestion,
  };
};