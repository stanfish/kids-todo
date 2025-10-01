import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { Kid, Task, Achievement } from '@/types';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "demo-app-id",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Firebase configuration loaded successfully

// Connect to emulator in development (commented out for now)
// if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
//   try {
//     connectFirestoreEmulator(db, 'localhost', 8080);
//   } catch (error) {
//     // Emulator already connected
//   }
// }

// Collection names
export const COLLECTIONS = {
  KIDS: 'kids',
  TASKS: 'tasks',
  ACHIEVEMENTS: 'achievements',
} as const;

// Helper function to convert Firestore timestamp to Date
export const timestampToDate = (timestamp: any): Date => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp);
};

// Helper function to convert Date to Firestore timestamp
export const dateToTimestamp = (date: Date) => {
  return date;
};

// Data validation helpers
export const validateKid = (data: any): Kid => {
  if (!data.id || !data.name) {
    throw new Error('Invalid kid data: missing required fields');
  }
  return {
    id: data.id,
    name: data.name,
    avatar: data.avatar || 'boy1', // Default to 'boy1' if not provided
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt || data.createdAt || new Date()),
  };
};

export const validateTask = (data: any): Task => {
  if (!data.id || !data.kidId || !data.title || !data.date) {
    throw new Error('Invalid task data: missing required fields');
  }
  return {
    id: data.id,
    kidId: data.kidId,
    title: data.title,
    description: data.description || '',
    isCompleted: Boolean(data.isCompleted),
    date: data.date,
    isRecurring: Boolean(data.isRecurring),
    recurringDays: data.recurringDays || [],
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
    completedAt: data.completedAt ? timestampToDate(data.completedAt) : undefined,
  };
};

export const validateAchievement = (data: any): Achievement => {
  if (!data.id || !data.kidId || !data.date || !data.type) {
    throw new Error('Invalid achievement data: missing required fields');
  }
  return {
    id: data.id,
    kidId: data.kidId,
    date: data.date,
    earnedAt: timestampToDate(data.earnedAt),
    type: data.type,
  };
};

export default app;
