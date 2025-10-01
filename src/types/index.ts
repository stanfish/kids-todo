// Core data models for the Kids Todo App

export type AvatarType = 'boy1' | 'boy2' | 'boy3' | 'girl1' | 'girl2' | 'girl3' | 'neutral1' | 'neutral2' | 'neutral3';

export interface Kid {
  id: string;
  name: string;
  avatar: AvatarType;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  kidId: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  date?: string | null; // YYYY-MM-DD format - optional for undated tasks
  isRecurring: boolean;
  recurringDays?: number[]; // 0-6 (Sunday-Saturday)
  points?: number; // Points earned for completing the task
  category?: string; // Category of the task (e.g., 'chores', 'homework')
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly'; // Recurrence pattern
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface Achievement {
  id: string;
  kidId: string;
  date: string; // YYYY-MM-DD format
  earnedAt: Date;
  type: 'excellent_day'; // Future: could add more achievement types
}

export interface AppState {
  selectedKid: Kid | null;
  selectedDate: string; // YYYY-MM-DD format
  kids: Kid[];
  tasks: Task[];
  achievements: Achievement[];
  isLoading: boolean;
  error: string | null;
}

// Form types
export interface AddKidForm {
  name: string;
  avatar: AvatarType;
}

export interface AddTaskForm {
  title: string;
  description?: string;
  isRecurring: boolean;
  recurringDays?: number[];
  targetKids: string[]; // Array of kid IDs
  points?: number;
  category?: string;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface EditTaskForm {
  title: string;
  description?: string;
}

// UI State types
export interface ModalState {
  isOpen: boolean;
  type: 'addKid' | 'addTask' | 'editTask' | 'calendar' | null;
  data?: any;
}

// Date utility types
export interface DateRange {
  start: Date;
  end: Date;
}

export interface CalendarDay {
  date: Date;
  isToday: boolean;
  isSelected: boolean;
  hasTasks: boolean;
  isCompleted: boolean;
  achievement?: Achievement;
}

