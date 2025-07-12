import { Question, User } from '../types';

export const mockUsers: User[] = [
  { id: '1', username: 'john_dev', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1' },
  { id: '2', username: 'sarah_code', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1' },
  { id: '3', username: 'mike_tech', avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1' },
  { id: '4', username: 'alex_web', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1' },
];

export const mockQuestions: Question[] = [
  {
    id: '1',
    title: 'How to implement authentication in React with TypeScript?',
    description: 'I\'m building a React application with TypeScript and need to implement user authentication. What are the best practices for handling login, logout, and protecting routes?',
    tags: ['react', 'typescript', 'authentication'],
    author: mockUsers[0],
    votes: 15,
    answers: [
      {
        id: '1',
        content: 'You can use React Context API along with JWT tokens. Create an AuthContext that manages the authentication state and provides login/logout functions.',
        author: mockUsers[1],
        votes: 8,
        createdAt: new Date('2024-01-15T10:30:00Z'),
        questionId: '1'
      },
      {
        id: '2',
        content: 'I recommend using a library like Auth0 or Firebase Auth for production applications. They handle security best practices and provide easy integration.',
        author: mockUsers[2],
        votes: 12,
        createdAt: new Date('2024-01-15T14:20:00Z'),
        questionId: '1'
      }
    ],
    createdAt: new Date('2024-01-15T09:00:00Z'),
    updatedAt: new Date('2024-01-15T14:20:00Z')
  },
  {
    id: '2',
    title: 'Best practices for state management in large React applications?',
    description: 'As my React application grows, managing state becomes more complex. Should I use Redux, Zustand, or stick with React Context? What are the trade-offs?',
    tags: ['react', 'state-management', 'redux', 'zustand'],
    author: mockUsers[1],
    votes: 23,
    answers: [
      {
        id: '3',
        content: 'For large applications, I recommend Redux Toolkit. It reduces boilerplate and provides excellent DevTools support.',
        author: mockUsers[3],
        votes: 15,
        createdAt: new Date('2024-01-14T16:45:00Z'),
        questionId: '2'
      }
    ],
    createdAt: new Date('2024-01-14T15:30:00Z'),
    updatedAt: new Date('2024-01-14T16:45:00Z')
  },
  {
    id: '3',
    title: 'How to optimize React performance for large lists?',
    description: 'I have a component that renders thousands of items in a list. The performance is poor and scrolling is laggy. What techniques can I use to optimize this?',
    tags: ['react', 'performance', 'optimization'],
    author: mockUsers[2],
    votes: 18,
    answers: [],
    createdAt: new Date('2024-01-13T11:15:00Z'),
    updatedAt: new Date('2024-01-13T11:15:00Z')
  },
  {
    id: '4',
    title: 'TypeScript generic constraints best practices?',
    description: 'I\'m working with complex TypeScript generics and struggling with constraints. How do I properly constrain generic types while maintaining flexibility?',
    tags: ['typescript', 'generics', 'types'],
    author: mockUsers[3],
    votes: 7,
    answers: [
      {
        id: '4',
        content: 'Use extends keyword for constraints. For example: function process<T extends string | number>(value: T): T { return value; }',
        author: mockUsers[0],
        votes: 5,
        createdAt: new Date('2024-01-12T13:20:00Z'),
        questionId: '4'
      }
    ],
    createdAt: new Date('2024-01-12T12:00:00Z'),
    updatedAt: new Date('2024-01-12T13:20:00Z')
  },
  {
    id: '5',
    title: 'CSS Grid vs Flexbox: When to use which?',
    description: 'I often get confused about when to use CSS Grid versus Flexbox. Can someone explain the key differences and use cases for each?',
    tags: ['css', 'grid', 'flexbox', 'layout'],
    author: mockUsers[0],
    votes: 31,
    answers: [
      {
        id: '5',
        content: 'Use Flexbox for one-dimensional layouts (rows or columns) and CSS Grid for two-dimensional layouts (rows and columns together).',
        author: mockUsers[2],
        votes: 20,
        createdAt: new Date('2024-01-11T09:15:00Z'),
        questionId: '5'
      }
    ],
    createdAt: new Date('2024-01-11T08:00:00Z'),
    updatedAt: new Date('2024-01-11T09:15:00Z')
  },
  {
    id: '6',
    title: 'How to handle async operations in React hooks?',
    description: 'I\'m struggling with handling async operations inside useEffect. Sometimes I get warnings about memory leaks. What\'s the proper way to handle this?',
    tags: ['react', 'hooks', 'async', 'useeffect'],
    author: mockUsers[1],
    votes: 12,
    answers: [],
    createdAt: new Date('2024-01-10T14:30:00Z'),
    updatedAt: new Date('2024-01-10T14:30:00Z')
  }
];